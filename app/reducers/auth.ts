import dayjs from 'dayjs';

export const initialState = {
  isAuthenticated: false,
  error: '',
};
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case 'AUTHENTICATE':
      const isAuthenticated = payload.value === dayjs().format('MMDD');
      return {
        ...state,
        isAuthenticated,
        error: isAuthenticated ? '' : 'wrong password.',
      };
    case 'SIGNOUT':
      return {
        ...state,
        isAuthenticated: false,
        error: '',
      };
    default:
      return state;
  }
};
