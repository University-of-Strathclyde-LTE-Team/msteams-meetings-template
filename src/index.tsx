import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import App from './App';
import { getUserLocale, getMessages } from './localization/translate';
import { msalApp } from './auth/msalApp';

const userLocale = getUserLocale();

msalApp.initialize().then(() => {
  return getMessages();
}).then(messages => {
  ReactDOM.render(
    <IntlProvider locale={userLocale} messages={messages}>
      <App />
    </IntlProvider>,
    document.getElementById('root')
  );
}).catch(err => {
  console.error('Failed to initialise application:', err);
});

