interface PayloadType {
  value: string;
}
interface ActionType {
  type: string;
  payload: PayloadType;
}

export const initialState = {
  isConnected: false,
  error: '',
};
export default (state = initialState, { type, payload }: ActionType) => {
  switch (type) {
    case 'CONNECTED':
      return {
        ...state,
        isConnected: true,
      };
    case 'DISCONNECT':
      return {
        ...state,
        isConnected: false,
        error: '',
      };
    default:
      return state;
  }
};
