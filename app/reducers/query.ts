export const initialState = {
  error: false,
  name: '',
  type: 'one-to-many',
  relation: {},
  code: '',
  definition: {},
  data: {},
};

const genCode = ({ one, many }) => `
(({ models, filter, projection, options, callback }) => {
  (async () => {
    console.log('vm start.');

    const rows = await models['${one.table}'].find(filter, projection, options).lean();
    const result = await Promise.all(rows.map(async (p) => {
      const many = await models['${many.table}'].find({ ['${many.field}']: p['${one.field}'] }).lean();
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

export const dataReducer = (state = initialState, action) => {
  switch (action.type) {
  case 'QUERY_DATA_CHANGE':
    return {
      ...state,
      ...action.payload,
    };
  case 'QUERY_RELATION_CHANGE':
    const relation = {
      ...state.relation,
      ...action.payload,
    };
    const error = !relation.one || !relation.many;
    const code = relation.one && relation.many && genCode(relation);
    return {
      ...state,
      relation,
      error,
      code,
    };
  default:
    return state;
  }
};
