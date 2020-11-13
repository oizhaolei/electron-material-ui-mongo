import { app, ipcMain, shell } from 'electron';
import log from 'electron-log';
import path from 'path';
import csv from 'csvtojson';

import Mdb, { genSchemaDefinition } from './mdb';
import config from './config';

export default function ipc() {
  const mdb = new Mdb();

  // snapshot at startup
  mdb.snapshot();

  // paletteColors
  ipcMain.on('paletteColors', (event, paletteColors) => {
    log.debug('paletteColors');
    event.reply('paletteColors', paletteColors);
  });

  // uri
  ipcMain.handle('uri', (event, uri) => {
    log.debug('uri', uri);
    if (uri) {
      config.mongoose.setUri(uri);
    }

    return config.mongoose.uri();
  });

  // schemaNames: add / update
  ipcMain.handle(
    'schema-post',
    async (event, { name, definition, etc, docs }) => {
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

  ipcMain.handle('schemas', async (event) => {
    log.debug('schemas');
    const schemas = await mdb.getSchemas();
    return schemas;
  });

  ipcMain.handle('dashboard-schemas', async (event) => {
    log.debug('dashboard-schemas');
    const schemas = await mdb.getDashboardSchemas();
    return schemas;
  });

  // mdb.schema
  ipcMain.handle('schema', async (event, { name }) => {
    log.debug('schema', name);
    const schema = await mdb.getSchema(name);
    return schema;
  });

  // mdb.schema delete
  ipcMain.handle('schema-drop', async (event, { name }) => {
    log.debug('schema-drop', name);
    const result = await mdb.dropSchema(name);
    log.debug('result:', result);
    return result;
  });

  // csv-read
  ipcMain.handle('csv-read', async (event, file) => {
    log.debug('csv-read', file);
    return new Promise((resolve, reject) => {
      csv()
        .fromFile(file)
        .then((data) => {
          const definition = genSchemaDefinition(data);
          log.debug('definition:', definition);
          resolve({
            definition,
            data,
          });
        })
        .catch(reject);
    });
  });

  // mdb.find
  ipcMain.handle(
    'find',
    async (event, { name, filter = {}, projection, options }) => {
      log.debug('find', name, filter, projection, options);
      const Model = await mdb.getSchemaModel(name);
      const data = await Model.find(filter, projection, options).lean();
      const totalCount = await Model.countDocuments(filter);

      const result = {
        data: data.map((d) => ({
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
  ipcMain.handle('insert', async (event, { name, doc }) => {
    log.debug('insert', name);
    const Model = await mdb.getSchemaModel(name);
    const newDoc = new Model(doc);
    await newDoc.save();
    return newDoc;
  });

  ipcMain.handle(
    'insert-many',
    async (event, { name, docs, cleanData = false }) => {
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
  ipcMain.handle('update', async (event, { name, filter, doc, options }) => {
    log.debug('update', name, filter, doc, options);
    const Model = await mdb.getSchemaModel(name);
    const numAffected = await Model.updateMany(filter, doc, options);

    return numAffected;
  });

  // mdb.remove
  ipcMain.handle('remove', async (event, { name, filter, options }) => {
    log.debug('remove', name, filter, options);
    const Model = await mdb.getSchemaModel(name);
    const numRemoved = await Model.deleteMany(filter, options);
    mdb.reIndexSuggests(Model, name);
    return numRemoved;
  });

  // mdb.export
  ipcMain.handle('export-csv', async (event, { name }) => {
    log.debug('export-csv', name);
    const file = path.resolve(
      app.getPath('home'),
      `${name}-${new Date().getDate()}.csv`
    );
    await mdb.writeCSV(name, file);
    shell.showItemInFolder(file);
    return file;
  });

  ipcMain.handle('queries', async (event) => {
    log.debug('queries');
    const queries = await mdb.getQueries();
    return queries;
  });

  // mdb.query
  ipcMain.handle('query', async (event, { name }) => {
    log.debug('query', name);
    const query = await mdb.getQuery(name);
    return query;
  });

  ipcMain.handle('query-post', async (event, { name, data }) => {
    log.debug('query-post', name, data);
    const newQuery = await mdb.createQuery(name, data);
    return newQuery;
  });

  // mdb.query delete
  ipcMain.handle('query-drop', async (event, { name }) => {
    log.debug('query-drop', name);
    const result = await mdb.dropQuery(name);
    return result;
  });

  // query-code
  ipcMain.handle('query-code', async (event, { filter = {}, code }) => {
    log.debug('query-code', code, filter);
    const data = await mdb.queryCode(code, filter);
    log.debug('data:', data);
    return data;
  });
}
