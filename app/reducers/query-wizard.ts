interface StateType {
  error: boolean;
  tested: boolean;
  name: string;
  memo: string;
  params: string[];
  code: string;
}
interface ActionType {
  type: string;
  payload: StateType;
}

export const initialState = {
  error: false,
  tested: false,
  name: '',
  memo: '',
  params: [],
  code: '',
};

export default (state = initialState, action: ActionType) => {
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
