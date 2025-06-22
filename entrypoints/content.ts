import { SlackFocusHelper } from '../lib/SlackFocusHelper';
import { SlackDetector } from '../lib/SlackDetector';

export default defineContentScript({
  matches: ['*://*.slack.com/*'],
  main() {
    console.log('Slack Focus Helper: Content script loaded');
    
    // Initialize the main application
    const app = new SlackFocusHelper();
    app.initialize();

    // Setup message listener for popup communication
    browser.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
      if (message.action === 'getWorkspaceName') {
        const workspaceName = SlackDetector.getWorkspaceName();
        sendResponse({ workspaceName });
        return true;
      }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      app.cleanup();
    });
  },
});
