import { useState, useEffect } from 'react';
import './App.css';
import { ConfigManager } from '../../lib/ConfigManager';
import { WorkspaceConfig, TimeBlock } from '../../types/config';
import { MainPopup } from './components/MainPopup';
import { DetailedSettings } from './components/DetailedSettings';

declare global {
  namespace chrome {
    namespace tabs {
      function query(queryInfo: {active: boolean; currentWindow: boolean}): Promise<{url?: string}[]>;
    }
  }
}

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
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        
        if (activeTab?.url?.includes('slack.com')) {
          // Extract workspace name from URL or use stored value
          const urlMatch = activeTab.url.match(/https:\/\/([^.]+)\.slack\.com/);
          const workspace = urlMatch ? urlMatch[1] : 'default';
          setWorkspaceName(workspace);
          
          // Load configuration
          const workspaceConfig = await ConfigManager.getWorkspaceConfig(workspace);
          setConfig(workspaceConfig);
          
          // Set blocked counts
          setBlockedChannelCount(workspaceConfig.blockedChannels.length);
          setBlockedSectionCount(workspaceConfig.blockedSections.length);
        } else {
          setWorkspaceName('Not on Slack');
          const workspaceConfig = await ConfigManager.getWorkspaceConfig('default');
          setConfig(workspaceConfig);
        }
      } else {
        // Fallback for development
        setWorkspaceName('Development');
        const workspaceConfig = await ConfigManager.getWorkspaceConfig('development');
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
