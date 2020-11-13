import vm from 'vm';

import Mdb from '../app/mdb';
import config from '../app/config';

const fk = {
  one: {
    table: 'patients',
    field: 'ユーザー番号',
  },
  many: {
    table: 'diseases',
    field: 'ユーザー番号',
  },
};
const main = async () => {
  const code = `
(({ mdb, filter, projection, options, callback }) => {
  (async () => {
    console.log('vm start.');
    try {
      const rows = await mdb['${fk.one.table}'].find(filter, projection, options).lean();
      const result = await Promise.all(rows.map(async (p) => {
        const many = await mdb['${fk.many.table}'].find({ '${fk.many.field}': p['${fk.one.field}'] }).lean();
        return {
          ...p,
          many,
        };
      }));
      console.log('vm end');
      callback(false, result);
    } catch (e) {
      console.log('e:', e);
      callback(e);
  })();
})
`;

  return new Promise((resolve, reject) => {
    const mdb = new Mdb();
    const callback = (err, data) => {
      console.log('err, data', err, data);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    };

    vm.runInThisContext(code)({ mdb, callback });
  });
};

mongoose.connect(config.mongoose.connect, config.mongoose.options).then(() => {
  main().then(() => {
    mongoose.disconnect();
    process.exit();
  }).catch((err) => {
    console.log('err:', err);
    mongoose.disconnect();
    process.exit();
  });
});
