import { combineReducers } from 'redux';
import { MeetingState } from './meeting-creator/state';
import { meetingReducer } from './meeting-creator/reducers';

export interface AppState {
  meeting: MeetingState;
}

export function createRootReducer() {
  return combineReducers({
    meeting: meetingReducer
  });
}
