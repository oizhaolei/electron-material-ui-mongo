import mongoose from 'mongoose';

import fs from 'fs';
import json2csv from 'json2csv';

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

const genTableDefinition = (docs) => {
  if (!docs || docs.length === 0) {
    return [];
  }
  let uniqFields = [...new Set(docs.map((doc) => Object.keys(doc)).flat())];
  uniqFields = uniqFields.map((f) => ({
    name:[f],
    type: getType(f, docs[0]),
  }));
  uniqFields = uniqFields.reduce((r, v) => {
    r[v.name] = {
      type: v.type
    };
    return r;
  }, {});
  return uniqFields;
};

export default class Mdb {
  constructor() {
    const schemaSchema = mongoose.Schema({
      table: String,
      definition: mongoose.Schema.Types.Mixed,
      label: String,
      icon: String,
      suggests: mongoose.Schema.Types.Mixed,
      foreighTable: mongoose.Schema.Types.Mixed,
      foreighKey: mongoose.Schema.Types.Mixed,
    }, {
      timestamps: true,
      toObject: {
        virtuals: true,
      },
      toJSON: {
        virtuals: true,
      },
    });

    this.SchemaModel = mongoose.model('s_c_h_e_m_a_s', schemaSchema);
  }

  // table: plural, lowercased
  async createSchema(table, definition, etc) {
    const schemaDoc = await this.changeSchema(table, definition, etc);
    return schemaDoc;
  }

  async changeSchema(table, definition, etc = {}) {
    const schemaDoc = await this.SchemaModel.findOneAndUpdate({
      table,
    }, {
      table,
      definition,
      ...etc,
    }, {
      upsert: true,
      new: true,
    });
    return schemaDoc;
  }

  async removeSchema(table) {
    const result = await this.SchemaModel.deleteMany({
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
    const opts = { fields: Object.keys(fields) };

    const parser = new json2csv.Parser(opts);
    const csv = parser.parse(rows);
    console.log(csv);
    fs.writeFileSync(file, csv);
  };

  // all rows
  async analysisSchema(table, save = false) {
    const SchemaModel = await this.getSchemaModel(table);
    const rows = await SchemaModel.find();

    const definition = genTableDefinition(rows);
    if (save) {
      await this.changeSchema(table, definition);
    }

    return definition;
  };

  async getSchemas() {
    const schemas = await this.SchemaModel.find();
    return schemas;
  }
  async getTables() {
    const schemas = await this.getSchemas();
    return schemas.map((s) => s.table);
  }

  async getSchema(table) {
    const schema = await this.SchemaModel.findOne({
      table,
    });
    return schema;
  }

  async getSchemaModel(table) {
    const schemaData = await this.SchemaModel.findOne({
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
