import { SlackFocusHelper } from '../lib/SlackFocusHelper';

export default defineContentScript({
  matches: ['*://*.slack.com/*'],
  main() {
    console.log('Slack Focus Helper: Content script loaded');
    
    // Initialize the main application
    const app = new SlackFocusHelper();
    app.initialize();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      app.cleanup();
    });
  },
});
