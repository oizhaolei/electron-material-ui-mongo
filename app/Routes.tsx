/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';

import SchemaWizard from './containers/SchemaWizard';
import QueryWizard from './containers/QueryWizard';
import QueryPage from './containers/QueryPage';
import SchemaPage from './containers/SchemaPage';
import HomePage from './containers/HomePage';
import Color from './containers/ColorPage';
import PinCode from './containers/PinCode';
import TestPage from './containers/TestPage';
import TabsPage from './containers/TabsPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path="/pincode" exact >
          <PinCode />
        </Route>
        <Route path="/schema-wizard" exact >
          <SchemaWizard />
        </Route>
        <Route path="/query-wizard" exact >
          <QueryWizard />
        </Route>
        <Route path="/query/:name" exact >
          <QueryPage />
        </Route>
        <Route path="/table/:name" exact >
          <SchemaPage />
        </Route>
        <Route path="/test" exact >
          <TestPage />
        </Route>
        <Route path="/tabs" exact >
          <TabsPage />
        </Route>
        <Route path="/color" exact >
          <Color />
        </Route>
        <Route path="/" exact >
          <HomePage />
        </Route>
      </Switch>
    </App>
  );
}
