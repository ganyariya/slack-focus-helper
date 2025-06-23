export interface TimeBlock {
  start: string;
  end: string;
}

export interface SectionGroup {
  name: string;
  urls: string[];
  timeBlocks: TimeBlock[];
  enabled: boolean;
}

export interface StorageData {
  sectionGroups: Record<string, SectionGroup>;
}

export type SectionGroups = Record<string, SectionGroup>;

export interface BlockCheckResult {
  shouldBlock: boolean;
  groupName?: string;
  currentTime?: string;
  matchedUrl?: string;
}

export interface TabInfo {
  url: string;
  tabId: number;
}

export type MessageType = 'CHECK_BLOCK' | 'GET_CURRENT_URL' | 'OPEN_SETTINGS' | 'ADD_CURRENT_URL';

export interface CheckBlockMessage {
  type: 'CHECK_BLOCK';
  url: string;
}

export interface GetCurrentUrlMessage {
  type: 'GET_CURRENT_URL';
}

export interface OpenSettingsMessage {
  type: 'OPEN_SETTINGS';
}

export interface AddCurrentUrlMessage {
  type: 'ADD_CURRENT_URL';
  groupName: string;
}

export type ExtensionMessage = CheckBlockMessage | GetCurrentUrlMessage | OpenSettingsMessage | AddCurrentUrlMessage;

export interface CheckBlockResponse extends BlockCheckResult {}

export interface GetCurrentUrlResponse {
  url: string | null;
}

export interface OpenSettingsResponse {
  success: boolean;
  error?: string;
}

export interface AddCurrentUrlResponse {
  success: boolean;
  error?: string;
  url?: string;
  groupName?: string;
}

export type ExtensionMessageResponse = CheckBlockResponse | GetCurrentUrlResponse | OpenSettingsResponse | AddCurrentUrlResponse | null;