//shamelessly stolen from: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/samples/react-sample-app/src/auth-utils.js
import { UserAgentApplication } from 'msal';

const clientId = process.env.REACT_APP_AAD_CLIENT_ID;
const authority = process.env.REACT_APP_AAD_AUTHORITY ?? 'https://login.microsoftonline.com/common';
const postLogoutRedirectUri = process.env.REACT_APP_POST_LOGOUT_REDIRECT_URI ?? window.location.origin;

if (!clientId) {
  throw new Error('REACT_APP_AAD_CLIENT_ID environment variable is required');
}

function isIE() {
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE ') > -1;
  const msie11 = ua.indexOf('Trident/') > -1;

  // If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
  // const isEdge = ua.indexOf("Edge/") > -1;
  return msie || msie11;
}

export const msalApp = new UserAgentApplication({
  auth: {
    clientId,
    authority,
    validateAuthority: true,
    postLogoutRedirectUri,
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: isIE()
  },
  system: {
    navigateFrameWait: 0
  }
});
