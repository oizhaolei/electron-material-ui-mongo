export const initialState = {
  error: false,
  query: '',
  type: 'one-to-many',
  relation: {},
  code: '',
};
export const dataReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'QUERY_DATA_CHANGE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
