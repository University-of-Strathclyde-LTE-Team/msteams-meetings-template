import { Middleware } from 'redux';
import { msalApp } from './msalApp';
import type { NavigateFunction } from 'react-router-dom';
import {
  CHECK_FOR_SIGNEDIN_USER_COMMAND,
  OPEN_SIGNIN_DIALOG_COMMAND,
  SIGNIN_COMPLETE_EVENT,
  SigninCompleteEvent,
  SIGNOUT_COMMAND,
  SIGNOUT_COMPLETE_EVENT
} from './actions';

export function createAuthMiddleware(getNavigate: () => NavigateFunction): Middleware {
  return store => next => action => {
    if (action.type === CHECK_FOR_SIGNEDIN_USER_COMMAND) {
      const account = msalApp.getAllAccounts()[0] ?? null;
      console.log('[AuthMiddleware] CHECK_FOR_SIGNEDIN_USER_COMMAND — account:', account?.username ?? 'none');
      if (!account) {
        getNavigate()('/signin', { replace: true });
      }
    }

    if (action.type === OPEN_SIGNIN_DIALOG_COMMAND) {
      console.log('[AuthMiddleware] OPEN_SIGNIN_DIALOG_COMMAND — opening login popup...');
      msalApp
        .loginPopup({
          scopes: ['OnlineMeetings.ReadWrite']
        })
        .then(response => {
          console.log('[AuthMiddleware] Login succeeded for:', response.account?.username);
          store.dispatch({
            type: SIGNIN_COMPLETE_EVENT,
            account: response.account
          } as SigninCompleteEvent);
        })
        .catch(error => {
          console.error('[AuthMiddleware] Login failed:', error);
        });
    }

    if (action.type === SIGNIN_COMPLETE_EVENT) {
      console.log('[AuthMiddleware] SIGNIN_COMPLETE_EVENT — redirecting to /');
      getNavigate()('/', { replace: true });
    }

    if (action.type === SIGNOUT_COMMAND) {
      console.log('[AuthMiddleware] SIGNOUT_COMMAND — logging out');
      msalApp.logoutPopup().catch(err => console.error('[AuthMiddleware] Logout failed:', err));
      store.dispatch({
        type: SIGNOUT_COMPLETE_EVENT
      });
    }

    next(action);
  };
}
