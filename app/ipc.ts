import { app, ipcMain, shell } from 'electron';
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
    console.log('paletteColors');
    event.reply('paletteColors', paletteColors);
  });

  // uri
  ipcMain.on('uri', (event) => {
    console.log('uri');
    event.reply('uri', config.mongoose.connect);
  });

  // schemaNames: add / update
  ipcMain.handle('schema-post', async (event, { name, definition, etc, docs }) => {
    console.log('schema-post', name, definition, docs);
    const newSchema = await mdb.createSchema(name, definition, etc);
    if (docs && docs.length > 0) {
      const Model = await mdb.getSchemaModel(name);
      await Model.insertMany(docs);
    }
    return  newSchema;
  });

  ipcMain.handle('schemas', async (event) => {
    console.log('schemas');
    const schemas = await mdb.getSchemas();
    return schemas;
  });

  ipcMain.handle('dashboard-schemas', async (event) => {
    console.log('dashboard-schemas');
    const schemas = await mdb.getDashboardSchemas();
    return schemas;
  });

  // mdb.schema
  ipcMain.handle('schema', async (event, { name }) => {
    console.log('schema');
    const schema = await mdb.getSchema(name);
    return schema;
  });

  // mdb.schema delete
  ipcMain.handle('schema-drop', async (event, { name }) => {
    console.log('schema-drop');
    const result = await mdb.dropSchema(name);
    console.log('result:', result);
    return result;
  });

  // csv-read
  ipcMain.handle('csv-read', async (event, file) => {
    console.log('csv-read', file);
    return new Promise((resolve, reject) => {
      csv().fromFile(file).then((data) => {
        const definition = genSchemaDefinition(data);
        console.log('definition:', definition);
        resolve({
          definition,
          data,
        });
      });
    });
  });

  // mdb.find
  ipcMain.handle(
    'find',
    async (event, { name, filter = {}, projection, options }) => {
      console.log('find', name, filter, projection, options);
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
    console.log('insert');
    const Model = await mdb.getSchemaModel(name);
    const newDoc = new Model(doc);
    await newDoc.save();
    return newDoc;
  });
  ipcMain.handle('insert-many', async (event, { name, docs }) => {
    console.log('insert');
    const Model = await mdb.getSchemaModel(name);
    const newDocs = await Model.insertMany(docs);
    return newDocs;
  });

  // mdb.update
  ipcMain.handle(
    'update',
    async (event, { name, filter, doc, options }) => {
      console.log('update', name, filter, doc, options);
      const Model = await mdb.getSchemaModel(name);
      const numAffected = await Model.updateMany(filter, doc, options);

      return numAffected;
    }
  );

  // mdb.remove
  ipcMain.handle(
    'remove',
    async (event, { name, filter, options }) => {
      console.log('remove');
      const Model = await mdb.getSchemaModel(name);
      const numRemoved = await Model.deleteMany(filter, options);
      return numRemoved;
    }
  );

  // mdb.export
  ipcMain.handle('export-csv', async (event, { name }) => {
    console.log('export-csv');
    const file = path.resolve(
      app.getPath('home'),
      `${name}-${new Date().getDate()}.csv`
    );
    await mdb.writeCSV(name, file);
    shell.showItemInFolder(file);
    return file;
  });

  ipcMain.handle('queries', async (event) => {
    console.log('queries');
    const queries = await mdb.getQueries();
    return queries;
  });

  // mdb.query
  ipcMain.handle('query', async (event, { name }) => {
    console.log('query', name);
    const query = await mdb.getQuery(name);
    return query;
  });

  ipcMain.handle('query-post', async (event, { name, data }) => {
    console.log('query-post');
    const newQuery = await mdb.createQuery(name, data);
    return newQuery;
  });

  // mdb.query delete
  ipcMain.handle('query-delete', async (event, { name }) => {
    console.log('query-delete');
    const result = await mdb.dropQuery(name);
    return result;
  });

  // query-code
  ipcMain.handle(
    'query-code',
    async (event, { params = {}, code }) => {
      console.log('query-code', code, params);
      const data = await mdb.queryCode(code, params);
      console.log('data:', data);
      return data;
    }
  );
}
