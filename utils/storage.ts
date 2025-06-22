import { StorageData, SectionGroup } from '../types';

const STORAGE_KEY = 'sectionGroups';

export class StorageManager {
  static async getAllSectionGroups(): Promise<Record<string, SectionGroup>> {
    try {
      const result = await browser.storage.local.get(STORAGE_KEY);
      return result[STORAGE_KEY] || {};
    } catch (error) {
      console.error('Failed to get section groups:', error);
      return {};
    }
  }

  static async saveSectionGroup(groupName: string, group: SectionGroup): Promise<boolean> {
    try {
      const allGroups = await this.getAllSectionGroups();
      allGroups[groupName] = group;
      await browser.storage.local.set({ [STORAGE_KEY]: allGroups });
      return true;
    } catch (error) {
      console.error('Failed to save section group:', error);
      return false;
    }
  }

  static async deleteSectionGroup(groupName: string): Promise<boolean> {
    try {
      const allGroups = await this.getAllSectionGroups();
      delete allGroups[groupName];
      await browser.storage.local.set({ [STORAGE_KEY]: allGroups });
      return true;
    } catch (error) {
      console.error('Failed to delete section group:', error);
      return false;
    }
  }

  static async getSectionGroup(groupName: string): Promise<SectionGroup | null> {
    try {
      const allGroups = await this.getAllSectionGroups();
      return allGroups[groupName] || null;
    } catch (error) {
      console.error('Failed to get section group:', error);
      return null;
    }
  }

  static async initializeStorage(): Promise<void> {
    try {
      const existing = await this.getAllSectionGroups();
      if (Object.keys(existing).length === 0) {
        // Initialize with empty data structure
        await browser.storage.local.set({ [STORAGE_KEY]: {} });
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  static async addUrlToGroup(groupName: string, url: string): Promise<boolean> {
    try {
      const group = await this.getSectionGroup(groupName);
      if (!group) return false;

      // Check for duplicates
      if (group.urls.includes(url)) {
        return false;
      }

      group.urls.push(url);
      return await this.saveSectionGroup(groupName, group);
    } catch (error) {
      console.error('Failed to add URL to group:', error);
      return false;
    }
  }

  static async removeUrlFromGroup(groupName: string, url: string): Promise<boolean> {
    try {
      const group = await this.getSectionGroup(groupName);
      if (!group) return false;

      group.urls = group.urls.filter(u => u !== url);
      return await this.saveSectionGroup(groupName, group);
    } catch (error) {
      console.error('Failed to remove URL from group:', error);
      return false;
    }
  }
}