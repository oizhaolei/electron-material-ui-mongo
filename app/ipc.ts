import { app, ipcMain, shell } from 'electron';
import path from 'path';
import csv from 'csvtojson';

import Mdb, { genSchemaDefinition } from './mdb';
import config from './config';

export default function ipc() {
  const mdb = new Mdb();

  // snapshot at startup
  mdb.snapshot();

  // ping
  ipcMain.on('asynchronous-message', (event, { sync = false }) => {
    console.log('asynchronous-message');
    if (sync) {
      event.returnValue = 'pong';
    } else {
      event.reply('asynchronous-reply', 'pong');
    }
  });

  // paletteColors
  ipcMain.on('paletteColors', (event, paletteColors) => {
    console.log('paletteColors');
    event.reply('paletteColors', paletteColors);
  });

  // uri
  ipcMain.on('uri', (event) => {
    console.log('uri');
    event.reply('uri', config.mongoose.connect);
  });

  // schemaNames: add / update
  ipcMain.on('schema-post', async (event, { name, definition, etc, docs }) => {
    console.log('schema-post');
    const newSchema = await mdb.createSchema(name, definition, etc);
    if (docs && docs.length > 0) {
      const SchemaModel = await mdb.getSchemaModel(name);
      await SchemaModel.insertMany(docs);
    }
    event.reply('schema-post', newSchema);
  });

  ipcMain.on('schemas', async (event, { sync = false }) => {
    console.log('schemas');
    const schemas = await mdb.getSchemas();
    if (sync) {
      event.returnValue = schemas;
    } else {
      event.reply('schemas', schemas);
    }
  });

  // mdb.schema
  ipcMain.on('schema', async (event, name) => {
    console.log('schema');
    const schema = await mdb.getSchema(name);
    event.reply('schema', schema);
  });

  // mdb.schema delete
  ipcMain.on('schema-delete', async (event, { name }) => {
    console.log('schema-delete');
    const result = await mdb.removeSchema(name);
    event.reply('schema-delete', { result });
  });

  // analysis
  ipcMain.on('analysis', async (event, arg) => {
    console.log('analysis');
    const schemaNames = arg
      ? [arg]
      : await mdb.getSchemaNames();
    const definitions = await Promise.all(schemaNames.map((t) => mdb.analysisSchema(t)));

    event.reply('analysis', definitions);
  });

  // csv-read
  ipcMain.on('csv-read', async (event, arg) => {
    console.log('csv-read');
    csv().fromFile(arg).then((data)=>{
      const definition = genSchemaDefinition(data);
      event.reply('csv-read', {
        definition,
        data,
      });
    });
  });

  // mdb.find
  ipcMain.on('find', async (event, { name, filter = {}, projection, options, sync = false }) => {
    console.log('find');
    const SchemaModel = await mdb.getSchemaModel(name);
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
  ipcMain.on('insert', async (event, { name, doc }) => {
    console.log('insert');
    const SchemaModel = await mdb.getSchemaModel(name);
    const newDoc = new SchemaModel(doc);
    await newDoc.save();
    event.reply('insert', { newDoc });
  });

  // mdb.remove
  ipcMain.on('remove', async (event, { name, filter, options }) => {
    console.log('remove');
    const SchemaModel = await mdb.getSchemaModel(name);
    const numRemoved = await SchemaModel.deleteMany(filter, options);
    event.reply('remove', { numRemoved });
  });

  // mdb.update
  ipcMain.on('update', async (event, { name, filter, doc, options }) => {
    console.log('update');
    const SchemaModel = await mdb.getSchemaModel(name);
    const numAffected = await SchemaModel.update(filter, doc, options);
    event.reply('update', { numAffected });
  });

  // mdb.export
  ipcMain.on('export-csv', async (event, name) => {
    console.log('export-csv');
    const file = path.resolve(
      app.getPath('home'),
      `${name}-${new Date().getDate()}.csv`
    );
    mdb.writeCSV(name, file);
    shell.showItemInFolder(file);
    event.reply('export-csv', file);
  });

  ipcMain.on('queries', async (event, { sync = false }) => {
    console.log('queries');
    const queries = await mdb.getQueries();
    if (sync) {
      event.returnValue = queries;
    } else {
      event.reply('queries', queries);
    }
  });

  // mdb.query
  ipcMain.on('query', async (event, { name }) => {
    console.log('query');
    const query = await mdb.getQuery(name);
    event.reply('query', query);
  });

  ipcMain.on('query-post', async (event, { name, data }) => {
    console.log('query-post');
    const newQuery = await mdb.createQuery(name, data);
    event.reply('query-post', newQuery);
  });

  // mdb.query delete
  ipcMain.on('query-delete', async (event, { name }) => {
    console.log('query-delete');
    const result = await mdb.removeQuery(name);
    event.reply('query-delete', { result });
  });

  // query-data
  ipcMain.on('query-data', async (event, { name, filter = {}, projection, options, code, sync = false }) => {
    console.log('query-data');
    if (name) {
      const q = name && await mdb.getQuery(name);
      code = q.code;
    }
    const data = await mdb.queryCode(code, filter, projection, options);
    const definition = genSchemaDefinition(data);
    event.reply('query-data', {
      definition,
      data,
    });
  });
}
