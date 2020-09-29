export const initialState = {
  table: '',
  definition: {},
  label: '',
  icon: 'ac_unit',
  suggests: {},
  foreighTabless: {},
  foreighKeyss: {},
  data: {},
  files: [],
};
export const dataReducer = (dataState, action) => {
  switch (action.type) {
    case 'DATA_CHANGE':
      return {
        ...dataState,
        ...action.payload,
      };
    default:
      return dataState;
  }
};
