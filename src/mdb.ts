import mongoose from 'mongoose';
import log from 'electron-log';
import vm from 'vm';
import fs from 'fs';
import json2csv from 'json2csv';

import {
  FilterType,
  SchemaDefinitionType,
  SchemaEtcType,
  DataRowType,
  QueryDataType,
} from './types';

mongoose.pluralize(null);
mongoose.set('debug', (coll, method, query, doc, options) => {
  log.info(
    `${coll}.${method}.(${JSON.stringify(query)})`,
    JSON.stringify(doc),
    options || ''
  );
});

const defOptions = {
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

interface SuggestsType {
  [key: string]: string[];
}
interface SchemaType extends Document {
  name: string;
  memo: string;
  definition: SchemaDefinitionType;
  suggests: SuggestsType;
}

const schemaDef = {
  name: String,
  memo: String,
  definition: mongoose.Schema.Types.Mixed,
  suggests: mongoose.Schema.Types.Mixed,
};

interface QueryType extends Document {
  name: string;
  memo: string;
  params: string[];
  code: string;
}
const queryDef = {
  name: String,
  memo: String,
  params: [String],
  code: String,
};

interface ModelsType {
  [key: string]: mongoose.Model;
}

const getType = (_field: string, _row: DataRowType) => {
  // const cell = row[field];
  // if (cell) {
  //   if (typeof cell === 'number') {
  //     return 'Number';
  //   }
  //   if (typeof cell === 'boolean') {
  //     return 'Boolean';
  //   }
  //   if (dayjs(cell).isValid()) {
  //     return 'Date';
  //   }
  // }

  return 'String';
};

const getSuggests = (fields: string[], docs: DataRowType[]) =>
  fields
    .map((f) => {
      const colUniqData = [...new Set(docs.map((r) => r[f]).filter(Boolean))];
      if (colUniqData.length < 50 && docs.length / colUniqData.length > 10) {
        return {
          field: f,
          suggest: colUniqData,
        };
      }
      return null;
    })
    .reduce((r, v) => {
      if (v && v.suggest && v.suggest.length > 0) {
        r[v.field] = v.suggest;
      }
      return r;
    }, {});

export const genSchemaDefinition = (docs: DataRowType[]) => {
  if (!docs || docs.length === 0) {
    return [];
  }
  const fields = [...new Set(docs.map((doc) => Object.keys(doc)).flat())]
    .map((f) => ({
      field: f,
      type: getType(f, docs[0]),
    }))
    .reduce((r, v) => {
      r[v.field] = {
        type: v.type,
      };
      return r;
    }, {});
  return fields;
};

export default class Mdb {
  SchemaModel: mongoose.Model<SchemaType>;
  QueryModel: mongoose.Model<QueryType>;
  models: ModelsType = {};

  constructor() {
    // scheme
    const schemaSchema: mongoose.Schema = mongoose.Schema(
      schemaDef,
      defOptions
    );
    this.SchemaModel = mongoose.model('s_c_h_e_m_a_s', schemaSchema);

    // query
    const querySchema: mongoose.Schema = mongoose.Schema(queryDef, defOptions);
    this.QueryModel = mongoose.model('q_u_e_r_y_s', querySchema);

    this.getAllSchemaModels();
  }

  // name: lowercased
  async createSchema(
    name: string,
    definition: SchemaDefinitionType,
    etc: SchemaEtcType
  ) {
    const schemaDoc = await this.changeSchema(name, definition, etc);
    return schemaDoc;
  }

  async changeSchema(
    name: string,
    definition: SchemaDefinitionType,
    etc: SchemaEtcType = {}
  ) {
    const schemaDoc: SchemaType = await this.SchemaModel.findOneAndUpdate(
      {
        name,
      },
      {
        name,
        definition,
        ...etc,
      },
      {
        upsert: true,
        new: true,
      }
    ).lean();

    if (this.models[name]) {
      mongoose.deleteModel(name);
      delete this.models[name];
    }

    return schemaDoc;
  }

  async dropSchema(name: string) {
    const dropCollection = async (name: string) =>
      new Promise((resolve, _reject) => {
        mongoose.connection.db.dropCollection(
          name,
          (err: unknown, result: unknown) => {
            log.info('err, result:', err, result);
            if (err) {
              log.error('err:', err);
            }
            resolve();
          }
        );
      });
    await dropCollection(name);
    const result = await this.SchemaModel.deleteMany({
      name,
    });
    if (this.models[name]) {
      mongoose.deleteModel(name);
      delete this.models[name];
    }
    return result;
  }

  async snapshot() {
    //
  }

  async writeCSV(name: string, file: string) {
    const Model = await this.getSchemaModel(name);
    const docs = await Model.find().lean();

    const definition = genSchemaDefinition(docs);
    const opts = { fields: Object.keys(definition) };

    const parser = new json2csv.Parser(opts);
    const csv = parser.parse(docs);
    fs.writeFileSync(file, csv);
  }

  // all docs
  async analysisSchema(name: string, save = false) {
    const Model = await this.getSchemaModel(name);
    const docs = await Model.find().lean();

    const definition = genSchemaDefinition(docs);
    if (save) {
      await this.changeSchema(name, definition);
    }

    return definition;
  }

  async getSchemas() {
    const schemas: [SchemaType] = await this.SchemaModel.find().lean();
    return schemas;
  }

  async getDashboardSchemas() {
    const schemas: [SchemaType] = await this.SchemaModel.find().lean();
    const dashboardSchemas = await Promise.all(
      schemas.map(async (schema: SchemaType) => {
        const Model = await this.getSchemaModel(schema.name);
        const rowCount = await Model.countDocuments();
        return {
          ...schema,
          rowCount,
          colCount: Object.keys(schema.definition).length,
        };
      })
    );
    return dashboardSchemas;
  }

  async getSchemaNames() {
    const schemas = await this.getSchemas();
    return schemas.map((s) => s.name);
  }

  async getSchema(name: string) {
    const schema: SchemaType = await this.SchemaModel.findOne({
      name,
    }).lean();
    return schema;
  }

  _createModel(name: string, definition: SchemaDefinitionType) {
    const sampleSchema: mongoose.Schema = new mongoose.Schema(
      definition,
      defOptions,
      {
        strict: false,
      }
    );
    const model = mongoose.model(name, sampleSchema);
    return model;
  }

  async getSchemaModel(name: string) {
    if (this.models[name]) {
      return this.models[name];
    }

    const schemaData: SchemaType = await this.SchemaModel.findOne({
      name,
    }).lean();

    const model = this._createModel(name, schemaData.definition);
    this.models[name] = model;
    return model;
  }

  async getAllSchemaModels() {
    const schemaDatas: [SchemaType] = await this.SchemaModel.find().lean();

    const models = schemaDatas.reduce((r, schemaData) => {
      r[schemaData.name] = this._createModel(
        schemaData.name,
        schemaData.definition
      );
      return r;
    }, {});
    this.models = models;
  }

  async reIndexSuggests(Model: mongoose.Model, name: String) {
    const schema: SchemaType = await this.SchemaModel.findOne({
      name,
    }).lean();
    const fields = Object.keys(schema.definition);
    const docs = await Model.find();
    const suggests = getSuggests(fields, docs);

    await this.SchemaModel.findOneAndUpdate(
      {
        name,
      },
      {
        suggests,
      }
    );
  }

  async reIndexAllSuggests(models: ModelsType) {
    const all = await Promise.all(
      Object.keys(models).map(async (name) => {
        const Model = models[name];
        await this.reIndexSuggests(Model, name);
      })
    );
    return all;
  }

  async createQuery(name: string, data = {}) {
    const queryDoc = await this.QueryModel.findOneAndUpdate(
      {
        name,
      },
      {
        name,
        ...data,
      },
      {
        upsert: true,
        new: true,
      }
    ).lean();

    return queryDoc;
  }

  async dropQuery(name: string) {
    const result = await this.QueryModel.deleteMany({
      name,
    });

    return result;
  }

  async getQueries() {
    const queries: QueryType = await this.QueryModel.find().lean();
    return queries;
  }

  async getQuery(name: string) {
    const query = await this.QueryModel.findOne({
      name,
    }).lean();
    return query;
  }

  async queryCode(code: string, filter: FilterType) {
    const { models } = this;
    return new Promise((resolve, reject) => {
      const callback = (err: unknown, data: QueryDataType) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      };
      log.info('run vm:', code, filter);
      vm.runInThisContext(code)({ models, filter, log, callback });
    });
  }
}
