/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';

import SchemaWizard from './containers/SchemaWizard';
import QueryWizard from './containers/QueryWizard';
import QueryPage from './containers/QueryPage';
import TablePage from './containers/TablePage';
import HomePage from './containers/HomePage';
import Color from './containers/ColorPage';
import PinCode from './containers/PinCode';
import TestPage from './containers/TestPage';
import ProductPage from './containers/ProductPage';
import TabsPage from './containers/TabsPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path="/products" component={ProductPage} exact />
        <Route path="/schema-wizard" component={SchemaWizard} exact />
        <Route path="/query-wizard" component={QueryWizard} exact />
        <Route path="/query/:query" component={QueryPage} exact />
        <Route path="/table/:table" component={TablePage} exact />
        <Route path="/test" component={TestPage} exact />
        <Route path="/tabs" component={TabsPage} exact />
        <Route path="/pincode" component={PinCode} exact />
        <Route path="/color" component={Color} exact />
        <Route path="/" component={HomePage} exact />
      </Switch>
    </App>
  );
}
