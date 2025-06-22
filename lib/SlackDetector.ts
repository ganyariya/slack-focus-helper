// Slack DOM detection and manipulation utilities
// Based on SPEC.md and CLAUDE.md selector specifications

export const SELECTORS = {
  workspaceName: '.p-ia4_sidebar_header__title--inner .p-ia4_home_header_menu__team_name',
  channelItem: '.p-channel_sidebar__channel',
  channelName: '.p-channel_sidebar__name', 
  sectionHeading: '.p-channel_sidebar__section_heading',
  sidebar: '.p-channel_sidebar'
};

export interface ChannelInfo {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm' | 'app';
  element: Element;
}

export interface SectionInfo {
  id: string;
  name: string;
  element: Element;
}

export class SlackDetector {
  static readonly SELECTORS = SELECTORS;
  /**
   * Get the current workspace name
   */
  static getWorkspaceName(): string | null {
    try {
      const workspaceElement = document.querySelector(SELECTORS.workspaceName);
      if (workspaceElement && workspaceElement.textContent) {
        return workspaceElement.textContent.trim();
      }
      return null;
    } catch (error) {
      console.error('Failed to get workspace name:', error);
      return null;
    }
  }

  /**
   * Get all channel elements with their information
   */
  static getChannels(): ChannelInfo[] {
    try {
      const channelElements = document.querySelectorAll(SELECTORS.channelItem);
      const channels: ChannelInfo[] = [];

      channelElements.forEach((element) => {
        const channelInfo = this.extractChannelInfo(element);
        if (channelInfo) {
          channels.push(channelInfo);
        }
      });

      return channels;
    } catch (error) {
      console.error('Failed to get channels:', error);
      return [];
    }
  }

  /**
   * Extract channel information from a channel element
   */
  private static extractChannelInfo(element: Element): ChannelInfo | null {
    try {
      const nameElement = element.querySelector(SELECTORS.channelName);
      if (!nameElement || !nameElement.textContent) {
        return null;
      }

      const name = nameElement.textContent.trim();
      
      // Generate a unique ID from the element attributes or content
      const id = this.generateChannelId(element, name);
      
      // Determine channel type based on element classes or attributes
      const type = this.determineChannelType(element);

      return {
        id,
        name,
        type,
        element
      };
    } catch (error) {
      console.error('Failed to extract channel info:', error);
      return null;
    }
  }

  /**
   * Generate a unique channel ID
   */
  private static generateChannelId(element: Element, name: string): string {
    // Try to get ID from data attributes first
    const dataId = element.getAttribute('data-qa-channel-sidebar-channel-id') || 
                   element.getAttribute('data-qa') ||
                   element.getAttribute('id');
    
    if (dataId) {
      return dataId;
    }

    // Fallback: generate from name and element position
    const siblings = Array.from(element.parentElement?.children || []);
    const index = siblings.indexOf(element);
    return `channel-${name.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
  }

  /**
   * Determine channel type based on element attributes
   */
  private static determineChannelType(element: Element): 'public' | 'private' | 'dm' | 'app' {
    const classList = element.className;
    const dataQa = element.getAttribute('data-qa') || '';

    // Check for DM indicators
    if (classList.includes('im') || dataQa.includes('dm') || dataQa.includes('im')) {
      return 'dm';
    }

    // Check for private channel indicators
    if (classList.includes('private') || dataQa.includes('private')) {
      return 'private';
    }

    // Check for app/bot indicators
    if (classList.includes('app') || dataQa.includes('app') || classList.includes('bot')) {
      return 'app';
    }

    // Default to public channel
    return 'public';
  }

  /**
   * Get all section elements with their information
   */
  static getSections(): SectionInfo[] {
    try {
      const sectionElements = document.querySelectorAll(SELECTORS.sectionHeading);
      const sections: SectionInfo[] = [];

      sectionElements.forEach((element) => {
        const sectionInfo = this.extractSectionInfo(element);
        if (sectionInfo) {
          sections.push(sectionInfo);
        }
      });

      return sections;
    } catch (error) {
      console.error('Failed to get sections:', error);
      return [];
    }
  }

  /**
   * Extract section information from a section element
   */
  private static extractSectionInfo(element: Element): SectionInfo | null {
    try {
      const name = element.textContent?.trim();
      if (!name) {
        return null;
      }

      // Generate a unique ID for the section
      const id = this.generateSectionId(element, name);

      return {
        id,
        name,
        element
      };
    } catch (error) {
      console.error('Failed to extract section info:', error);
      return null;
    }
  }

  /**
   * Generate a unique section ID
   */
  private static generateSectionId(element: Element, name: string): string {
    // Try to get ID from data attributes
    const dataId = element.getAttribute('data-qa') || element.getAttribute('id');
    
    if (dataId) {
      return dataId;
    }

    // Fallback: generate from name and element position
    const siblings = Array.from(element.parentElement?.children || []);
    const index = siblings.indexOf(element);
    return `section-${name.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`;
  }

  /**
   * Find a channel element by ID
   */
  static findChannelById(channelId: string): Element | null {
    const channels = this.getChannels();
    const channel = channels.find(c => c.id === channelId);
    return channel?.element || null;
  }

  /**
   * Find a section element by ID
   */
  static findSectionById(sectionId: string): Element | null {
    const sections = this.getSections();
    const section = sections.find(s => s.id === sectionId);
    return section?.element || null;
  }

  /**
   * Check if Slack sidebar is present and loaded
   */
  static isSidebarLoaded(): boolean {
    const sidebar = document.querySelector(SELECTORS.sidebar);
    return sidebar !== null && sidebar.children.length > 0;
  }
}