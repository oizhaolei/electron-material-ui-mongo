export const initialState = {
  error: false,
  name: '',
  definition: {},
  suggests: {},
  data: {},
};
export default (state = initialState, action) => {
  switch (action.type) {
    case 'SCHEMA_WIZARD_CHANGE':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
