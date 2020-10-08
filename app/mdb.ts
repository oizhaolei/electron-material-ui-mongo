import mongoose from 'mongoose';
import vm from 'vm';

import fs from 'fs';
import json2csv from 'json2csv';

mongoose.set('debug', (coll, method, query, doc, options) => {
  console.log(`${coll}.${method}.(${JSON.stringify(query)})`, JSON.stringify(doc), options || '');
});


const schemaDef = {
  name: String,
  definition: mongoose.Schema.Types.Mixed,
  label: String,
  icon: String,
  suggests: mongoose.Schema.Types.Mixed,
  foreighKeys: mongoose.Schema.Types.Mixed,
};
const defOptions = {
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

const queryDef = {
  name: String,
  type: String,
  relations: mongoose.Schema.Types.Mixed,
  code: String,
};

const getType = (field, row) => {
  const cell = row[field];
  if (cell) {
    if (typeof cell === 'number') {
      return 'Number';
    }
    if (typeof cell === 'boolean') {
      return 'Boolean';
    }
  }

  return 'String';
};

const getSuggest = (field, rows) => {
  return undefined;
};

export const genSchemaDefinition = (docs) => {
  if (!docs || docs.length === 0) {
    return [];
  }
  const uniqFields = [...new Set(docs.map((doc) => Object.keys(doc)).flat())].map((f) => ({
    field: [f],
    type: getType(f, docs[0]),
  })).reduce((r, v) => {
    r[v.field] = {
      type: v.type,
    };
    return r;
  }, {});
  return uniqFields;
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
    const schemaDoc = await this.SchemaModel.findOneAndUpdate({
      name,
    }, {
      name,
      definition,
      ...etc,
    }, {
      upsert: true,
      new: true,
    }).lean();

    if (this.models[name]) {
      mongoose.deleteModel(name);
      delete this.models[name];
    }

    return schemaDoc;
  }

  async removeSchema(name) {
    const result = await this.SchemaModel.deleteMany({
      name,
    });
    if (this.models[name]) {
      mongoose.deleteModel(name);
      delete this.models[name];
    }
    await this._dropCollection(name);
    return result;
  }

  async _dropCollection(name) {
    return new Promise((resolve, reject) => {
      mongoose.connection.dropCollection(name, (err, result) => {
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
    const SchemaModel = await this.getSchemaModel(name);
    const rows = await SchemaModel.find().lean();

    const fields = genSchemaDefinition(rows).map((f) => f.field);
    const opts = { fields: Object.keys(fields) };

    const parser = new json2csv.Parser(opts);
    const csv = parser.parse(rows);
    console.log(csv);
    fs.writeFileSync(file, csv);
  }

  // all rows
  async analysisSchema(name, save = false) {
    const SchemaModel = await this.getSchemaModel(name);
    const rows = await SchemaModel.find().lean();

    const definition = genSchemaDefinition(rows);
    if (save) {
      await this.changeSchema(name, definition);
    }

    return definition;
  }

  async getSchemas() {
    const schemas = await this.SchemaModel.find().lean();
    return schemas;
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
      r[schemaData.name] = this._createModel(schemaData.name, schemaData.definition);
      return r;
    }, {});
    this.models = models;
  }

  async createQuery(name, data = {}) {
    const queryDoc = await this.QueryModel.findOneAndUpdate({
      name,
    }, {
      name,
      ...data,
    }, {
      upsert: true,
      new: true,
    }).lean();

    return queryDoc;
  }

  async removeQuery(name) {
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

  async queryCode(code) {
    const models = this.models;
    return new Promise((resolve, reject) => {
      const callback = (err, data) => {
        console.log('err, data', err, data);
        resolve(data);
      };

      vm.runInThisContext(code)({ models, callback });
    });
  }
}
