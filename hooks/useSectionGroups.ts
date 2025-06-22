import { useState, useEffect, useCallback } from 'react';
import { SectionGroup, TimeBlock } from '../types';
import { StorageManager } from '../utils/storage';
import { DEFAULT_TIME_BLOCKS } from '../utils/constants';

export function useSectionGroups() {
  const [sectionGroups, setSectionGroups] = useState<Record<string, SectionGroup>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    try {
      setError(null);
      const groups = await StorageManager.getAllSectionGroups();
      setSectionGroups(groups);
    } catch (err) {
      console.error('Failed to load section groups:', err);
      setError('グループの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (groupName: string): Promise<boolean> => {
    if (sectionGroups[groupName]) {
      setError('このグループ名は既に存在します');
      return false;
    }

    const newGroup: SectionGroup = {
      name: groupName,
      urls: [],
      timeBlocks: [{ start: DEFAULT_TIME_BLOCKS.START, end: DEFAULT_TIME_BLOCKS.END }],
      enabled: true
    };

    try {
      const success = await StorageManager.saveSectionGroup(groupName, newGroup);
      if (success) {
        setSectionGroups(prev => ({ ...prev, [groupName]: newGroup }));
        setError(null);
        return true;
      } else {
        setError('グループの作成に失敗しました');
        return false;
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      setError('グループの作成に失敗しました');
      return false;
    }
  }, [sectionGroups]);

  const deleteGroup = useCallback(async (groupName: string): Promise<boolean> => {
    try {
      const success = await StorageManager.deleteSectionGroup(groupName);
      if (success) {
        setSectionGroups(prev => {
          const updated = { ...prev };
          delete updated[groupName];
          return updated;
        });
        setError(null);
        return true;
      } else {
        setError('グループの削除に失敗しました');
        return false;
      }
    } catch (err) {
      console.error('Failed to delete group:', err);
      setError('グループの削除に失敗しました');
      return false;
    }
  }, []);

  const toggleGroup = useCallback(async (groupName: string): Promise<boolean> => {
    const group = sectionGroups[groupName];
    if (!group) {
      setError('グループが見つかりません');
      return false;
    }

    const updatedGroup = { ...group, enabled: !group.enabled };
    
    try {
      const success = await StorageManager.saveSectionGroup(groupName, updatedGroup);
      if (success) {
        setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
        setError(null);
        return true;
      } else {
        setError('グループの更新に失敗しました');
        return false;
      }
    } catch (err) {
      console.error('Failed to toggle group:', err);
      setError('グループの更新に失敗しました');
      return false;
    }
  }, [sectionGroups]);

  const renameGroup = useCallback(async (oldName: string, newName: string): Promise<boolean> => {
    if (oldName === newName) return true;

    if (sectionGroups[newName]) {
      setError('このグループ名は既に存在します');
      return false;
    }

    const group = sectionGroups[oldName];
    if (!group) {
      setError('グループが見つかりません');
      return false;
    }

    const updatedGroup = { ...group, name: newName };
    
    try {
      const saveSuccess = await StorageManager.saveSectionGroup(newName, updatedGroup);
      if (!saveSuccess) {
        setError('グループの保存に失敗しました');
        return false;
      }

      const deleteSuccess = await StorageManager.deleteSectionGroup(oldName);
      if (!deleteSuccess) {
        setError('古いグループの削除に失敗しました');
        return false;
      }

      setSectionGroups(prev => {
        const updated = { ...prev };
        delete updated[oldName];
        updated[newName] = updatedGroup;
        return updated;
      });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to rename group:', err);
      setError('グループ名の変更に失敗しました');
      return false;
    }
  }, [sectionGroups]);

  const addUrlToGroup = useCallback(async (groupName: string, url: string): Promise<boolean> => {
    const group = sectionGroups[groupName];
    if (!group) {
      setError('グループが見つかりません');
      return false;
    }

    if (group.urls.includes(url)) {
      setError('このURLは既に追加されています');
      return false;
    }

    try {
      const success = await StorageManager.addUrlToGroup(groupName, url);
      if (success) {
        const updatedGroup = { ...group, urls: [...group.urls, url] };
        setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
        setError(null);
        return true;
      } else {
        setError('URLの追加に失敗しました');
        return false;
      }
    } catch (err) {
      console.error('Failed to add URL:', err);
      setError('URLの追加に失敗しました');
      return false;
    }
  }, [sectionGroups]);

  const removeUrlFromGroup = useCallback(async (groupName: string, url: string): Promise<boolean> => {
    const group = sectionGroups[groupName];
    if (!group) {
      setError('グループが見つかりません');
      return false;
    }

    try {
      const success = await StorageManager.removeUrlFromGroup(groupName, url);
      if (success) {
        const updatedGroup = { ...group, urls: group.urls.filter(u => u !== url) };
        setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
        setError(null);
        return true;
      } else {
        setError('URLの削除に失敗しました');
        return false;
      }
    } catch (err) {
      console.error('Failed to remove URL:', err);
      setError('URLの削除に失敗しました');
      return false;
    }
  }, [sectionGroups]);

  const updateTimeBlocks = useCallback(async (groupName: string, timeBlocks: TimeBlock[]): Promise<boolean> => {
    const group = sectionGroups[groupName];
    if (!group) {
      setError('グループが見つかりません');
      return false;
    }

    const updatedGroup = { ...group, timeBlocks };
    
    try {
      const success = await StorageManager.saveSectionGroup(groupName, updatedGroup);
      if (success) {
        setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
        setError(null);
        return true;
      } else {
        setError('時間設定の更新に失敗しました');
        return false;
      }
    } catch (err) {
      console.error('Failed to update time blocks:', err);
      setError('時間設定の更新に失敗しました');
      return false;
    }
  }, [sectionGroups]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return {
    sectionGroups,
    loading,
    error,
    actions: {
      loadGroups,
      createGroup,
      deleteGroup,
      toggleGroup,
      renameGroup,
      addUrlToGroup,
      removeUrlFromGroup,
      updateTimeBlocks
    }
  };
}