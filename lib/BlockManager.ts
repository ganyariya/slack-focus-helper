import { SlackDetector } from './SlackDetector';
import { ConfigManager } from './ConfigManager';
import { TimeManager } from './TimeManager';

export class BlockManager {
  private workspaceName: string | null = null;
  private timeCheckInterval: number | null = null;
  private isBlocking = false;

  constructor() {
    this.workspaceName = SlackDetector.getWorkspaceName();
  }

  /**
   * Initialize blocking functionality
   */
  async initialize(): Promise<void> {
    if (!this.workspaceName) {
      console.warn('Cannot initialize BlockManager: workspace name not found');
      return;
    }

    // Apply initial blocking state
    await this.updateBlockingState();

    // Start time-based checking
    this.startTimeBasedChecking();

    console.log('BlockManager initialized for workspace:', this.workspaceName);
  }

  /**
   * Start periodic time checking (every minute)
   */
  private startTimeBasedChecking(): void {
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
    }

    this.timeCheckInterval = window.setInterval(async () => {
      await this.updateBlockingState();
    }, 60000); // Check every minute

    console.log('Time-based checking started');
  }

  /**
   * Stop periodic time checking
   */
  stopTimeBasedChecking(): void {
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
      console.log('Time-based checking stopped');
    }
  }

  /**
   * Update blocking state based on current time and configuration
   */
  async updateBlockingState(): Promise<void> {
    if (!this.workspaceName) return;

    const config = await ConfigManager.getWorkspaceConfig(this.workspaceName);
    
    if (!config.enabled) {
      // Workspace blocking is disabled
      if (this.isBlocking) {
        await this.removeAllBlocks();
        this.isBlocking = false;
      }
      return;
    }

    const shouldBlock = TimeManager.isWithinTimeBlocks(config.timeBlocks);
    
    if (shouldBlock && !this.isBlocking) {
      // Start blocking
      await this.applyBlocks();
      this.isBlocking = true;
      console.log('Blocking enabled due to time constraints');
    } else if (!shouldBlock && this.isBlocking) {
      // Stop blocking
      await this.removeAllBlocks();
      this.isBlocking = false;
      console.log('Blocking disabled - outside time blocks');
    }
  }

  /**
   * Apply blocks to all configured channels and sections
   */
  async applyBlocks(): Promise<void> {
    if (!this.workspaceName) return;

    const config = await ConfigManager.getWorkspaceConfig(this.workspaceName);

    // Block channels
    for (const channelId of config.blockedChannels) {
      const element = SlackDetector.findChannelById(channelId);
      if (element) {
        this.hideElement(element);
      }
    }

    // Block sections
    for (const sectionId of config.blockedSections) {
      const element = SlackDetector.findSectionById(sectionId);
      if (element) {
        this.hideElement(element);
        // Also hide all channels in the section
        this.hideChannelsInSection(element);
      }
    }
  }

  /**
   * Remove all blocks (make everything visible)
   */
  async removeAllBlocks(): Promise<void> {
    // Remove all hidden elements by removing our custom class
    const hiddenElements = document.querySelectorAll('.slack-focus-helper-hidden');
    hiddenElements.forEach(element => {
      this.showElement(element as Element);
    });
  }

  /**
   * Hide an element using CSS
   */
  private hideElement(element: Element): void {
    element.classList.add('slack-focus-helper-hidden');
    this.injectHideCSS();
  }

  /**
   * Show an element by removing the hide class
   */
  private showElement(element: Element): void {
    element.classList.remove('slack-focus-helper-hidden');
  }

  /**
   * Hide all channels within a section
   */
  private hideChannelsInSection(sectionElement: Element): void {
    // Find the section container that includes channels
    let container = sectionElement.parentElement;
    while (container && !container.querySelector(SlackDetector.SELECTORS.channelItem)) {
      container = container.parentElement;
    }

    if (container) {
      const channels = container.querySelectorAll(SlackDetector.SELECTORS.channelItem);
      channels.forEach(channel => this.hideElement(channel));
    }
  }

  /**
   * Inject CSS to hide elements
   */
  private injectHideCSS(): void {
    const existingStyle = document.getElementById('slack-focus-helper-style');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'slack-focus-helper-style';
    style.textContent = `
      .slack-focus-helper-hidden {
        display: none !important;
      }
      
      .slack-focus-helper-block-feedback {
        position: relative;
      }
      
      .slack-focus-helper-block-feedback::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        animation: slack-focus-helper-flash 0.3s ease-in-out;
      }
      
      @keyframes slack-focus-helper-flash {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Toggle blocking state for a specific channel
   */
  async toggleChannelBlock(channelId: string): Promise<boolean> {
    if (!this.workspaceName) return false;

    const isBlocked = await ConfigManager.isChannelBlocked(this.workspaceName, channelId);
    
    if (isBlocked) {
      await ConfigManager.removeBlockedChannel(this.workspaceName, channelId);
      const element = SlackDetector.findChannelById(channelId);
      if (element) {
        this.showElement(element);
      }
      return false;
    } else {
      await ConfigManager.addBlockedChannel(this.workspaceName, channelId);
      const element = SlackDetector.findChannelById(channelId);
      if (element && this.isBlocking) {
        this.hideElement(element);
      }
      return true;
    }
  }

  /**
   * Toggle blocking state for a specific section
   */
  async toggleSectionBlock(sectionId: string): Promise<boolean> {
    if (!this.workspaceName) return false;

    const isBlocked = await ConfigManager.isSectionBlocked(this.workspaceName, sectionId);
    
    if (isBlocked) {
      await ConfigManager.removeBlockedSection(this.workspaceName, sectionId);
      const element = SlackDetector.findSectionById(sectionId);
      if (element) {
        this.showElement(element);
        // Show all channels in the section
        this.showChannelsInSection(element);
      }
      return false;
    } else {
      await ConfigManager.addBlockedSection(this.workspaceName, sectionId);
      const element = SlackDetector.findSectionById(sectionId);
      if (element && this.isBlocking) {
        this.hideElement(element);
        this.hideChannelsInSection(element);
      }
      return true;
    }
  }

  /**
   * Show all channels within a section
   */
  private showChannelsInSection(sectionElement: Element): void {
    let container = sectionElement.parentElement;
    while (container && !container.querySelector(SlackDetector.SELECTORS.channelItem)) {
      container = container.parentElement;
    }

    if (container) {
      const channels = container.querySelectorAll(SlackDetector.SELECTORS.channelItem);
      channels.forEach(channel => this.showElement(channel));
    }
  }

  /**
   * Show visual feedback when blocking/unblocking
   */
  showBlockFeedback(element: Element, isBlocking: boolean): void {
    element.classList.add('slack-focus-helper-block-feedback');
    
    setTimeout(() => {
      element.classList.remove('slack-focus-helper-block-feedback');
    }, 300);
  }

  /**
   * Refresh blocking state for new/changed elements
   */
  async refreshBlocks(): Promise<void> {
    if (this.isBlocking) {
      await this.applyBlocks();
    }
  }

  /**
   * Get current blocking status
   */
  isCurrentlyBlocking(): boolean {
    return this.isBlocking;
  }

  /**
   * Get workspace name
   */
  getWorkspaceName(): string | null {
    return this.workspaceName;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopTimeBasedChecking();
    
    // Remove injected CSS
    const style = document.getElementById('slack-focus-helper-style');
    if (style) {
      style.remove();
    }
  }
}