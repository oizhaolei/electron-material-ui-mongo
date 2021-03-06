import { mongo2Material } from '../utils/utils';
import { MaterialTableColumnType } from '../types';

interface PayloadType {
  error: boolean;
  name: string;
  memo: string;
  definition: unknown;
  suggests: unknown;
  materialDefinition: [MaterialTableColumnType];
  data: unknown;
  field: string;
  type: string;
}
interface ActionType {
  type: string;
  payload: PayloadType;
}

export const initialState = {
  error: false,
  name: '',
  memo: '',
  definition: {},
  suggests: {},
  materialDefinition: [],
  data: {},
};
export default (state = initialState, { type, payload }: ActionType) => {
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
