import { ipcMain } from 'electron';
import Datastore from 'nedb';
import path from 'path';

import { getFiles } from './utils/utils';

export default function ipc({ dbPath }) {
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);
    event.reply('asynchronous-reply', 'pong');
  });

  ipcMain.on('dbPath', (event) => {
    event.reply('dbPath', dbPath);
  });

  ipcMain.on('tables', (event) => {
    const tables = getFiles(dbPath).filter((t) => t !== '_system');
    event.reply('tables', tables);
  });

  ipcMain.on('analysis', async (event, arg) => {
    const sdb = new Datastore({
      filename: path.resolve(dbPath, '_system'),
      autoload: true,
    });

    const analysisTable = async (table) =>
      new Promise((resolve, reject) => {
        const db = new Datastore({
          filename: path.resolve(dbPath, table),
          autoload: true,
        });
        db.find({}, (err, docs) => {
          console.log(table, 'docs:', docs);
          if (err) {
            reject(err);
          } else {
            const definition = Object.keys(docs[0]).map((f) => ({
              table,
              title: f.toUpperCase(),
              field: f,
            }));
            sdb.update(
              {
                table,
              },
              definition,
              {
                upsert: true,
                multi: true,
              },
              (err1, numReplaced, upsert) => {
                if (err1) {
                  reject(err1);
                  return;
                }

                console.log('upsert:', table, numReplaced, upsert);
              }
            );
            resolve(definition);
          }
        });
      });
    const definition = await analysisTable(arg);

    event.reply('analysis', definition);
  });
}
