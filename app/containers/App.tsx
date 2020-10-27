import React, { ReactNode } from 'react';
import rootReducer from '../reducers';
import Store from '../store/Store';

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  return <Store rootReducer={rootReducer}>{children}</Store>;
}
