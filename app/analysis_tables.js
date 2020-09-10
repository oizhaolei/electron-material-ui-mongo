/**
 * analysis all tables except "_system"
 */
import Datastore from 'nedb';
import path from 'path';
import fs from 'fs';

export const getFiles = (source) =>
  fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);

const dbPath = '/Users/zhaolei/.personal.db';

const sdb = new Datastore({
  filename: path.resolve(dbPath, '_system'),
});
sdb.loadDatabase((err) => {
  console.log('sdb.loadDatabase:', err);
});

const analysisTable = (table) => {
  const db = new Datastore({
    filename: path.resolve(dbPath, table),
  });
db.loadDatabase((err) => {
  console.log('db.loadDatabase:', err, table);
});

  db.find({}, (err, docs) => {
    console.log(table, 'docs:', docs);
    // docs is an array containing documents Mars, Earth, Jupiter
    // If no document is found, docs is equal to []

    if (docs.length > 0) {
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
          console.log('upsert:', table, numReplaced, upsert);
        });
    }
  });
};

const main = async () => {
  console.log('new Date():', new Date());

  const tables = getFiles(dbPath).filter((t) => t !== '_system');
  tables.forEach(analysisTable);
};

main();
