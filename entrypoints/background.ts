import { StorageManager } from '../utils/storage';
import { BlockLogic } from '../utils/blockLogic';
import { MESSAGES } from '../utils/constants';
import {
  ExtensionMessage,
  CheckBlockMessage,
  CheckBlockResponse,
  GetCurrentUrlResponse,
  OpenSettingsResponse,
  AddCurrentUrlMessage,
  AddCurrentUrlResponse,
  ExtensionMessageResponse
} from '../types';

async function handleCheckBlock(message: CheckBlockMessage): Promise<CheckBlockResponse> {
  if (!message.url || typeof message.url !== 'string') {
    console.warn('Invalid URL in CHECK_BLOCK message:', message.url);
    return { shouldBlock: false };
  }

  const sectionGroups = await StorageManager.getAllSectionGroups();
  return BlockLogic.checkIfShouldBlock(message.url, sectionGroups);
}

async function handleGetCurrentUrl(): Promise<GetCurrentUrlResponse> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  
  if (tabs.length > 0 && tabs[0]?.url) {
    return { url: tabs[0].url };
  }
  
  return { url: null };
}

async function handleOpenSettings(): Promise<OpenSettingsResponse> {
  try {
    const popupUrl = browser.runtime.getURL('/popup.html');
    await browser.tabs.create({ url: popupUrl });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function handleAddCurrentUrl(message: AddCurrentUrlMessage): Promise<AddCurrentUrlResponse> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    
    if (tabs.length === 0 || !tabs[0]?.url) {
      return { 
        success: false, 
        error: MESSAGES.ERROR.URL_GET_FAILED 
      };
    }

    const currentUrl = tabs[0].url;
    const success = await StorageManager.addUrlToGroup(message.groupName, currentUrl);

    if (success) {
      return { 
        success: true, 
        url: currentUrl,
        groupName: message.groupName 
      };
    } else {
      return { 
        success: false, 
        error: MESSAGES.ERROR.URL_ADD_FAILED + '（既に存在するか、グループが見つかりません）' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function handleMessage(message: ExtensionMessage): Promise<ExtensionMessageResponse> {
  try {
    switch (message.type) {
      case 'CHECK_BLOCK':
        return await handleCheckBlock(message);
      case 'GET_CURRENT_URL':
        return await handleGetCurrentUrl();
      case 'OPEN_SETTINGS':
        return await handleOpenSettings();
      case 'ADD_CURRENT_URL':
        return await handleAddCurrentUrl(message);
      default:
        console.warn('Unknown message type:', (message as ExtensionMessage & { type: string }).type);
        return null;
    }
  } catch (error) {
    console.error(`Error handling ${message.type}:`, error);
    
    switch (message.type) {
      case 'CHECK_BLOCK':
        return { shouldBlock: false };
      case 'GET_CURRENT_URL':
        return { url: null };
      case 'OPEN_SETTINGS':
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      case 'ADD_CURRENT_URL':
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      default:
        return null;
    }
  }
}

export default defineBackground(() => {
  StorageManager.initializeStorage();

  browser.runtime.onMessage.addListener(handleMessage);

  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'add-current-url') {
      const sectionGroups = await StorageManager.getAllSectionGroups();
      const groupNames = Object.keys(sectionGroups).filter(name => sectionGroups[name].enabled);
      
      if (groupNames.length === 0) {
        console.warn(MESSAGES.ERROR.NO_ACTIVE_GROUPS);
        return;
      }

      const defaultGroup = groupNames[0];
      const response = await handleAddCurrentUrl({
        type: 'ADD_CURRENT_URL',
        groupName: defaultGroup
      });

      if (response.success) {
        console.log(`${MESSAGES.SUCCESS.URL_ADDED}: ${response.url} -> ${response.groupName}`);
      } else {
        console.error(`URL追加に失敗: ${response.error}`);
      }
    }
  });

  async function handleTabUpdate(tabId: number, changeInfo: any, tab: any) {
    if (changeInfo.status !== 'loading' || !tab.url) return;
    
    try {
      const sectionGroups = await StorageManager.getAllSectionGroups();
      const result = BlockLogic.checkIfShouldBlock(tab.url, sectionGroups);
      
      if (result.shouldBlock) {
        const blockPageUrl = buildBlockPageUrl(result);
        browser.tabs.update(tabId, { url: blockPageUrl });
      }
    } catch (error) {
      console.error('Error in tab update handler:', error);
    }
  }

  function buildBlockPageUrl(result: CheckBlockResponse): string {
    const baseUrl = `${browser.runtime.getURL('')}block.html`;
    const params = new URLSearchParams({
      group: result.groupName || '',
      time: result.currentTime || '',
      url: result.matchedUrl || ''
    });
    return `${baseUrl}?${params.toString()}`;
  }

  browser.tabs.onUpdated.addListener(handleTabUpdate);
});
