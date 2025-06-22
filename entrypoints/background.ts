import { StorageManager } from '../utils/storage';
import { BlockLogic } from '../utils/blockLogic';
import { BlockCheckResult } from '../types';

export default defineBackground(() => {
  console.log('Slack Focus Helper background script started', { id: browser.runtime.id });

  // Initialize storage on startup
  StorageManager.initializeStorage();

  // Handle messages from content scripts
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'CHECK_BLOCK') {
      try {
        const sectionGroups = await StorageManager.getAllSectionGroups();
        const result: BlockCheckResult = BlockLogic.checkIfShouldBlock(message.url, sectionGroups);
        
        return result;
      } catch (error) {
        console.error('Error checking block status:', error);
        return { shouldBlock: false };
      }
    }

    if (message.type === 'GET_CURRENT_URL') {
      try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.url) {
          return { url: tabs[0].url };
        }
        return { url: null };
      } catch (error) {
        console.error('Error getting current URL:', error);
        return { url: null };
      }
    }
  });

  // Handle tab updates to check for blocking
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
      try {
        const sectionGroups = await StorageManager.getAllSectionGroups();
        const result = BlockLogic.checkIfShouldBlock(tab.url, sectionGroups);
        
        if (result.shouldBlock) {
          // Redirect to block page
          const blockPageUrl = `${browser.runtime.getURL('')}block.html` + 
            `?group=${encodeURIComponent(result.groupName || '')}` +
            `&time=${encodeURIComponent(result.currentTime || '')}` +
            `&url=${encodeURIComponent(result.matchedUrl || '')}`;
          
          browser.tabs.update(tabId, { url: blockPageUrl });
        }
      } catch (error) {
        console.error('Error in tab update handler:', error);
      }
    }
  });
});
