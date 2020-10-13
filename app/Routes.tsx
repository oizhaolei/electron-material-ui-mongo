/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
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

const fakeAuth = {
  isAuthenticated: false,
  authenticate(value, cb) {
    this.isAuthenticated = true;
    if (cb) cb(null);
  },
  signout(cb) {
    this.isAuthenticated = false;
    if (cb) cb(null);
  }
};

function PrivateRoute({ component: Component, ...rest }) {
  console.log('fakeAuth:', fakeAuth);
  return (
    <Route
      {...rest}
      render={(props) =>
        fakeAuth.isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/pincode",
            }}
          />
        )
      }
    />
  );
}

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path="/pincode" exact >
          <PinCode auth={fakeAuth} />
        </Route>
        <PrivateRoute path="/schema-wizard" exact >
          <SchemaWizard />
        </PrivateRoute>
        <PrivateRoute path="/query-wizard" exact >
          <QueryWizard />
        </PrivateRoute>
        <PrivateRoute path="/query/:name" exact >
          <QueryPage />
        </PrivateRoute>
        <PrivateRoute path="/table/:name" exact >
          <SchemaPage />
        </PrivateRoute>
        <PrivateRoute path="/test" exact >
          <TestPage />
        </PrivateRoute>
        <PrivateRoute path="/tabs" exact >
          <TabsPage />
        </PrivateRoute>
        <PrivateRoute path="/color" exact >
          <Color />
        </PrivateRoute>
        <PrivateRoute path="/" exact >
          <HomePage />
        </PrivateRoute>
      </Switch>
    </App>
  );
}
