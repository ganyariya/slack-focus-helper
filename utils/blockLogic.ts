import { SectionGroup, TimeBlock, BlockCheckResult } from '../types';
import { TIME_FORMAT_REGEX } from './constants';

export class BlockLogic {
  static isTimeInBlock(currentTime: string, timeBlock: TimeBlock): boolean {
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const [startHour, startMinute] = timeBlock.start.split(':').map(Number);
    const [endHour, endMinute] = timeBlock.end.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  static isCurrentTimeBlocked(timeBlocks: TimeBlock[]): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return timeBlocks.some(timeBlock => this.isTimeInBlock(currentTime, timeBlock));
  }

  static doesUrlMatch(targetUrl: string, registeredUrl: string): boolean {
    // Partial match: registered URL should be contained in target URL
    return targetUrl.includes(registeredUrl);
  }

  static checkIfShouldBlock(
    currentUrl: string, 
    sectionGroups: Record<string, SectionGroup>
  ): BlockCheckResult {
    for (const [groupName, group] of Object.entries(sectionGroups)) {
      // Skip if group is disabled
      if (!group.enabled) continue;

      // Check if URL matches any in the group
      const matchedUrl = group.urls.find(url => this.doesUrlMatch(currentUrl, url));
      if (!matchedUrl) continue;

      // Check if current time is in any blocked time
      if (this.isCurrentTimeBlocked(group.timeBlocks)) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return {
          shouldBlock: true,
          groupName,
          currentTime,
          matchedUrl
        };
      }
    }

    return { shouldBlock: false };
  }

  static getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  static isValidTimeFormat(time: string): boolean {
    return TIME_FORMAT_REGEX.test(time);
  }
}