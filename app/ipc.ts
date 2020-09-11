import Datastore from 'nedb';
import path from 'path';

import { getFiles } from './utils/utils';

const find = (db, query) => {
  return new Promise((resolve, reject) => {
    db.find(query, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

const insert = (db, doc) => {
  return new Promise((resolve, reject) => {
    db.insert(doc, (err, newDoc) => {
      if (err) {
        reject(err);
      } else {
        resolve(newDoc);
      }
    });
  });
};

const update = (db, query, doc, options) => {
  return new Promise((resolve, reject) => {
    db.update(query, doc, options, (err, newDoc) => {
      if (err) {
        reject(err);
      } else {
        resolve(newDoc);
      }
    });
  });
};

const remove = (db, query, options) => {
  return new Promise((resolve, reject) => {
    db.remove(query, options, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

export default function ipc(ipcMain, { dbpath }) {
  const sdb = new Datastore({
    filename: path.resolve(dbpath, '__system'),
    autoload: true,
  });

  const dbs = (t) =>
    new Datastore({
      filename: path.resolve(dbpath, t),
      autoload: true,
    });

  // ping
  ipcMain.on('asynchronous-message', (event) => {
    event.reply('asynchronous-reply', 'pong');
  });

  // dbpath
  ipcMain.on('dbpath', (event) => {
    event.reply('dbpath', dbpath);
  });

  // tables
  ipcMain.on('tables', (event) => {
    const tables = getFiles(dbpath).filter((t) => !t.startsWith('__'));
    event.reply('tables', tables);
  });

  // analysis
  ipcMain.on('analysis', async (event, arg) => {
    const analysisTable = async (table) => {
      const db = dbs(table);
      const docs = await find(db, {});

      const definition = Object.keys(docs[0]).map((f) => ({
        table,
        title: f,
        field: f,
      }));
      await remove(sdb, { table }, { multi: true });
      await Promise.all(definition.map((def) => insert(sdb, def)));

      return definition;
    };
    const definition = await analysisTable(arg);

    event.reply('analysis', definition);
  });

  // db.find
  ipcMain.on('find', async (event, { table, query = {} }) => {
    const schema = await find(sdb, { table });

    const db = dbs(table);
    const records = await find(db, query);
    event.reply('find', { schema, records });
  });

  // db.insert
  ipcMain.on('insert', async (event, { table, docs }) => {
    const db = dbs(table);
    const newDocs = await insert(db, docs);
    event.reply('insert', { newDocs });
  });

  // db.remove
  ipcMain.on('remove', async (event, { table, query, options }) => {
    const db = dbs(table);
    const numRemoved = await remove(db, query, options);
    event.reply('remove', { numRemoved });
  });

  // db.update
  ipcMain.on('update', async (event, { table, query, doc, options }) => {
    const db = dbs(table);
    const numAffected = await update(db, query, doc, options);
    event.reply('update', { numAffected });
  });
}
