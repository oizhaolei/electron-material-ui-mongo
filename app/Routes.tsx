/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import dayjs from 'dayjs';

import App from './containers/App';

import SchemaWizard from './containers/SchemaWizard';
import QueryWizard from './containers/QueryWizard';
import QueryPage from './containers/QueryPage';
import SchemaPage from './containers/SchemaPage';
import HomePage from './containers/HomePage';
import Color from './containers/ColorPage';
import PinCode from './containers/PinCode';

const fakeAuth = {
  isAuthenticated: true,
  authenticate(value, cb) {
    const check = value === dayjs().format('MMDD');
    this.isAuthenticated = check;
    if (cb) cb(check ? null : 'wrong password.');
  },
  signout(cb) {
    this.isAuthenticated = false;
    if (cb) cb(null);
  }
};

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        fakeAuth.isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/pincode',
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
        <PrivateRoute path="/schema-wizard" exact component={SchemaWizard} />
        <PrivateRoute path="/query-wizard" exact component={QueryWizard} />
        <PrivateRoute path="/query/:name" exact component={QueryPage} />
        <PrivateRoute path="/table/:name" exact component={SchemaPage} />
        <PrivateRoute path="/color" exact component={Color} />
        <PrivateRoute path="/" exact component={HomePage} />
      </Switch>
    </App>
  );
}
