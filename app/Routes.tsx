/* eslint react/jsx-props-no-spreading: off */
import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import StoreContext from './store/StoreContext';

import App from './containers/App';

import SchemaWizard from './containers/SchemaWizard';
import QueryWizard from './containers/QueryWizard';
import QueryPage from './containers/QueryPage';
import SchemaPage from './containers/SchemaPage';
import HomePage from './containers/HomePage';
import Color from './containers/ColorPage';
import PinCode from './containers/PinCode';
import SettingPage from './containers/SettingPage';

function PrivateRoute({ component: Component, ...rest }) {
  const [{ auth }] = useContext(StoreContext);
  return (
    <Route
      {...rest}
      render={(props) =>
        auth.isAuthenticated ? (
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
        <Route path="/pincode" exact component={PinCode} />
        <PrivateRoute path="/schema-wizard" exact component={SchemaWizard} />
        <PrivateRoute path="/query-wizard" exact component={QueryWizard} />
        <PrivateRoute path="/query/:name" exact component={QueryPage} />
        <PrivateRoute path="/table/:name" exact component={SchemaPage} />
        <PrivateRoute path="/color" exact component={Color} />
        <PrivateRoute path="/setting" exact component={SettingPage} />
        <PrivateRoute path="/" exact component={HomePage} />
      </Switch>
    </App>
  );
}
