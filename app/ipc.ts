import { app, ipcMain, shell } from 'electron';
import path from 'path';

import Mdb from './mdb';
import config from './config';

export default function ipc() {
  const mdb = new Mdb();

  // snapshot at startup
  mdb.snapshot();

  // ping
  ipcMain.on('asynchronous-message', (event) => {
    event.reply('asynchronous-reply', 'pong');
  });

  // uri
  ipcMain.on('uri', (event) => {
    event.reply('uri', config.mongoose.connect);
  });

  // tables: add / update
  ipcMain.on('schema-post', async (event, { table, definition, etc }) => {
    const newSchema = await mdb.createSchema(table, definition, etc);
    event.reply('schema-post', newSchema);
  });

  ipcMain.on('tables', async (event) => {
    const schemas = await mdb.getSchemas();
    event.reply('tables', schemas);
  });

  // analysis
  ipcMain.on('analysis', async (event, arg) => {
    const tables = arg
      ? [arg]
      : await mdb.getTables();
    const definitions = await Promise.all(tables.map((t) => mdb.analysisSchema(t)));

    event.reply('analysis', definitions);
  });

  // db.schema
  ipcMain.on('schema', async (event, { table }) => {
    const schema = await mdb.getSchema(table);
    event.reply('schema', { schema });
  });

  // db.find
  ipcMain.on('find', async (event, { table, filter = {}, projection, options }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const records = await SchemaModel.find(filter, projection, options);
    event.reply('find', { records });
  });

  // db.findSync
  ipcMain.on('findSync', async (event, { table, filter = {}, projection, options }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const data = await SchemaModel.find(filter, projection, options);
    const totalCount = await SchemaModel.countDocuments(filter);
    event.returnValue = {
      data,
      page: options.page,
      totalCount,
    };
  });

  // db.insert
  ipcMain.on('insert', async (event, { table, doc }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const newDoc = new SchemaModel(doc);
    await newDoc.save();
    event.reply('insert', { newDoc });
  });

  // db.remove
  ipcMain.on('remove', async (event, { table, filter, options }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const numRemoved = await SchemaModel.deleteMany(filter, options);
    event.reply('remove', { numRemoved });
  });

  // db.update
  ipcMain.on('update', async (event, { table, filter, doc, options }) => {
    const SchemaModel = await mdb.getSchemaModel(table);
    const numAffected = await SchemaModel.update(db, filter, doc, options);
    event.reply('update', { numAffected });
  });

  // db.export
  ipcMain.on('export-csv', async (event, table) => {
    const file = path.resolve(
      app.getPath('home'),
      `${table}-${new Date().getDate()}.csv`
    );
    mdb.writeCSV(table, file);
    shell.showItemInFolder(file);
    event.reply('export-csv', file);
  });
}
