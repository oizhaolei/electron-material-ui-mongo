import { app, ipcMain, shell } from 'electron';
import path from 'path';
import csv from 'csvtojson';

import Mdb, { genTableDefinition } from './mdb';
import config from './config';

export default function ipc() {
  const mdb = new Mdb();

  // snapshot at startup
  mdb.snapshot();

  // ping
  ipcMain.on('asynchronous-message', (event, { sync = false }) => {
    if (sync) {
      event.returnValue = 'pong';
    } else {
      event.reply('asynchronous-reply', 'pong');
    }
  });

  // paletteColors
  ipcMain.on('paletteColors', (event, paletteColors) => {
    event.reply('paletteColors', paletteColors);
  });

  // uri
  ipcMain.on('uri', (event) => {
    event.reply('uri', config.mongoose.connect);
  });

  // tables: add / update
  ipcMain.on('schema-post', async (event, { table, definition, etc, docs }) => {
    const newSchema = await mdb.createSchema(table, definition, etc);
    if (docs && docs.length > 0) {
      const SchemaModel = await mdb.getSchemaModel(table);
      await SchemaModel.insertMany(docs);
    }
    event.reply('schema-post', newSchema);
  });

  ipcMain.on('schemas', async (event, { sync = false }) => {
    const schemas = await mdb.getSchemas();
    if (sync) {
      event.returnValue = schemas;
    } else {
      event.reply('schemas', schemas);
    }
  });

  // mdb.schema
  ipcMain.on('schema', async (event, { table }) => {
    const schema = await mdb.getSchema(table);
    event.reply('schema', { schema });
  });

  // mdb.schema delete
  ipcMain.on('schema-delete', async (event, { table }) => {
    const result = await mdb.removeSchema(table);
    event.reply('schema-delete', { result });
  });

  // analysis
  ipcMain.on('analysis', async (event, arg) => {
    const tables = arg
      ? [arg]
      : await mdb.getSchemaNames();
    const definitions = await Promise.all(tables.map((t) => mdb.analysisSchema(t)));

    event.reply('analysis', definitions);
  });

  // csv-read
  ipcMain.on('csv-read', async (event, arg) => {
    csv().fromFile(arg).then((data)=>{
      const definition = genTableDefinition(data);
      event.reply('csv-read', {
        definition,
        data,
      });
    });
  });

  // mdb.find
  ipcMain.on('find', async (event, { table, filter = {}, projection, options, sync = false }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const data = await SchemaModel.find(filter, projection, options).lean();
    const totalCount = await SchemaModel.countDocuments(filter);

    const result = {
      data,
      page: options.page,
      totalCount,
    };
    if (sync) {
      event.returnValue = result;
    } else {
      event.reply('find', result);
    }
  });

  // mdb.insert
  ipcMain.on('insert', async (event, { table, doc }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const newDoc = new SchemaModel(doc);
    await newDoc.save();
    event.reply('insert', { newDoc });
  });

  // mdb.remove
  ipcMain.on('remove', async (event, { table, filter, options }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const numRemoved = await SchemaModel.deleteMany(filter, options);
    event.reply('remove', { numRemoved });
  });

  // mdb.update
  ipcMain.on('update', async (event, { table, filter, doc, options }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const numAffected = await SchemaModel.update(filter, doc, options);
    event.reply('update', { numAffected });
  });

  // mdb.export
  ipcMain.on('export-csv', async (event, table) => {
    const file = path.resolve(
      app.getPath('home'),
      `${table}-${new Date().getDate()}.csv`
    );
    mdb.writeCSV(table, file);
    shell.showItemInFolder(file);
    event.reply('export-csv', file);
  });

  ipcMain.on('queries', async (event) => {
    const queries = await mdb.getQueries();
    event.reply('queries', queries);
  });

  ipcMain.on('query-post', async (event, { query, data }) => {
    const newQuery = await mdb.createQuery(query, data);
    event.reply('query-post', newQuery);
  });

  // mdb.query delete
  ipcMain.on('query-delete', async (event, { query }) => {
    const result = await mdb.removeQuery(query);
    event.reply('query-delete', { result });
  });
}
