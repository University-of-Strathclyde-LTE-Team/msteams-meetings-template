import { Middleware } from 'redux';
import { CREATE_MEETING_COMMAND, MEETING_CREATED_EVENT } from './actions';
import { createMeetingService } from './service';
import { push } from 'connected-react-router';

export function createMeetingMiddleware(): Middleware {
  const service = createMeetingService();

  return store => next => action => {
    if (action.type === CREATE_MEETING_COMMAND) {
      console.group('[MeetingMiddleware] CREATE_MEETING_COMMAND received');
      console.log('Meeting input:', action.meeting);
      console.groupEnd();

      service
        .createMeeting(action.meeting)
        .then(meeting => {
          console.log('[MeetingMiddleware] Dispatching MEETING_CREATED_EVENT', meeting);
          store.dispatch({
            type: MEETING_CREATED_EVENT,
            meeting
          });
        })
        .catch(error => {
          console.error('[MeetingMiddleware] createMeeting rejected, navigating to /error');
          console.error(error);
          store.dispatch(push('/error'));
        });
    }

    if (action.type === MEETING_CREATED_EVENT) {
      console.group('[MeetingMiddleware] MEETING_CREATED_EVENT received');
      const url = new URL(document.location.href);
      let clientDomain = url.searchParams.get('url');
      let clientEditor = url.searchParams.get('editor');
      console.log('clientDomain:', clientDomain, '| clientEditor:', clientEditor);

      if (clientDomain) {
        let returnUrl = new URL(clientDomain + '/lib/editor/tiny/plugins/teamsmeeting/result.php');
        if (clientEditor === 'atto') {
          returnUrl = new URL(clientDomain + '/lib/editor/atto/plugins/teamsmeeting/result.php');
        }
        let returnUrlSearchParams = returnUrl.searchParams;
        returnUrlSearchParams.set('link', action.meeting.joinWebUrl);
        returnUrlSearchParams.set('title', action.meeting.subject);
        returnUrlSearchParams.set('preview', action.meeting.preview);
        let courseId = url.searchParams.get('courseid');
        if (courseId) {
          returnUrlSearchParams.set('courseid', courseId);
        }
        let msession = url.searchParams.get('msession');
        if (msession) {
          returnUrlSearchParams.set('session', msession);
        }
        returnUrl.search = returnUrlSearchParams.toString();
        console.log('[MeetingMiddleware] Redirecting to Moodle:', returnUrl.toString());
        console.groupEnd();
        document.location.href = returnUrl.toString();
      } else {
        console.log('[MeetingMiddleware] No clientDomain — navigating to /copyMeeting');
        console.groupEnd();
        store.dispatch(push('/copyMeeting'));
      }
    }

    next(action);
  };
}