export const STORAGE_KEYS = {
  SECTION_GROUPS: 'sectionGroups'
} as const;

export const DEFAULT_TIME_BLOCKS = {
  START: '09:00',
  END: '17:00'
} as const;

export const TIME_FORMAT_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const BLOCKED_URL_PREFIXES = [
  'chrome://',
  'moz-extension://',
  'chrome-extension://'
] as const;

export const URL_MONITORING = {
  POLLING_INTERVAL: 1000,
  EVENT_DELAY: 100
} as const;