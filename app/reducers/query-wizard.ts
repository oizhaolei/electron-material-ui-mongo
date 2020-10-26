export const initialState = {
  error: false,
  name: '',
  params: [],
  code: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'QUERY_WIZARD_CLEAN':
       return {
         ...initialState,
       };
    case 'QUERY_DATA_CHANGE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
