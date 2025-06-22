export default defineContentScript({
  matches: ['*://*.slack.com/*'],
  main() {
    console.log('Slack Focus Helper: Content script loaded');
    
    // Check if we're on a Slack page
    const isSlackPage = (): boolean => {
      return window.location.hostname.endsWith('.slack.com') && 
             document.querySelector('[data-qa="channel_sidebar"]') !== null;
    };

    // Wait for Slack to load
    const waitForSlackLoad = (): Promise<void> => {
      return new Promise((resolve) => {
        const checkSlack = () => {
          if (isSlackPage()) {
            console.log('Slack page detected and loaded');
            resolve();
          } else {
            setTimeout(checkSlack, 1000);
          }
        };
        checkSlack();
      });
    };

    // Initialize when Slack is ready
    waitForSlackLoad().then(() => {
      console.log('Slack Focus Helper: Ready to start blocking');
      // TODO: Initialize main blocking functionality
    });
  },
});
