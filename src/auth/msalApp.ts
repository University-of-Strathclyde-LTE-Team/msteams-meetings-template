import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_AAD_CLIENT_ID as string | undefined;
const authority = (import.meta.env.VITE_AAD_AUTHORITY as string | undefined) ?? 'https://login.microsoftonline.com/common';
const postLogoutRedirectUri = (import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI as string | undefined) ?? window.location.origin;

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
