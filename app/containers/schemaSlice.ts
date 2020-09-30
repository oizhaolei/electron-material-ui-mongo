export const initialState = {
  error: false,
  table: '',
  definition: {},
  label: '',
  icon: 'ac_unit',
  suggests: {},
  foreighKeys: {},
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
