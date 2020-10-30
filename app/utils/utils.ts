// 'boolean', 'numeric', 'date', 'datetime', 'time', 'currency'
//
export const mongo2MaterialType = (from) => {
  const mongo = ['Boolean', 'Number', 'Date', 'Date', 'Date', 'Number'];
  const mt = ['boolean', 'numeric', 'date', 'datetime', 'time', 'currency'];

  const index = mongo.indexOf(from);
  if (index >= 0) {
    return mt[index];
  }

  return undefined;
};

const ID_COLUMN = {
  field: '_id',
  hidden: true,
};
// from: mongo schema { definition, suggests }
// to: material table columns definition
export const mongo2Material = ({ definition, suggests }) =>
  Object.keys(definition)
    .map((k) => ({
      title: k,
      field: k,
      type: mongo2MaterialType(definition[k].type),
      headerStyle: {
        whiteSpace: 'nowrap',
      },
      lookup:
        suggests && suggests[k]
          ? suggests[k].reduce((r, v) => ((r[v] = v), r), {})
          : undefined,
    }))
    .concat(ID_COLUMN);
