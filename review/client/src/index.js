import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import '../src/css/index.css';

import TestingBoard from './TestingBoard';

ReactDOM.render(
  <BrowserRouter>
    <TestingBoard />
  </BrowserRouter>,
  document.getElementById('root')
);

