import { StorageData, SectionGroup } from '../types';
import { STORAGE_KEYS } from './constants';
import { StorageError, logError } from './errorHandler';

export class StorageManager {
  static async getAllSectionGroups(): Promise<Record<string, SectionGroup>> {
    try {
      const result = await browser.storage.local.get(STORAGE_KEYS.SECTION_GROUPS);
      return result[STORAGE_KEYS.SECTION_GROUPS] || {};
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'getAllSectionGroups'
      });
      throw new StorageError('Failed to get section groups', { originalError: error });
    }
  }

  static async saveSectionGroup(groupName: string, group: SectionGroup): Promise<boolean> {
    try {
      const allGroups = await this.getAllSectionGroups();
      allGroups[groupName] = group;
      await browser.storage.local.set({ [STORAGE_KEYS.SECTION_GROUPS]: allGroups });
      return true;
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'saveSectionGroup',
        groupName,
        group
      });
      return false;
    }
  }

  static async deleteSectionGroup(groupName: string): Promise<boolean> {
    try {
      const allGroups = await this.getAllSectionGroups();
      delete allGroups[groupName];
      await browser.storage.local.set({ [STORAGE_KEYS.SECTION_GROUPS]: allGroups });
      return true;
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'deleteSectionGroup',
        groupName
      });
      return false;
    }
  }

  static async getSectionGroup(groupName: string): Promise<SectionGroup | null> {
    try {
      const allGroups = await this.getAllSectionGroups();
      return allGroups[groupName] || null;
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'getSectionGroup',
        groupName
      });
      return null;
    }
  }

  static async initializeStorage(): Promise<void> {
    try {
      const existing = await this.getAllSectionGroups();
      if (Object.keys(existing).length === 0) {
        await browser.storage.local.set({ [STORAGE_KEYS.SECTION_GROUPS]: {} });
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'initializeStorage'
      });
    }
  }

  static async addUrlToGroup(groupName: string, url: string): Promise<boolean> {
    try {
      const group = await this.getSectionGroup(groupName);
      if (!group) return false;

      if (group.urls.includes(url)) {
        return false;
      }

      group.urls.push(url);
      return await this.saveSectionGroup(groupName, group);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'addUrlToGroup',
        groupName,
        url
      });
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
      logError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'removeUrlFromGroup',
        groupName,
        url
      });
      return false;
    }
  }
}