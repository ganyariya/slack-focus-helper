import { useState, useEffect } from 'react';
import { SectionGroup } from '../../types';
import { StorageManager } from '../../utils/storage';
import { BlockLogic } from '../../utils/blockLogic';
import './App.css';

function App() {
  const [sectionGroups, setSectionGroups] = useState<Record<string, SectionGroup>>({});
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const groups = await StorageManager.getAllSectionGroups();
      setSectionGroups(groups);
      
      // Get current tab URL
      console.log('Requesting current URL...');
      const response = await browser.runtime.sendMessage({ type: 'GET_CURRENT_URL' });
      console.log('Response:', response);
      if (response?.url) {
        setCurrentUrl(response.url);
      } else {
        console.log('No URL in response');
        // Fallback: try to get URL directly from chrome API
        try {
          const tabs = await browser.tabs.query({ active: true, currentWindow: true });
          if (tabs[0]?.url) {
            setCurrentUrl(tabs[0].url);
          }
        } catch (fallbackError) {
          console.error('Fallback URL fetch failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: SectionGroup = {
      name: newGroupName,
      urls: [],
      timeBlocks: [{ start: '09:00', end: '17:00' }],
      enabled: true
    };

    const success = await StorageManager.saveSectionGroup(newGroupName, newGroup);
    if (success) {
      setSectionGroups(prev => ({ ...prev, [newGroupName]: newGroup }));
      setNewGroupName('');
    }
  };

  const deleteGroup = async (groupName: string) => {
    const success = await StorageManager.deleteSectionGroup(groupName);
    if (success) {
      setSectionGroups(prev => {
        const updated = { ...prev };
        delete updated[groupName];
        return updated;
      });
    }
  };

  const toggleGroup = async (groupName: string) => {
    const group = sectionGroups[groupName];
    if (!group) return;

    const updatedGroup = { ...group, enabled: !group.enabled };
    const success = await StorageManager.saveSectionGroup(groupName, updatedGroup);
    if (success) {
      setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
    }
  };

  const addCurrentUrl = async (groupName: string) => {
    if (!currentUrl) return;
    
    const success = await StorageManager.addUrlToGroup(groupName, currentUrl);
    if (success) {
      const updatedGroup = { ...sectionGroups[groupName] };
      updatedGroup.urls.push(currentUrl);
      setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
    }
  };

  const removeUrl = async (groupName: string, url: string) => {
    const success = await StorageManager.removeUrlFromGroup(groupName, url);
    if (success) {
      const updatedGroup = { ...sectionGroups[groupName] };
      updatedGroup.urls = updatedGroup.urls.filter(u => u !== url);
      setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
    }
  };

  const getGroupStatus = (group: SectionGroup) => {
    if (!group.enabled) return { text: '無効', className: 'status-disabled' };
    
    const isBlocked = BlockLogic.isCurrentTimeBlocked(group.timeBlocks);
    return isBlocked 
      ? { text: 'ブロック中', className: 'status-blocking' }
      : { text: '非ブロック', className: 'status-not-blocking' };
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Slack Focus Helper</h1>
      </header>

      <div className="current-url">
        <strong>現在のURL:</strong>
        <div className="url-display" title={currentUrl}>
          {currentUrl ? (currentUrl.length > 50 ? currentUrl.substring(0, 50) + '...' : currentUrl) : '取得中...'}
        </div>
      </div>

      <div className="section-groups">
        {Object.entries(sectionGroups).map(([groupName, group]) => {
          const status = getGroupStatus(group);
          return (
            <div key={groupName} className="section-group">
              <div className="group-header">
                <h3>{groupName}</h3>
                <button 
                  className="delete-btn"
                  onClick={() => deleteGroup(groupName)}
                  title="グループを削除"
                >
                  🗑️
                </button>
              </div>
              
              <div className={`status ${status.className}`}>
                状態: {status.text}
              </div>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={group.enabled}
                  onChange={() => toggleGroup(groupName)}
                />
                有効
              </label>

              <div className="urls-section">
                <div className="urls-header">
                  <span>URL: ({group.urls.length}個)</span>
                  <button 
                    className="add-url-btn"
                    onClick={() => addCurrentUrl(groupName)}
                    disabled={!currentUrl}
                    title="現在のURLを追加"
                  >
                    現在のURLを追加
                  </button>
                </div>
                
                <div className="urls-list">
                  {group.urls.map((url, index) => (
                    <div key={index} className="url-item">
                      <span className="url-text" title={url}>
                        {url.length > 40 ? url.substring(0, 40) + '...' : url}
                      </span>
                      <button 
                        className="remove-url-btn"
                        onClick={() => removeUrl(groupName, url)}
                        title="URLを削除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="new-group">
        <h3>新しいSection Group</h3>
        <div className="new-group-form">
          <input
            type="text"
            placeholder="グループ名を入力"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createGroup()}
          />
          <button onClick={createGroup} disabled={!newGroupName.trim()}>
            作成
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
