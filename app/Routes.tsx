/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';

import Checkout from './containers/Checkout';
import ProductPage from './containers/ProductPage';
import TablePage from './containers/TablePage';
import HomePage from './containers/HomePage';
import TestPage from './containers/TestPage';

// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(() =>
  import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
);

const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path="/products" component={ProductPage} exact />
        <Route path="/checkout" component={Checkout} exact />
        <Route path="/table/:table" component={TablePage} exact />
        <Route path="/test" component={TestPage} exact />
        <Route path="/" component={HomePage} exact />
      </Switch>
    </App>
  );
}
