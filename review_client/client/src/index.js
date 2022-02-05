import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import promiseMiddleware from "redux-promise";
import ReduxThunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import rootReducer from './redux/reducers'

import './assets/boxicons-2.0.7/css/boxicons.min.css'
import './assets/css/grid.css'
import './assets/css/theme.css'
import './assets/css/index.css'

import Layout from './components/layout/Layout'

const createStoreWithMiddleware = applyMiddleware(
  promiseMiddleware,
  ReduxThunk
)(createStore);

document.title = 'CoLink'

ReactDOM.render(
  <Provider
    store={createStoreWithMiddleware(
      rootReducer,
      composeWithDevTools()
    )}
  >
    <React.StrictMode>
      <Layout />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);

