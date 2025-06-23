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

export const UI_CONFIG = {
  MIN_TIME_BLOCKS: 1
} as const;

export const BLOCK_PAGE = {
  RECHECK_INTERVAL: 5000
} as const;

export const KEYBOARD_SHORTCUTS = {
  ADD_CURRENT_URL: 'Ctrl+Shift+B'
} as const;

export const MESSAGES = {
  SUCCESS: {
    URL_ADDED: 'URLが追加されました',
    GROUP_SAVED: 'グループが保存されました'
  },
  ERROR: {
    NO_ACTIVE_GROUPS: '有効なSection Groupが見つかりません',
    URL_ADD_FAILED: 'URLの追加に失敗しました',
    URL_GET_FAILED: '現在のタブのURLを取得できませんでした'
  }
} as const;