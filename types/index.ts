export interface TimeBlock {
  start: string; // HH:MM format
  end: string;   // HH:MM format
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