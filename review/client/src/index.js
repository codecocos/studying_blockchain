import "./assets/css/grid.css";
import "./assets/css/theme.css";
import "./assets/css/index.css";
import "./assets/boxicons-2.1.1/css/boxicons.min.css";

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { Provider } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import promiseMiddleware from "redux-promise";
import ReduxThunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import rootReducer from "./redux/reducers/index";

import Layout from './components/layout/layout';

// import { createMuiTheme, ThemeProvider } from "@material-ui/core";

// const theme = createMuiTheme({
//   palette: {
//     type: "dark",
//   },
// });


const createStoreWithMiddleware = applyMiddleware(
  promiseMiddleware,
  ReduxThunk
)(createStore);

ReactDOM.render(
  // <ThemeProvider theme={theme}>
  <Provider
    store={createStoreWithMiddleware(
      rootReducer,
      composeWithDevTools()
    )}
  >
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </Provider>,
  // </ThemeProvider>,
  document.getElementById('root')
);

