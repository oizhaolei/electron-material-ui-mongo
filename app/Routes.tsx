/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import App from './containers/App';
import Dashboard from './containers/Dashboard';
import Checkout from './containers/Checkout';

import ProductPage from './containers/ProductPage';
import HomePage from './containers/HomePage';

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
        <Route path="/" component={HomePage} exact />
        {/* <Route path="/checkout" component={Checkout} /> */}
        {/* <Route path={routes.COUNTER} component={CounterPage} /> */}
        {/* <Route path="/" component={Dashboard} /> */}
      </Switch>
    </App>
  );
}
