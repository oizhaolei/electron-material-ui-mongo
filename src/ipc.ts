import {
  app,
  ipcMain,
  IpcMainEvent,
  IpcMainInvokeEvent,
  shell,
  dialog,
} from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import csvtojson from 'csvtojson';
import json2csv from 'json2csv';

import Mdb, { genSchemaDefinition } from './mdb';
import config from './config';
import {
  FilterType,
  OptionsType,
  SchemaDefinitionType,
  SchemaEtcType,
  DataRowType,
  QueryDataType,
} from './types';

export default function ipc() {
  const mdb = new Mdb();

  // snapshot at startup
  mdb.snapshot();

  // paletteColors
  ipcMain.on('paletteColors', (event: IpcMainEvent, paletteColors: string) => {
    log.debug('paletteColors');
    event.reply('paletteColors', paletteColors);
  });

  //
  ipcMain.handle('ping', (_event: IpcMainInvokeEvent, message: string) => {
    log.debug('ping', message);
    return message;
  });

  // uri
  ipcMain.handle('uri', (_event: IpcMainInvokeEvent, uri: string) => {
    log.debug('uri', uri);
    if (uri) {
      config.mongoose.setUri(uri);
    }

    return config.mongoose.uri();
  });

  interface SchemaPostArgsType {
    name: string;
    definition: SchemaDefinitionType;
    etc: SchemaEtcType;
    docs: DataRowType[];
  }
  ipcMain.handle(
    'schema-post',
    async (
      _event: IpcMainInvokeEvent,
      { name, definition, etc, docs }: SchemaPostArgsType
    ) => {
      log.debug('schema-post', name, definition, docs);
      const newSchema = await mdb.createSchema(name, definition, etc);
      if (docs && docs.length > 0) {
        const Model = await mdb.getSchemaModel(name);
        await Model.insertMany(docs);
        mdb.reIndexSuggests(Model, name);
      }
      return newSchema;
    }
  );

  ipcMain.handle('schemas', async (_event: IpcMainInvokeEvent) => {
    log.debug('schemas');
    const schemas = await mdb.getSchemas();
    return schemas;
  });

  ipcMain.handle('dashboard-schemas', async (_event: IpcMainInvokeEvent) => {
    log.debug('dashboard-schemas');
    const schemas = await mdb.getDashboardSchemas();
    return schemas;
  });

  // mdb.schema
  interface SchemaArgsType {
    name: string;
  }
  ipcMain.handle(
    'schema',
    async (_event: IpcMainInvokeEvent, { name }: SchemaArgsType) => {
      log.debug('schema', name);
      const schema = await mdb.getSchema(name);
      return schema;
    }
  );

  // mdb.schema delete
  interface SchemaDropArgsType {
    name: string;
  }
  ipcMain.handle(
    'schema-drop',
    async (_event: IpcMainInvokeEvent, { name }: SchemaDropArgsType) => {
      log.debug('schema-drop', name);
      const result = await mdb.dropSchema(name);
      log.debug('result:', result);
      return result;
    }
  );

  // csv-read
  ipcMain.handle(
    'csv-read',
    async (_event: IpcMainInvokeEvent, file: string) => {
      log.debug('csv-read', file);
      return new Promise((resolve, reject) => {
        csvtojson()
          .fromFile(file)
          .then((data: DataRowType[]) => {
            const definition = genSchemaDefinition(data);
            log.debug('definition:', definition);
            resolve({
              definition,
              data,
            });
          })
          .catch(reject);
      });
    }
  );

  // mdb.find
  interface FindArgsType {
    name: string;
    filter: FilterType;
    projection: unknown;
    options: OptionsType;
  }
  ipcMain.handle(
    'find',
    async (
      _event: IpcMainInvokeEvent,
      { name, filter = {}, projection, options }: FindArgsType
    ) => {
      log.debug('find', name, filter, projection, options);
      const Model = await mdb.getSchemaModel(name);
      const data = await Model.find(filter, projection, options).lean();
      const totalCount = await Model.countDocuments(filter);

      const result = {
        data: data.map((d: unknown) => ({
          ...d,
          _id: d._id.toString(),
        })),
        page: options.page,
        totalCount,
      };
      return result;
    }
  );

  // mdb.insert
  interface InsertArgsType {
    name: string;
    doc: DataRowType;
  }
  ipcMain.handle(
    'insert',
    async (_event: IpcMainInvokeEvent, { name, doc }: InsertArgsType) => {
      log.debug('insert', name);
      const Model = await mdb.getSchemaModel(name);
      const newDoc = new Model(doc);
      await newDoc.save();
      return newDoc;
    }
  );

  interface InsertManyArgsType {
    name: string;
    docs: DataRowType[];
    cleanData: boolean;
  }
  ipcMain.handle(
    'insert-many',
    async (
      _event: IpcMainInvokeEvent,
      { name, docs, cleanData = false }: InsertManyArgsType
    ) => {
      log.debug('insert', name);
      const Model = await mdb.getSchemaModel(name);
      if (cleanData) {
        await Model.deleteMany({});
      }
      const newDocs = await Model.insertMany(docs);
      mdb.reIndexSuggests(Model, name);
      return newDocs;
    }
  );

  // mdb.update
  interface UpdateArgsType {
    name: string;
    filter: FilterType;
    doc: DataRowType;
    options: OptionsType;
  }
  ipcMain.handle(
    'update',
    async (
      _event: IpcMainInvokeEvent,
      { name, filter, doc, options }: UpdateArgsType
    ) => {
      log.debug('update', name, filter, doc, options);
      const Model = await mdb.getSchemaModel(name);
      const numAffected = await Model.updateMany(filter, doc, options);

      return numAffected;
    }
  );

  // mdb.remove
  interface RemoveArgsType {
    name: string;
    filter: FilterType;
    options: OptionsType;
  }
  ipcMain.handle(
    'remove',
    async (
      _event: IpcMainInvokeEvent,
      { name, filter, options }: RemoveArgsType
    ) => {
      log.debug('remove', name, filter, options);
      const Model = await mdb.getSchemaModel(name);
      const numRemoved = await Model.deleteMany(filter, options);
      mdb.reIndexSuggests(Model, name);
      return numRemoved;
    }
  );

  // mdb.export
  interface ExportCSVArgsType {
    name: string;
  }
  ipcMain.handle(
    'export-csv',
    async (_event: IpcMainInvokeEvent, { name }: ExportCSVArgsType) => {
      log.debug('export-csv', name);
      const file = path.resolve(
        app.getPath('home'),
        `${name}-${new Date().getDate()}.csv`
      );
      await mdb.writeCSV(name, file);
      shell.showItemInFolder(file);
      return file;
    }
  );

  ipcMain.handle('queries', async (_event: IpcMainInvokeEvent) => {
    log.debug('queries');
    const queries = await mdb.getQueries();
    return queries;
  });

  // mdb.query
  interface QueryArgsType {
    name: string;
  }
  ipcMain.handle(
    'query',
    async (_event: IpcMainInvokeEvent, { name }: QueryArgsType) => {
      log.debug('query', name);
      const query = await mdb.getQuery(name);
      return query;
    }
  );

  interface QueryPostArgsType {
    name: string;
    data: unknown;
  }
  ipcMain.handle(
    'query-post',
    async (_event: IpcMainInvokeEvent, { name, data }: QueryPostArgsType) => {
      log.debug('query-post', name, data);
      const newQuery = await mdb.createQuery(name, data);
      return newQuery;
    }
  );

  // mdb.query delete
  interface QueryDropArgsType {
    name: string;
  }
  ipcMain.handle(
    'query-drop',
    async (_event: IpcMainInvokeEvent, { name }: QueryDropArgsType) => {
      log.debug('query-drop', name);
      const result = await mdb.dropQuery(name);
      return result;
    }
  );

  // query-code
  interface QueryCodeArgsType {
    filter: FilterType;
    code: string;
  }
  ipcMain.handle(
    'query-code',
    async (
      _event: IpcMainInvokeEvent,
      { filter = {}, code }: QueryCodeArgsType
    ) => {
      log.debug('query-code', code, filter);
      const data = await mdb.queryCode(code, filter);
      log.debug('data:', data);
      return data;
    }
  );

  // query-code-save
  ipcMain.handle(
    'query-code-save',
    async (
      _event: IpcMainInvokeEvent,
      { filter = {}, code }: QueryCodeArgsType
    ) => {
      log.debug('query-code', code, filter);
      const options = {
        title: 'Save to',
        filters: [
          {
            name: 'query',
            extensions: ['csv'],
          },
        ],
      };
      const file = dialog.showSaveDialogSync(options);
      const data: QueryDataType = await mdb.queryCode(code, filter);
      const files = Object.keys(data).map((v) => {
        const opts = {
          fields: data[v].columns,
        };
        const parser = new json2csv.Parser(opts);
        const csv = parser.parse(data[v].data);
        const cf = `${file}-${v}.csv`;
        fs.writeFileSync(cf, csv);
        return cf;
      });
      return files;
    }
  );
}
