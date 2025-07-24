export const EXT_INFO = {
  name: 'Spotify Lyrics',
  id: 'spotify-lyrics',
  description: 'View lyrics for the currently playing Spotify track.'
};

export const COMMANDS = {
  TEST: 'spotify-lyrics.test',
  LOGIN: 'spotify-lyrics.login'
} as const;

export const WEBVIEW_VIEW_ID = 'spotify-lyrics.view';

export const MESSAGES = {
  REQ_AUTH_STATUS: 'request-auth-status',
  SEND_AUTH_STATUS: 'send-auth-status',
  REQ_LOG_IN: 'request-log-in',
  REQ_LOG_OUT: 'request-log-out',
  REQ_TRACK: 'request-current-track',
  SEND_TRACK: 'send-current-track'
} as const;

export const EVENTS = {
  AUTH_STATUS_CHANGED: 'authStatusChanged'
} as const;

export const BUTTONS = {
  LOG_IN: 'Log in'
} as const;
