import { SlackDetector } from '../lib/SlackDetector';

export default defineContentScript({
  matches: ['*://*.slack.com/*'],
  main() {
    console.log('Slack Focus Helper: Content script loaded');
    
    // Check if we're on a Slack page
    const isSlackPage = (): boolean => {
      return window.location.hostname.endsWith('.slack.com') && 
             SlackDetector.isSidebarLoaded();
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

    // Set up DOM mutation observer
    const setupMutationObserver = (): void => {
      const targetNode = document.querySelector(SlackDetector.SELECTORS.sidebar);
      if (!targetNode) {
        console.warn('Slack sidebar not found for mutation observation');
        return;
      }

      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
          // Check if channels or sections were added/removed
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            const removedNodes = Array.from(mutation.removedNodes);
            
            const isRelevantChange = [...addedNodes, ...removedNodes].some(node => {
              if (node.nodeType !== Node.ELEMENT_NODE) return false;
              const element = node as Element;
              return element.matches(SlackDetector.SELECTORS.channelItem) ||
                     element.matches(SlackDetector.SELECTORS.sectionHeading) ||
                     element.querySelector(SlackDetector.SELECTORS.channelItem) ||
                     element.querySelector(SlackDetector.SELECTORS.sectionHeading);
            });

            if (isRelevantChange) {
              shouldUpdate = true;
            }
          }
        });

        if (shouldUpdate) {
          console.log('Slack DOM updated, refreshing channel/section detection');
          // TODO: Refresh blocking state for new/changed elements
        }
      });

      observer.observe(targetNode, {
        childList: true,
        subtree: true,
        attributes: false
      });

      console.log('MutationObserver set up for Slack sidebar');
    };

    // Initialize when Slack is ready
    waitForSlackLoad().then(() => {
      console.log('Slack Focus Helper: Ready to start blocking');
      
      // Get workspace name
      const workspaceName = SlackDetector.getWorkspaceName();
      if (workspaceName) {
        console.log(`Detected workspace: ${workspaceName}`);
      } else {
        console.warn('Could not detect workspace name');
      }

      // Get initial channels and sections
      const channels = SlackDetector.getChannels();
      const sections = SlackDetector.getSections();
      console.log(`Found ${channels.length} channels and ${sections.length} sections`);

      // Set up mutation observer for dynamic content updates
      setupMutationObserver();

      // TODO: Initialize main blocking functionality
    });
  },
});
