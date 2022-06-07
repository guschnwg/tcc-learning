import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import ReactModal from 'react-modal';

import countries from 'i18n-iso-countries';
import brCountries from 'i18n-iso-countries/langs/pt.json';

import App from './components/App';
import reportWebVitals from './reportWebVitals';

import './index.css';

countries.registerLocale(brCountries);

ReactModal.setAppElement(
  document.getElementById('modal-container') || document.body.appendChild(document.createElement('div'))
);

ReactDOM.render(
  <BrowserRouter basename='/tcc-learning'>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
