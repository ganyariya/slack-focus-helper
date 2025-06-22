import { SlackDetector } from './SlackDetector';
import { BlockManager } from './BlockManager';

/**
 * Main application class for Slack Focus Helper
 * Handles initialization, DOM monitoring, and event management
 */
export class SlackFocusHelper {
  private blockManager: BlockManager | null = null;
  private mutationObserver: MutationObserver | null = null;

  /**
   * Initialize the Slack Focus Helper application
   */
  async initialize(): Promise<void> {
    console.log('Slack Focus Helper: Initializing...');

    // Wait for Slack to load completely
    await this.waitForSlackLoad();
    
    // Get workspace information
    const workspaceName = SlackDetector.getWorkspaceName();
    if (!workspaceName) {
      console.warn('Could not detect workspace name - initialization aborted');
      return;
    }

    console.log(`Detected workspace: ${workspaceName}`);

    // Get initial channels and sections
    const channels = SlackDetector.getChannels();
    const sections = SlackDetector.getSections();
    console.log(`Found ${channels.length} channels and ${sections.length} sections`);

    // Initialize block manager
    this.blockManager = new BlockManager();
    await this.blockManager.initialize();

    // Set up DOM monitoring
    this.setupMutationObserver();

    console.log('Slack Focus Helper: Initialization complete');
  }

  /**
   * Wait for Slack page to load completely
   */
  private waitForSlackLoad(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlack = () => {
        if (this.isSlackPageReady()) {
          console.log('Slack page detected and loaded');
          resolve();
        } else {
          setTimeout(checkSlack, 1000);
        }
      };
      checkSlack();
    });
  }

  /**
   * Check if Slack page is ready for interaction
   */
  private isSlackPageReady(): boolean {
    return window.location.hostname.endsWith('.slack.com') && 
           SlackDetector.isSidebarLoaded();
  }

  /**
   * Set up DOM mutation observer to monitor dynamic content changes
   */
  private setupMutationObserver(): void {
    if (!this.blockManager) {
      console.warn('BlockManager not initialized - cannot setup mutation observer');
      return;
    }

    const targetNode = document.querySelector(SlackDetector.SELECTORS.sidebar);
    if (!targetNode) {
      console.warn('Slack sidebar not found for mutation observation');
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
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
        console.log('Slack DOM updated, refreshing blocking state');
        this.blockManager?.refreshBlocks();
      }
    });

    this.mutationObserver.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: false
    });

    console.log('MutationObserver set up for Slack sidebar');
  }

  /**
   * Get the block manager instance
   */
  getBlockManager(): BlockManager | null {
    return this.blockManager;
  }

  /**
   * Check if the application is ready
   */
  isReady(): boolean {
    return this.blockManager !== null;
  }

  /**
   * Cleanup resources and event listeners
   */
  cleanup(): void {
    console.log('Slack Focus Helper: Cleaning up...');

    // Stop mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Cleanup block manager
    if (this.blockManager) {
      this.blockManager.cleanup();
      this.blockManager = null;
    }

    console.log('Slack Focus Helper: Cleanup complete');
  }
}