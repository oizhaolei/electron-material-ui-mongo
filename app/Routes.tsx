/* eslint react/jsx-props-no-spreading: off */
import React, { lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';

import TablePage from './containers/TablePage';
import HomePage from './containers/HomePage';
import PinCode from './containers/PinCode';

import ProductPage from './containers/ProductPage';
import TestPage from './containers/TestPage';
import TabsPage from './containers/TabsPage';

// Lazily load routes and code split with webpack
const LazySchemaWizard = lazy(() =>
  import(/* webpackChunkName: "SchemaWizard" */ './containers/SchemaWizard')
);
const SchemaWizard = (props) => (
  <Suspense fallback={<h1>Loading...</h1>}>
    <LazySchemaWizard {...props} />
  </Suspense>
);
const LazyColorPage = lazy(() =>
  import(/* webpackChunkName: "ColorPage" */ './containers/ColorPage')
);
const ColorPage = (props) => (
  <Suspense fallback={<h1>Loading...</h1>}>
    <LazyColorPage {...props} />
  </Suspense>
);
const LazyTablePage = lazy(() =>
  import(/* webpackChunkName: "TablePage" */ './containers/TablePage')
);
const TablePage = (props) => (
  <Suspense fallback={<h1>Loading...</h1>}>
    <LazyTablePage {...props} />
  </Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path="/products" component={ProductPage} exact />
        <Route path="/test" component={TestPage} exact />
        <Route path="/tabs" component={TabsPage} exact />

        <Route path="/schema-wizard" component={SchemaWizard} exact />
        <Route path="/table/:table" component={TablePage} exact />
        <Route path="/pincode" component={PinCode} exact />
        <Route path="/color" component={ColorPage} exact />
        <Route path="/" component={HomePage} exact />
      </Switch>
    </App>
  );
}
