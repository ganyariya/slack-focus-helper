import { useState, useEffect } from 'react';
import { SectionGroup, TimeBlock } from '../../types';
import { StorageManager } from '../../utils/storage';
import { SectionGroupItem } from '../../components/SectionGroupItem';
import { CurrentUrlDisplay } from '../../components/CurrentUrlDisplay';
import { NewGroupForm } from '../../components/NewGroupForm';
import { DevelopmentTools } from '../../components/DevelopmentTools';
import { TestScenarios } from '../../utils/testScenarios';
import './App.css';

function App() {
  const [sectionGroups, setSectionGroups] = useState<Record<string, SectionGroup>>({});
  const [currentUrl, setCurrentUrl] = useState<string>('');
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

  const createGroup = async (groupName: string) => {
    const newGroup: SectionGroup = {
      name: groupName,
      urls: [],
      timeBlocks: [{ start: '09:00', end: '17:00' }],
      enabled: true
    };

    const success = await StorageManager.saveSectionGroup(groupName, newGroup);
    if (success) {
      setSectionGroups(prev => ({ ...prev, [groupName]: newGroup }));
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

  const updateTimeBlocks = async (groupName: string, timeBlocks: TimeBlock[]) => {
    console.log('updateTimeBlocks called:', { groupName, timeBlocks });
    const group = sectionGroups[groupName];
    if (!group) {
      console.log('Group not found:', groupName);
      return;
    }

    const updatedGroup = { ...group, timeBlocks };
    const success = await StorageManager.saveSectionGroup(groupName, updatedGroup);
    console.log('Save success:', success);
    if (success) {
      setSectionGroups(prev => ({ ...prev, [groupName]: updatedGroup }));
      console.log('State updated for group:', groupName);
    }
  };

  const renameGroup = async (oldName: string, newName: string) => {
    if (oldName === newName) return;

    if (sectionGroups[newName]) {
      alert('このグループ名は既に存在します');
      return;
    }

    const group = sectionGroups[oldName];
    if (!group) return;

    const updatedGroup = { ...group, name: newName };
    const saveSuccess = await StorageManager.saveSectionGroup(newName, updatedGroup);
    
    if (saveSuccess) {
      const deleteSuccess = await StorageManager.deleteSectionGroup(oldName);
      
      if (deleteSuccess) {
        setSectionGroups(prev => {
          const updated = { ...prev };
          delete updated[oldName];
          updated[newName] = updatedGroup;
          return updated;
        });
      }
    }
  };

  const runTests = async () => {
    await TestScenarios.runAllTests();
    await loadData(); // Reload data after tests
  };

  const createTestData = async () => {
    await TestScenarios.createTestData();
    await loadData(); // Reload data after creating test data
  };


  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Slack Focus Helper</h1>
      </header>

      <CurrentUrlDisplay url={currentUrl} />

      <div className="section-groups">
        {Object.entries(sectionGroups).map(([groupName, group]) => (
          <SectionGroupItem
            key={groupName}
            groupName={groupName}
            group={group}
            currentUrl={currentUrl}
            onToggle={toggleGroup}
            onDelete={deleteGroup}
            onRename={renameGroup}
            onAddCurrentUrl={addCurrentUrl}
            onRemoveUrl={removeUrl}
            onUpdateTimeBlocks={updateTimeBlocks}
          />
        ))}
      </div>

      <NewGroupForm onCreateGroup={createGroup} />
      
      <DevelopmentTools 
        onCreateTestData={createTestData}
        onRunTests={runTests}
      />
    </div>
  );
}

export default App;
