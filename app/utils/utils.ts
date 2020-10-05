import fs from 'fs';

// 'boolean', 'numeric', 'date', 'datetime', 'time', 'currency'
//
export const mongo2MaterialType = (from) => {
  const mongo = ['Boolean', 'Number', 'Date', 'Date', 'Date', 'Number'];
  const mt = ['boolean', 'numeric', 'date', 'datetime', 'time', 'currency'];

  const index = mongo.indexOf(from);
  if ( index >= 0) {
    return mt[index];
  }

  return undefined;
};
