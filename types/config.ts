// Configuration types for Slack Focus Helper
// Based on SPEC.md specifications

export interface TimeBlock {
  start: string;    // "HH:MM" format
  end: string;      // "HH:MM" format  
  enabled: boolean;
}

export interface WorkspaceConfig {
  timeBlocks: TimeBlock[];
  blockedChannels: string[];
  blockedSections: string[];
  enabled: boolean;
}

export interface GlobalSettings {
  forceMode: boolean;
  enableToasts: boolean;
  darkMode: boolean;
}

export interface Config {
  workspaces: Record<string, WorkspaceConfig>;
  globalSettings: GlobalSettings;
}

// Default configuration values
export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  forceMode: false,
  enableToasts: true,
  darkMode: false,
};

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  timeBlocks: [],
  blockedChannels: [],
  blockedSections: [],
  enabled: true,
};

export const DEFAULT_CONFIG: Config = {
  workspaces: {},
  globalSettings: DEFAULT_GLOBAL_SETTINGS,
};