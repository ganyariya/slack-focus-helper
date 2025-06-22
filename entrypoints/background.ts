import { StorageManager } from '../utils/storage';
import { BlockLogic } from '../utils/blockLogic';
import { BlockCheckResult } from '../types';

type MessageType = 'CHECK_BLOCK' | 'GET_CURRENT_URL' | 'OPEN_SETTINGS';

interface CheckBlockMessage {
  type: 'CHECK_BLOCK';
  url: string;
}

interface GetCurrentUrlMessage {
  type: 'GET_CURRENT_URL';
}

interface OpenSettingsMessage {
  type: 'OPEN_SETTINGS';
}

type ExtensionMessage = CheckBlockMessage | GetCurrentUrlMessage | OpenSettingsMessage;

async function handleCheckBlock(message: CheckBlockMessage): Promise<BlockCheckResult> {
  if (!message.url || typeof message.url !== 'string') {
    console.warn('Invalid URL in CHECK_BLOCK message:', message.url);
    return { shouldBlock: false };
  }

  const sectionGroups = await StorageManager.getAllSectionGroups();
  return BlockLogic.checkIfShouldBlock(message.url, sectionGroups);
}

async function handleGetCurrentUrl(): Promise<{ url: string | null }> {
  console.log('Getting current URL...');
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  console.log('Found tabs:', tabs);
  
  if (tabs.length > 0 && tabs[0]?.url) {
    console.log('Current URL:', tabs[0].url);
    return { url: tabs[0].url };
  }
  
  console.log('No active tab or URL found');
  return { url: null };
}

async function handleOpenSettings(): Promise<{ success: boolean; error?: string }> {
  console.log('Opening settings page...');
  const popupUrl = browser.runtime.getURL('/popup.html');
  await browser.tabs.create({ url: popupUrl });
  return { success: true };
}

async function handleMessage(message: ExtensionMessage) {
  try {
    switch (message.type) {
      case 'CHECK_BLOCK':
        return await handleCheckBlock(message);
      case 'GET_CURRENT_URL':
        return await handleGetCurrentUrl();
      case 'OPEN_SETTINGS':
        return await handleOpenSettings();
      default:
        console.warn('Unknown message type:', (message as any).type);
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
      default:
        return null;
    }
  }
}

export default defineBackground(() => {
  console.log('Slack Focus Helper background script started', { id: browser.runtime.id });

  StorageManager.initializeStorage();

  browser.runtime.onMessage.addListener(handleMessage);

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

  function buildBlockPageUrl(result: BlockCheckResult): string {
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
