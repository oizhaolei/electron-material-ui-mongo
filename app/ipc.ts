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
  ipcMain.on('schema-post', async (event, { name, definition, etc, docs, sync = false }) => {
    console.log('schema-post');
    const newSchema = await mdb.createSchema(name, definition, etc);
    if (docs && docs.length > 0) {
      const Model = await mdb.getSchemaModel(name);
      await Model.insertMany(docs);
    }
    if (sync) {
      event.returnValue = newSchema;
    } else {
      event.reply('schema-post', newSchema);
    }
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

  ipcMain.on('dashboard-schemas', async (event, { sync = false }) => {
    console.log('dashboard-schemas');
    const schemas = await mdb.getDashboardSchemas();
    if (sync) {
      event.returnValue = schemas;
    } else {
      event.reply('dashboard-schemas', schemas);
    }
  });

  // mdb.schema
  ipcMain.on('schema', async (event, { name, sync = false }) => {
    console.log('schema');
    const schema = await mdb.getSchema(name);
    if (sync) {
      event.returnValue = schema;
    } else {
      event.reply('schema', schema);
    }
  });

  // mdb.schema delete
  ipcMain.on('schema-delete', async (event, { name, sync = false }) => {
    console.log('schema-delete');
    const result = await mdb.removeSchema(name);
    if (sync) {
      event.returnValue = { result };
    } else {
      event.reply('schema-delete', { result });
    }
  });

  // csv-read
  ipcMain.on('csv-read', async (event, { file, sync = false }) => {
    console.log('csv-read');
    csv().fromFile(file).then((data)=>{
      const definition = genSchemaDefinition(data);
      if (sync) {
        event.returnValue = {
          definition,
          data,
        };
      } else {
        event.reply('csv-read', {
          definition,
          data,
        });
      }
    });
  });

  // mdb.find
  ipcMain.on(
    'find',
    async (event, { name, filter = {}, projection, options, sync = false }) => {
      console.log('find');
      const Model = await mdb.getSchemaModel(name);
      const data = await Model.find(filter, projection, options).lean();
      const totalCount = await Model.countDocuments(filter);

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
    }
  );

  // mdb.insert
  ipcMain.on('insert', async (event, { name, doc, sync = false }) => {
    console.log('insert');
    const Model = await mdb.getSchemaModel(name);
    const newDoc = new Model(doc);
    await newDoc.save();
    if (sync) {
      event.returnValue = {
        newDoc,
      };
    } else {
      event.reply('insert', {
        newDoc,
      });
    }
  });
  ipcMain.on('insert-many', async (event, { name, docs, sync = false }) => {
    console.log('insert');
    const Model = await mdb.getSchemaModel(name);
    const newDocs = await Model.insertMany(docs);
    if (sync) {
      event.returnValue = {
        newDocs,
      };
    } else {
      event.reply('insert-many', {
        newDocs,
      });
    }
  });

  // mdb.remove
  ipcMain.on(
    'remove',
    async (event, { name, filter, options, sync = false }) => {
      console.log('remove');
      const Model = await mdb.getSchemaModel(name);
      const numRemoved = await Model.deleteMany(filter, options);
      if (sync) {
        event.returnValue = {
          numRemoved,
        };
      } else {
        event.reply('remove', {
          numRemoved,
        });
      }
    }
  );

  // mdb.update
  ipcMain.on(
    'update',
    async (event, { name, filter, doc, options, sync = false }) => {
      console.log('update');
      const Model = await mdb.getSchemaModel(name);
      const numAffected = await Model.updateMany(filter, doc, options);

      if (sync) {
        event.returnValue = numAffected;
      } else {
        event.reply('update', numAffected);
      }
    }
  );

  // mdb.export
  ipcMain.on('export-csv', async (event, { name, sync = false }) => {
    console.log('export-csv');
    const file = path.resolve(
      app.getPath('home'),
      `${name}-${new Date().getDate()}.csv`
    );
    mdb.writeCSV(name, file);
    shell.showItemInFolder(file);
    if (sync) {
      event.returnValue = file;
    } else {
      event.reply('export-csv', file);
    }
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
  ipcMain.on('query', async (event, { name, sync = false }) => {
    console.log('query', name);
    const query = await mdb.getQuery(name);
    if (sync) {
      event.returnValue = query;
    } else {
      event.reply('query', query);
    }
  });

  ipcMain.on('query-post', async (event, { name, data, sync = false }) => {
    console.log('query-post');
    const newQuery = await mdb.createQuery(name, data);
    if (sync) {
      event.returnValue = newQuery;
    } else {
      event.reply('query-post', newQuery);
    }
  });

  // mdb.query delete
  ipcMain.on('query-delete', async (event, { name, sync = false }) => {
    console.log('query-delete');
    const result = await mdb.removeQuery(name);
    if (sync) {
      event.returnValue = { result };
    } else {
      event.reply('query-delete', { result });
    }
  });

  // query-data
  ipcMain.on(
    'query-data',
    async (
      event,
      { name, filter = {}, projection, options, code, sync = false }
    ) => {
      console.log('query-data');
      if (name) {
        const q = await mdb.getQuery(name);
        code = q.code;
      }
      const data = await mdb.queryCode(code, filter, projection, options);
      const definition = genSchemaDefinition(data);
      if (sync) {
        event.returnValue = {
          definition,
          data,
        };
      } else {
        event.reply('query-data', {
          definition,
          data,
        });
      }
    }
  );
}
