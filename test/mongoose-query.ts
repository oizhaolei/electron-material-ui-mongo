import vm from 'vm';

import Mdb from '../app/mdb';
import config from '../app/config';

const fk = {
  one: {
    table: 'patients',
    field: '患者番号',
  },
  many: {
    table: 'diseases',
    field: '患者番号',
  },
};
const main = async () => {
  const code = `
(({ mdb, filter, projection, options, callback }) => {
  (async () => {
    console.log('vm start.');

    const rows = await mdb['${fk.one.table}'].find(filter, projection, options).lean();
    const result = await Promise.all(rows.map(async (p) => {
      const many = await mdb['${fk.many.table}'].find({ ['${fk.many.field}']: p['${fk.one.field}'] }).lean();
      return {
        ...p,
        many,
      };
    }));
    console.log('vm end');
    callback(false, result);
  })();
})
`;

  return new Promise((resolve, reject) => {
    const mdb = new Mdb();
    const callback = (data) => {
      console.log('data', data);
      resolve(data);
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
