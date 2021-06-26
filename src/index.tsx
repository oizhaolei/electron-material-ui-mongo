import React from 'react';
import { render } from 'react-dom';

import Routes from './Routes';
import rootReducer from './reducers';
import Store from './store/Store';
import './i18n';

render(
  <Store rootReducer={rootReducer}>
    <Routes />
  </Store>,
  document.getElementById('root')
);
