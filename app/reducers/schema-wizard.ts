import { mongo2Material } from '../utils/utils';

export const initialState = {
  error: false,
  name: '',
  memo: '',
  definition: {},
  suggests: {},
  materialDefinition: [],
  data: {},
};
export default (state = initialState, { type, payload }) => {
  let newState;
  switch (type) {
    case 'SCHEMA_WIZARD_CLEAN':
       return {
         ...initialState,
       };
    case 'SCHEMA_WIZARD_SCHEMA_TYPE_CHANGE':
      newState = {
        ...state,
        definition: {
          ...state.definition,
          [payload.field]: {
            type: payload.type,
          },
        },
      };
      newState = {
        ...newState,
        materialDefinition: mongo2Material(newState),
      };
      return newState;
    case 'SCHEMA_WIZARD_INIT':
      newState = {
        ...state,
        ...payload,
      };

      newState = {
        ...newState,
        materialDefinition: mongo2Material(newState),
      };
      return newState;
    default:
      return state;
  }
};
