import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_AAD_CLIENT_ID as string | undefined;
const authority = (import.meta.env.VITE_AAD_AUTHORITY as string | undefined) ?? 'https://login.microsoftonline.com/common';
const postLogoutRedirectUri = (import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI as string | undefined) ?? window.location.origin;

if (!clientId) {
  throw new Error('VITE_AAD_CLIENT_ID environment variable is required');
}

// Ensure trailing slash so the URI exactly matches the SPA redirect registration in Azure AD.
// Vite dev server redirects bare-origin requests to origin + '/', so MSAL uses the
// post-redirect URL (with slash) when exchanging the auth code at the token endpoint.
const redirectUri = window.location.origin.replace(/\/?$/, '/');

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    redirectUri,
    postLogoutRedirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const msalApp = new PublicClientApplication(msalConfig);
