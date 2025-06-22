import { useState, useEffect } from 'react';
import './App.css';
import { ConfigManager } from '../../lib/ConfigManager';
import { WorkspaceConfig, TimeBlock } from '../../types/config';
import { MainPopup } from './components/MainPopup';
import { DetailedSettings } from './components/DetailedSettings';

// WXT provides browser API types

type Page = 'main' | 'details';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [workspaceName, setWorkspaceName] = useState<string>('Unknown');
  const [config, setConfig] = useState<WorkspaceConfig | null>(null);
  const [blockedChannelCount, setBlockedChannelCount] = useState(0);
  const [blockedSectionCount, setBlockedSectionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePopup();
  }, []);

  const initializePopup = async () => {
    try {
      // Get workspace name from active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      if (activeTab?.url?.includes('slack.com')) {
        try {
          // Try to get workspace name from content script
          const results = await browser.tabs.sendMessage(activeTab.id!, { 
            action: 'getWorkspaceName' 
          });
          const workspace = results?.workspaceName || 'default';
          setWorkspaceName(workspace);
          
          // Load configuration
          const workspaceConfig = await ConfigManager.getWorkspaceConfig(workspace);
          setConfig(workspaceConfig);
          
          // Set blocked counts
          setBlockedChannelCount(workspaceConfig.blockedChannels.length);
          setBlockedSectionCount(workspaceConfig.blockedSections.length);
        } catch (messageError) {
          // Fallback to URL extraction if content script is not available
          console.warn('Could not get workspace name from content script:', messageError);
          const urlMatch = activeTab.url.match(/https:\/\/([^.]+)\.slack\.com/);
          const workspace = urlMatch ? urlMatch[1] : 'default';
          setWorkspaceName(workspace);
          
          const workspaceConfig = await ConfigManager.getWorkspaceConfig(workspace);
          setConfig(workspaceConfig);
          setBlockedChannelCount(workspaceConfig.blockedChannels.length);
          setBlockedSectionCount(workspaceConfig.blockedSections.length);
        }
      } else {
        setWorkspaceName('Not on Slack');
        const workspaceConfig = await ConfigManager.getWorkspaceConfig('default');
        setConfig(workspaceConfig);
      }
    } catch (error) {
      console.error('Failed to initialize popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (newConfig: WorkspaceConfig) => {
    try {
      await ConfigManager.updateWorkspaceConfig(workspaceName, newConfig);
      setConfig(newConfig);
      
      // Update counts
      setBlockedChannelCount(newConfig.blockedChannels.length);
      setBlockedSectionCount(newConfig.blockedSections.length);
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  if (loading) {
    return (
      <div className="popup-container loading">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="popup-container error">
        <div className="error-text">Failed to load configuration</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      {currentPage === 'main' ? (
        <MainPopup
          workspaceName={workspaceName}
          config={config}
          blockedChannelCount={blockedChannelCount}
          blockedSectionCount={blockedSectionCount}
          onConfigUpdate={handleConfigUpdate}
          onNavigateToDetails={() => setCurrentPage('details')}
        />
      ) : (
        <DetailedSettings
          workspaceName={workspaceName}
          config={config}
          onConfigUpdate={handleConfigUpdate}
          onNavigateBack={() => setCurrentPage('main')}
        />
      )}
    </div>
  );
}

export default App;
