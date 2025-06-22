import { Config, WorkspaceConfig, DEFAULT_CONFIG, DEFAULT_WORKSPACE_CONFIG } from '../types/config';

declare global {
  namespace chrome {
    namespace storage {
      namespace sync {
        function get(keys: string | string[] | object): Promise<{[key: string]: any}>;
        function set(items: {[key: string]: any}): Promise<void>;
      }
    }
  }
}

export class ConfigManager {
  private static readonly STORAGE_KEY = 'slack-focus-helper-config';

  /**
   * Load configuration from Chrome storage
   */
  static async loadConfig(): Promise<Config> {
    try {
      // Check if chrome.storage is available
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        console.warn('Chrome storage API not available, using default config');
        return DEFAULT_CONFIG;
      }
      
      const result = await chrome.storage.sync.get(this.STORAGE_KEY);
      if (result[this.STORAGE_KEY]) {
        return { ...DEFAULT_CONFIG, ...result[this.STORAGE_KEY] };
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error('Failed to load config:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Save configuration to Chrome storage
   */
  static async saveConfig(config: Config): Promise<void> {
    try {
      // Check if chrome.storage is available
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        console.warn('Chrome storage API not available, cannot save config');
        return;
      }
      
      await chrome.storage.sync.set({
        [this.STORAGE_KEY]: config
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  /**
   * Get workspace-specific configuration
   */
  static async getWorkspaceConfig(workspaceName: string): Promise<WorkspaceConfig> {
    const config = await this.loadConfig();
    if (config.workspaces[workspaceName]) {
      return config.workspaces[workspaceName];
    }
    return DEFAULT_WORKSPACE_CONFIG;
  }

  /**
   * Update workspace-specific configuration
   */
  static async updateWorkspaceConfig(workspaceName: string, workspaceConfig: WorkspaceConfig): Promise<void> {
    const config = await this.loadConfig();
    config.workspaces[workspaceName] = workspaceConfig;
    await this.saveConfig(config);
  }

  /**
   * Add a blocked channel to the workspace
   */
  static async addBlockedChannel(workspaceName: string, channelId: string): Promise<void> {
    const workspaceConfig = await this.getWorkspaceConfig(workspaceName);
    if (!workspaceConfig.blockedChannels.includes(channelId)) {
      workspaceConfig.blockedChannels.push(channelId);
      await this.updateWorkspaceConfig(workspaceName, workspaceConfig);
    }
  }

  /**
   * Remove a blocked channel from the workspace
   */
  static async removeBlockedChannel(workspaceName: string, channelId: string): Promise<void> {
    const workspaceConfig = await this.getWorkspaceConfig(workspaceName);
    workspaceConfig.blockedChannels = workspaceConfig.blockedChannels.filter(id => id !== channelId);
    await this.updateWorkspaceConfig(workspaceName, workspaceConfig);
  }

  /**
   * Add a blocked section to the workspace
   */
  static async addBlockedSection(workspaceName: string, sectionId: string): Promise<void> {
    const workspaceConfig = await this.getWorkspaceConfig(workspaceName);
    if (!workspaceConfig.blockedSections.includes(sectionId)) {
      workspaceConfig.blockedSections.push(sectionId);
      await this.updateWorkspaceConfig(workspaceName, workspaceConfig);
    }
  }

  /**
   * Remove a blocked section from the workspace
   */
  static async removeBlockedSection(workspaceName: string, sectionId: string): Promise<void> {
    const workspaceConfig = await this.getWorkspaceConfig(workspaceName);
    workspaceConfig.blockedSections = workspaceConfig.blockedSections.filter(id => id !== sectionId);
    await this.updateWorkspaceConfig(workspaceName, workspaceConfig);
  }

  /**
   * Check if a channel is blocked
   */
  static async isChannelBlocked(workspaceName: string, channelId: string): Promise<boolean> {
    const workspaceConfig = await this.getWorkspaceConfig(workspaceName);
    return workspaceConfig.blockedChannels.includes(channelId);
  }

  /**
   * Check if a section is blocked
   */
  static async isSectionBlocked(workspaceName: string, sectionId: string): Promise<boolean> {
    const workspaceConfig = await this.getWorkspaceConfig(workspaceName);
    return workspaceConfig.blockedSections.includes(sectionId);
  }

  /**
   * Clear all blocked items for a workspace
   */
  static async clearAllBlocked(workspaceName: string): Promise<void> {
    const workspaceConfig = await this.getWorkspaceConfig(workspaceName);
    workspaceConfig.blockedChannels = [];
    workspaceConfig.blockedSections = [];
    await this.updateWorkspaceConfig(workspaceName, workspaceConfig);
  }
}