interface PayloadType {
  error: boolean;
  name: string;
  memo: string;
  params: string[];
  code: string;
  filter: unknown;
  definition: unknown;
  data: unknown;
}
interface ActionType {
  type: string;
  payload: PayloadType;
}

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
export default (state = initialState, { type, payload }: ActionType) => {
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
