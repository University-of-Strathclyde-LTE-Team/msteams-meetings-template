import { Middleware } from 'redux';
import { msalApp } from './msalApp';
import {
  CHECK_FOR_SIGNEDIN_USER_COMMAND,
  OPEN_SIGNIN_DIALOG_COMMAND,
  SIGNIN_COMPLETE_EVENT,
  SigninCompleteEvent,
  SIGNOUT_COMMAND,
  SIGNOUT_COMPLETE_EVENT
} from './actions';
import { replace } from 'connected-react-router';

export function createAuthMiddleware(): Middleware {
  return store => next => action => {
    if (action.type === CHECK_FOR_SIGNEDIN_USER_COMMAND) {
      const account = msalApp.getAccount();
      console.log('[AuthMiddleware] CHECK_FOR_SIGNEDIN_USER_COMMAND — account:', account?.userName ?? 'none');
      if (!account) {
        store.dispatch(replace('/signin'));
      }
    }

    if (action.type === OPEN_SIGNIN_DIALOG_COMMAND) {
      console.log('[AuthMiddleware] OPEN_SIGNIN_DIALOG_COMMAND — opening login popup...');
      msalApp
        .loginPopup({
          scopes: ['OnlineMeetings.ReadWrite']
        })
        .then(response => {
          console.log('[AuthMiddleware] Login succeeded for:', response.account?.userName);
          store.dispatch({
            type: SIGNIN_COMPLETE_EVENT,
            idToken: response.idToken
          } as SigninCompleteEvent);
        })
        .catch(error => {
          console.error('[AuthMiddleware] Login failed:', error);
        });
    }

    if (action.type === SIGNIN_COMPLETE_EVENT) {
      console.log('[AuthMiddleware] SIGNIN_COMPLETE_EVENT — redirecting to /');
      store.dispatch(replace('/'));
    }

    if (action.type === SIGNOUT_COMMAND) {
      console.log('[AuthMiddleware] SIGNOUT_COMMAND — logging out');
      msalApp.logout();
      store.dispatch({
        type: SIGNOUT_COMPLETE_EVENT
      });
    }

    next(action);
  };
}
