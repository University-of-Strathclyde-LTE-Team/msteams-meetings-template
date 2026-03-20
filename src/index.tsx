import React from 'react';
import { createRoot } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import App from './App';
import { getUserLocale, getMessages } from './localization/translate';
import { msalApp } from './auth/msalApp';

const userLocale = getUserLocale();

msalApp.initialize().then(() => {
  return getMessages();
}).then(messages => {
  const container = document.getElementById('root')!;
  createRoot(container).render(
    <IntlProvider locale={userLocale} messages={messages}>
      <App />
    </IntlProvider>
  );
}).catch(err => {
  console.error('Failed to initialise application:', err);
});

