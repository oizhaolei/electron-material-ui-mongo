import { app, ipcMain } from 'electron';

import Datastore from 'nedb';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Parser } from 'json2csv';

import { getFiles } from './utils/utils';

const find = (db, query = {}) => {
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

const genTableDefinition = (table, docs) => {
  if (!docs || docs.length === 0) {
    return [];
  }
  const uniqFields = [...new Set(docs.map((doc) => Object.keys(doc)).flat())];
  return uniqFields.map((f) => ({
    table,
    title: f,
    field: f,
    type: getType(f, docs[0]),
    align: getAlign(f, docs[0]),
  }));
};

const writeCSV = (file, rows) => {
  const fields = genTableDefinition('', rows).map((f) => f.field);
  const opts = { fields };

  const parser = new Parser(opts);
  const csv = parser.parse(rows);
  console.log(csv);
  fs.writeFileSync(file, csv);
};

const snapshot = (dbpath) => {
  const output = fs.createWriteStream(
    path.resolve(dbpath, '..', `personaldb-${new Date().getDate()}.zip`)
  );
  const archive = archiver('zip');
  output.on('close', () => {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
  archive.directory(dbpath, false);
  archive.finalize();
};

export default function ipc({ dbpath }) {
  const systemDb = new Datastore({
    filename: path.resolve(dbpath, '__tables'),
    autoload: true,
  });

  const schemaDb = new Datastore({
    filename: path.resolve(dbpath, '__schema'),
    autoload: true,
  });

  const dbs = (t) =>
    new Datastore({
      filename: path.resolve(dbpath, t),
      autoload: true,
    });

  // all rows
  const analysisSchema = async (table) => {
    const db = dbs(table);
    const docs = await find(db, {});

    const definition = genTableDefinition(table, docs);
    await remove(schemaDb, { table }, { multi: true });
    await Promise.all(definition.map((def) => insert(schemaDb, def)));

    return definition;
  };

  // snapshot at startup
  snapshot(dbpath);
  // analysis at startup
  // getFiles(dbpath)
  //   .filter((t) => !t.startsWith('__'))
  //   .map((t) => analysisSchema(t));

  // ping
  ipcMain.on('asynchronous-message', (event) => {
    event.reply('asynchronous-reply', 'pong');
  });

  // dbpath
  ipcMain.on('dbpath', (event) => {
    event.reply('dbpath', dbpath);
  });

  // tables: add / update
  ipcMain.on('table-post', async (event, { table, doc }) => {
    const newTable = await update(
      systemDb,
      { table },
      { table, ...doc },
      { upsert: true }
    );
    event.reply('table-post', newTable);
  });

  ipcMain.on('tables', (event) => {
    const tables = getFiles(dbpath).filter((t) => !t.startsWith('__'));
    event.reply('tables', tables);
  });

  // analysis
  ipcMain.on('analysis', async (event, arg) => {
    const tables = arg
      ? [arg]
      : getFiles(dbpath).filter((t) => !t.startsWith('__'));
    const definitions = await Promise.all(tables.map((t) => analysisSchema(t)));

    event.reply('analysis', definitions);
  });

  // db.find
  ipcMain.on('find', async (event, { table, query = {} }) => {
    const schema = await find(schemaDb, { table });

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

  // db.update
  ipcMain.on('export-csv', async (event, table) => {
    const db = dbs(table);
    const records = await find(db);
    const file = path.resolve(
      app.getPath('home'),
      `${table}-${new Date().getDate()}.csv`
    );
    writeCSV(file, records);
    event.reply('export-csv', file);
  });
}
