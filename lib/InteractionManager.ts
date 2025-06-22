import { SlackDetector, ChannelInfo, SectionInfo } from './SlackDetector';
import { BlockManager } from './BlockManager';

/**
 * Manages user interactions like Ctrl+click events for blocking/unblocking
 */
export class InteractionManager {
  private blockManager: BlockManager;
  private isSetup = false;
  private boundHandleClick: (event: Event) => Promise<void>;

  constructor(blockManager: BlockManager) {
    this.blockManager = blockManager;
    this.boundHandleClick = this.handleClick.bind(this);
  }

  /**
   * Set up event listeners for user interactions
   */
  setupEventListeners(): void {
    if (this.isSetup) {
      console.warn('InteractionManager event listeners already set up');
      return;
    }

    // Use event delegation to handle clicks on channels and sections
    // Use capture phase to ensure we intercept events before Slack handles them
    document.addEventListener('click', this.boundHandleClick, true);
    document.addEventListener('mousedown', this.boundHandleClick, true);
    document.addEventListener('contextmenu', this.boundHandleClick, true);
    
    this.isSetup = true;
    console.log('InteractionManager: Event listeners set up');
  }

  /**
   * Remove event listeners
   */
  removeEventListeners(): void {
    if (!this.isSetup) return;

    document.removeEventListener('click', this.boundHandleClick, true);
    document.removeEventListener('mousedown', this.boundHandleClick, true);
    document.removeEventListener('contextmenu', this.boundHandleClick, true);
    
    this.isSetup = false;
    console.log('InteractionManager: Event listeners removed');
  }

  /**
   * Handle click events with Ctrl+click detection
   */
  private async handleClick(event: Event): Promise<void> {
    if (!(event instanceof MouseEvent)) {
      return;
    }
    console.log('InteractionManager: Click event detected', {
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      button: event.button,
      target: event.target
    });

    // Only handle Ctrl+click events
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    console.log('InteractionManager: Ctrl+click detected, processing...');

    // Prevent default behavior immediately
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const target = event.target as Element;
    if (!target) {
      console.log('InteractionManager: No target element found');
      return;
    }

    // Find the relevant channel or section element
    const channelElement = target.closest(SlackDetector.SELECTORS.channelItem);
    const sectionElement = target.closest(SlackDetector.SELECTORS.sectionHeading);

    console.log('InteractionManager: Element detection', {
      channelElement: !!channelElement,
      sectionElement: !!sectionElement,
      channelSelector: SlackDetector.SELECTORS.channelItem,
      sectionSelector: SlackDetector.SELECTORS.sectionHeading
    });

    if (channelElement) {
      console.log('InteractionManager: Processing channel click');
      await this.handleChannelClick(event, channelElement);
    } else if (sectionElement) {
      console.log('InteractionManager: Processing section click');
      await this.handleSectionClick(event, sectionElement);
    } else {
      console.log('InteractionManager: No matching element found for Ctrl+click');
    }
  }

  /**
   * Handle Ctrl+click on a channel
   */
  private async handleChannelClick(event: MouseEvent, channelElement: Element): Promise<void> {
    // Prevent Slack's default behavior
    event.preventDefault();
    event.stopPropagation();

    // Extract channel information
    const channelInfo = this.extractChannelInfo(channelElement);
    if (!channelInfo) {
      console.warn('Could not extract channel information');
      return;
    }

    console.log(`Ctrl+click on channel: ${channelInfo.name} (${channelInfo.id})`);

    // Show visual feedback immediately
    this.blockManager.showBlockFeedback(channelElement, true);

    // Toggle the channel block state
    const isNowBlocked = await this.blockManager.toggleChannelBlock(channelInfo.id);

    // Show toast notification
    this.showToast(
      isNowBlocked 
        ? `Blocked channel: ${channelInfo.name}`
        : `Unblocked channel: ${channelInfo.name}`
    );
  }

  /**
   * Handle Ctrl+click on a section
   */
  private async handleSectionClick(event: MouseEvent, sectionElement: Element): Promise<void> {
    // Prevent Slack's default behavior
    event.preventDefault();
    event.stopPropagation();

    // Extract section information
    const sectionInfo = this.extractSectionInfo(sectionElement);
    if (!sectionInfo) {
      console.warn('Could not extract section information');
      return;
    }

    console.log(`Ctrl+click on section: ${sectionInfo.name} (${sectionInfo.id})`);

    // Show visual feedback immediately
    this.blockManager.showBlockFeedback(sectionElement, true);

    // Toggle the section block state
    const isNowBlocked = await this.blockManager.toggleSectionBlock(sectionInfo.id);

    // Show toast notification
    this.showToast(
      isNowBlocked 
        ? `Blocked section: ${sectionInfo.name}`
        : `Unblocked section: ${sectionInfo.name}`
    );
  }

  /**
   * Extract channel information from DOM element
   */
  private extractChannelInfo(element: Element): ChannelInfo | null {
    const channels = SlackDetector.getChannels();
    return channels.find(c => c.element === element) || null;
  }

  /**
   * Extract section information from DOM element
   */
  private extractSectionInfo(element: Element): SectionInfo | null {
    const sections = SlackDetector.getSections();
    return sections.find(s => s.element === element) || null;
  }

  /**
   * Show a toast notification
   */
  private showToast(message: string): void {
    // Remove any existing toast
    const existingToast = document.getElementById('slack-focus-helper-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast element
    const toast = document.createElement('div');
    toast.id = 'slack-focus-helper-toast';
    toast.className = 'slack-focus-helper-toast';
    toast.textContent = message;

    // Inject toast CSS if not already present
    this.injectToastCSS();

    // Add to page
    document.body.appendChild(toast);

    // Remove after 2 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2000);
  }

  /**
   * Inject CSS for toast notifications
   */
  private injectToastCSS(): void {
    const existingStyle = document.getElementById('slack-focus-helper-toast-style');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'slack-focus-helper-toast-style';
    style.textContent = `
      .slack-focus-helper-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2d2d2d;
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        animation: slack-focus-helper-toast-slide-in 0.3s ease-out;
      }
      
      @keyframes slack-focus-helper-toast-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Check if event listeners are set up
   */
  isReady(): boolean {
    return this.isSetup;
  }
}