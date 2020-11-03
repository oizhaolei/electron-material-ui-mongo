export const initialState = {
  error: false,
  name: '',
  memo: '',
  params: [],
  code: '',
  filter: {},
  definition: {},
  data: {},
};
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'QUERY_INIT':
      return {
        ...initialState,
      };
    case 'QUERY_CHANGE':
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
};
