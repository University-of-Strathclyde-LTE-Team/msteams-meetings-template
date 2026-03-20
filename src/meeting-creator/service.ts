import { OnlineMeetingInput, OnlineMeeting } from './models';
import { msalApp } from '../auth/msalApp';
import axios from 'axios';
import moment from 'moment';

const SILENT_TOKEN_TIMEOUT_MS = 5000;

function acquireTokenSilentWithTimeout(scopes: string[]) {
  const account = msalApp.getAllAccounts()[0];
  if (!account) {
    return Promise.reject(new Error('No signed-in account found'));
  }
  return Promise.race([
    msalApp.acquireTokenSilent({ scopes, account }),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`acquireTokenSilent timed out after ${SILENT_TOKEN_TIMEOUT_MS}ms`)),
        SILENT_TOKEN_TIMEOUT_MS
      )
    )
  ]);
}

export function createMeetingService() {
  return {
    async createMeeting(meeting: OnlineMeetingInput) {
      console.group('[MeetingService] createMeeting');
      console.log('Input:', {
        subject: meeting.subject,
        startDateTime: meeting.startDateTime?.toISOString(),
        endDateTime: meeting.endDateTime?.toISOString(),
      });

      let token: any;
      try {
        console.log(`[MeetingService] Attempting silent token acquisition (timeout: ${SILENT_TOKEN_TIMEOUT_MS}ms)...`);
        token = await acquireTokenSilentWithTimeout(['OnlineMeetings.ReadWrite']);
        console.log('[MeetingService] Silent token acquired. Expires:', token.expiresOn);
      } catch (ex) {
        const err = ex as any;
        console.warn('[MeetingService] Silent token failed, falling back to popup:', err.message ?? err);
        try {
          console.log('[MeetingService] Opening token acquisition popup...');
          token = await msalApp.acquireTokenPopup({
            scopes: ['OnlineMeetings.ReadWrite']
          });
          console.log('[MeetingService] Popup token acquired. Expires:', token.expiresOn);
        } catch (popupEx) {
          console.error('[MeetingService] Popup token acquisition failed:', popupEx);
          console.groupEnd();
          throw popupEx;
        }
      }

      const requestBody = {
        startDateTime: meeting.startDateTime?.toISOString(),
        endDateTime: meeting.endDateTime?.toISOString(),
        subject: meeting.subject
      };

      const api = 'https://graph.microsoft.com/beta/me/onlineMeetings';
      console.log('[MeetingService] POST', api);
      console.log('[MeetingService] Request body:', requestBody);

      let response;
      try {
        response = await axios.post(
          api,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
              'Content-type': 'application/json'
            }
          }
        );
        console.log('[MeetingService] Graph API response status:', response.status);
        console.log('[MeetingService] Graph API response data:', response.data);
      } catch (apiEx) {
        const err = apiEx as any;
        console.error('[MeetingService] Graph API request failed');
        if (err.response) {
          console.error('  Status:', err.response.status, err.response.statusText);
          console.error('  Response data:', err.response.data);
          console.error('  Headers:', err.response.headers);
        } else if (err.request) {
          console.error('  Request was made but no response received (network issue or CORS?)');
          console.error('  Request:', err.request);
        } else {
          console.error('  Error:', err.message);
        }
        console.groupEnd();
        throw apiEx;
      }

      const preview = decodeURIComponent(
        (response.data.joinInformation?.content?.split(',')?.[1] ?? '').replace(
          /\+/g,
          '%20'
        )
      );

      const createdMeeting = {
        id: response.data.id,
        creationDateTime: moment(response.data.creationDateTime),
        subject: response.data.subject,
        joinUrl: response.data.joinUrl,
        joinWebUrl: response.data.joinWebUrl,
        startDateTime: moment(response.data.startDateTime),
        endDateTime: moment(response.data.endDateTime),
        conferenceId: response.data.audioConferencing?.conferenceId || '',
        tollNumber: response.data.audioConferencing?.tollNumber || '',
        tollFreeNumber: response.data.audioConferencing?.tollFreeNumber || '',
        dialinUrl: response.data.audioConferencing?.dialinUrl || '',
        videoTeleconferenceId: response.data.videoTeleconferenceId,
        preview
      } as OnlineMeeting;

      console.log('[MeetingService] Meeting created successfully:', {
        id: createdMeeting.id,
        joinWebUrl: createdMeeting.joinWebUrl,
        subject: createdMeeting.subject,
      });
      console.groupEnd();
      return createdMeeting;
    }
  };
}
