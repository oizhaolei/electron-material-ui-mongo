import { mongo2Material } from '../utils/utils';
import { MaterialTableColumnType } from '../types';

interface PayloadType {
  error: boolean;
  name: string;
  memo: string;
  definition: unknown;
  suggests: unknown;
  changeList: unknown[];
  changes: unknown;
  materialDefinition: [MaterialTableColumnType];
  field: string;
  value: string;
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
  changeList: [],
  changes: {},
  materialDefinition: [],
};
export default (state = initialState, { type, payload }: ActionType) => {
  let newState;
  // let newDefinition;
  switch (type) {
    case 'SCHEMA_INIT':
      return {
        ...initialState,
      };
    case 'SCHEMA_CHANGE':
      newState = {
        ...state,
        ...payload,
      };

      newState = {
        ...newState,
        materialDefinition: mongo2Material(newState),
      };
      return newState;
    case 'SCHEMA_DATA_CLEAR':
      return {
        ...state,
        changeList: [],
        changes: {},
      };
    case 'SCHEMA_DATA_CHANGE':
      return {
        ...state,
        changeList: payload.list,
        changes: {
          ...state.changes,
          [payload.field]: payload.value,
        },
      };
    default:
      return state;
  }
};
