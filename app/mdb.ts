import mongoose from 'mongoose';
import log from 'electron-log';

import vm from 'vm';
import pluralize from 'pluralize';

import fs from 'fs';
import dayjs from 'dayjs';
import json2csv from 'json2csv';

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

const schemaDef = {
  name: String,
  definition: mongoose.Schema.Types.Mixed,
  suggests: mongoose.Schema.Types.Mixed,
};

const queryDef = {
  name: String,
  params: [String],
  code: String,
};

const getType = (field, row) => {
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

const getSuggests = (field, docs) =>
  field
    .map((f) => {
      const colUniqData = [...new Set(docs.map((r) => r[f]).filter(Boolean))];
      if (colUniqData.length < 50 && docs.length / colUniqData.length > 10) {
        return {
          field: f,
          suggest: colUniqData,
        };
      }
    })
    .reduce((r, v) => {
      if (v && v.suggest && v.suggest.length > 0) {
        r[v.field] = v.suggest;
      }
      return r;
    }, {});

export const genSchemaDefinition = (docs) => {
  if (!docs || docs.length === 0) {
    return [];
  }
  const fields = [...new Set(docs.map((doc) => Object.keys(doc)).flat())]
    .map((f) => ({
      field: [f],
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
  constructor() {
    // scheme
    const schemaSchema = mongoose.Schema(schemaDef, defOptions);
    this.SchemaModel = mongoose.model('s_c_h_e_m_a_s', schemaSchema);

    // query
    const querySchema = mongoose.Schema(queryDef, defOptions);
    this.QueryModel = mongoose.model('q_u_e_r_y_s', querySchema);

    this.getAllSchemaModels();
  }

  // name: plural, lowercased
  async createSchema(name, definition, etc) {
    const schemaDoc = await this.changeSchema(name, definition, etc);
    return schemaDoc;
  }

  async changeSchema(name, definition, etc = {}) {
    const schemaDoc = await this.SchemaModel.findOneAndUpdate(
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

  async dropSchema(name) {
    await this._dropCollection(name);
    const result = await this.SchemaModel.deleteMany({
      name,
    });
    if (this.models[name]) {
      mongoose.deleteModel(name);
      delete this.models[name];
    }
    return result;
  }

  async _dropCollection(name) {
    return new Promise((resolve, reject) => {
      mongoose.connection.db.dropCollection(pluralize(name), (err, result) => {
        console.log('err, result:', err, result);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async snapshot() {
    // TODO
  }

  async writeCSV(name, file) {
    const Model = await this.getSchemaModel(name);
    const docs = await Model.find().lean();

    const definition = genSchemaDefinition(docs);
    const opts = { fields: Object.keys(definition) };

    const parser = new json2csv.Parser(opts);
    const csv = parser.parse(docs);
    fs.writeFileSync(file, csv);
  }

  // all docs
  async analysisSchema(name, save = false) {
    const Model = await this.getSchemaModel(name);
    const docs = await Model.find().lean();

    const definition = genSchemaDefinition(docs);
    if (save) {
      await this.changeSchema(name, definition);
    }

    return definition;
  }

  async getSchemas() {
    const schemas = await this.SchemaModel.find().lean();
    return schemas;
  }

  async getDashboardSchemas() {
    const schemas = await this.SchemaModel.find().lean();
    const dashboardSchemas = await Promise.all(
      schemas.map(async (schema) => {
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

  async getSchema(name) {
    const schema = await this.SchemaModel.findOne({
      name,
    }).lean();
    return schema;
  }

  _createModel(name, definition) {
    const sampleSchema = new mongoose.Schema(definition, defOptions, {
      strict: false,
    });
    const model = mongoose.model(name, sampleSchema);
    return model;
  }

  async getSchemaModel(name) {
    if (this.models[name]) {
      return this.models[name];
    }

    const schemaData = await this.SchemaModel.findOne({
      name,
    }).lean();

    const model = this._createModel(name, schemaData.definition);
    this.models[name] = model;
    return model;
  }

  async getAllSchemaModels() {
    const schemaDatas = await this.SchemaModel.find().lean();

    const models = schemaDatas.reduce((r, schemaData) => {
      r[schemaData.name] = this._createModel(
        schemaData.name,
        schemaData.definition
      );
      return r;
    }, {});
    this.models = models;

    this.reIndexSuggests(models);
  }

  async reIndexSuggests(models) {
    const all = await Promise.all(
      Object.keys(models).map(async (name) => {
        const Model = models[name];
        const schema = await this.SchemaModel.findOne({
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
      })
    );
    return all;
  }

  async createQuery(name, data = {}) {
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

  async dropQuery(name) {
    const result = await this.QueryModel.deleteMany({
      name,
    });

    return result;
  }

  async getQueries() {
    const queries = await this.QueryModel.find().lean();
    return queries;
  }

  async getQuery(name) {
    const query = await this.QueryModel.findOne({
      name,
    }).lean();
    return query;
  }

  async queryCode(code, filter) {
    const { models } = this;
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      };

      vm.runInThisContext(code)({ models, filter, callback });
    });
  }
}
