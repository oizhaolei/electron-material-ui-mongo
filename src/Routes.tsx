/* eslint react/jsx-props-no-spreading: off */
import React, { useContext } from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';

import StoreContext from './store/StoreContext';

import SchemaWizard from './containers/SchemaWizard';
import QueryWizard from './containers/QueryWizard';
import QueryPage from './containers/QueryPage';
import SchemaPage from './containers/SchemaPage';
import HomePage from './containers/HomePage';
import Connection from './containers/Connection';
import SettingPage from './containers/SettingPage';

function PrivateRoute({ component: Component, ...rest }) {
  const [{ mongodb }] = useContext(StoreContext);
  return (
    <Route
      {...rest}
      render={(props) =>
        mongodb.isConnected ? (
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
    <HashRouter>
      <Switch>
        <Route path="/pincode" exact component={Connection} />
        <PrivateRoute path="/schema-wizard" exact component={SchemaWizard} />
        <PrivateRoute path="/query-wizard" exact component={QueryWizard} />
        <PrivateRoute path="/query/:name" exact component={QueryPage} />
        <PrivateRoute path="/table/:name" exact component={SchemaPage} />
        <PrivateRoute path="/setting" exact component={SettingPage} />
        <PrivateRoute path="/" exact component={HomePage} />
      </Switch>
    </HashRouter>
  );
}
