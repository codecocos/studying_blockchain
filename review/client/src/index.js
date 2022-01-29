import React from 'react';
import ReactDOM from 'react-dom';
import '../src/css/index.css';
import { BrowserRouter } from 'react-router-dom';

import TestingBoard from './TestingBoard';

ReactDOM.render(
  <BrowserRouter>
    <TestingBoard />
  </BrowserRouter>,
  document.getElementById('root')
);

