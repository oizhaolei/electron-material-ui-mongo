import mongoose from 'mongoose';

import fs from 'fs';
import json2csv from 'json2csv';

const getType = (field, row) => {
  const cell = row[field];
  if (cell) {
    if (typeof cell === 'number') {
      return 'numeric';
    }
    if (typeof cell === 'boolean') {
      return 'boolean';
    }
  }

  return undefined;
};

const getAlign = (field, row) => {
  const cell = row[field];
  if (cell) {
    if (typeof cell === 'number') {
      return 'right';
    }
    if (typeof cell === 'boolean') {
      return 'center';
    }
  }

  return 'left';
};

const genTableDefinition = (docs) => {
  if (!docs || docs.length === 0) {
    return [];
  }
  const uniqFields = [...new Set(docs.map((doc) => Object.keys(doc)).flat())];
  return uniqFields.map((f) => ({
    title: f,
    field: f,
    type: getType(f, docs[0]),
    align: getAlign(f, docs[0]),
  }));
};

export default class Mdb {
  constructor() {
    const masterSchema = mongoose.Schema({
      table: String,
      definition: mongoose.Schema.Types.Mixed,
      label: String,
      icon: String,
    }, {
      timestamps: true,
      toObject: {
        virtuals: true,
      },
      toJSON: {
        virtuals: true,
      },
    });

    this.MasterModel = mongoose.model('s_c_h_e_m_a_s', masterSchema);
  }

  // table: plural, lowercased
  async createSchema(table, definition, etc = {}) {
    const schemaDoc = new this.MasterModel({
      table,
      definition,
      ...etc,
    });
    await schemaDoc.save();
    return schemaDoc;
  }

  async changeSchema(table, definition, etc = {}) {
    const schemaDoc = await this.MasterModel.findOneAndUpdate({
      table,
    }, {
      definition,
      ...etc,
    }, {
      new: true,
    });
    return schemaDoc;
  }

  async removeSchema(table) {
    const result = await this.MasterModel.deleteMany({
      table,
    });
    await this._dropCollection(table);
    return result;
  }

  async _dropCollection(table) {
    return new Promise((resolve, reject) => {
      mongoose.connection.dropCollection(table, (err, result) => {
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

  async writeCSV(table, file) {
    const SchemaModel = await this.getSchemaModel(table);
    const rows = await SchemaModel.find();

    const fields = genTableDefinition(rows).map((f) => f.field);
    const opts = { fields };

    const parser = new json2csv.Parser(opts);
    const csv = parser.parse(rows);
    console.log(csv);
    fs.writeFileSync(file, csv);
  };

  // all rows
  async analysisSchema(table) {
    const SchemaModel = await this.getSchemaModel(table);
    const rows = await SchemaModel.find();

    const definition = genTableDefinition(rows);
    // await remove(schemaDb, { table }, { multi: true });
    // await Promise.all(definition.map((def) => insert(schemaDb, def)));

    return definition;
  };

  async getSchemas() {
    const schemas = await this.MasterModel.find();
    return schemas;
  }
  async getTables() {
    const schemas = await this.getSchemas();
    return schemas.map((s) => s.table);
  }

  async getSchema(table) {
    const schema = await this.MasterModel.findOne({
      table,
    });
    return schema;
  }

  async getSchemaModel(table) {
    const schemaData = await this.MasterModel.findOne({
      table,
    });
    const sampleSchema = new mongoose.Schema(schemaData.definition, {
      timestamps: true,
      toObject: {
        virtuals: true,
      },
      toJSON: {
        virtuals: true,
      },
    }, {
      strict: false,
    });
    return mongoose.model(schemaData.table, sampleSchema);
  }
}
