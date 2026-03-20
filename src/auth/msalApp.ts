import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const clientId = process.env.REACT_APP_AAD_CLIENT_ID;
const authority = process.env.REACT_APP_AAD_AUTHORITY ?? 'https://login.microsoftonline.com/common';
const postLogoutRedirectUri = process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI ?? window.location.origin;

if (!clientId) {
  throw new Error('REACT_APP_AAD_CLIENT_ID environment variable is required');
}

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri: window.location.origin,
    postLogoutRedirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const msalApp = new PublicClientApplication(msalConfig);
