export const initialState = {
  error: false,
  tested: false,
  name: '',
  memo: '',
  params: [],
  code: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'QUERY_WIZARD_CLEAN':
      return {
        ...initialState,
      };
    case 'QUERY_WIZARD_DEFINITION_CHANGE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
