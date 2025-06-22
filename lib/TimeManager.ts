import { TimeBlock } from '../types/config';

export class TimeManager {
  /**
   * Check if the current time is within any of the specified time blocks
   */
  static isWithinTimeBlocks(timeBlocks: TimeBlock[]): boolean {
    const now = new Date();
    const currentTime = this.formatTime(now.getHours(), now.getMinutes());
    
    return timeBlocks.some(block => {
      if (!block.enabled) {
        return false;
      }
      return this.isTimeInRange(currentTime, block.start, block.end);
    });
  }

  /**
   * Check if a specific time is within a time range
   */
  static isTimeInRange(time: string, start: string, end: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(start);
    const endMinutes = this.timeToMinutes(end);

    // Handle overnight ranges (e.g., 23:00 - 02:00)
    if (startMinutes > endMinutes) {
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
    
    // Normal range (e.g., 09:00 - 17:00)
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  /**
   * Convert time string "HH:MM" to minutes since midnight
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert hours and minutes to "HH:MM" format
   */
  static formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Get current time as "HH:MM" string
   */
  static getCurrentTime(): string {
    const now = new Date();
    return this.formatTime(now.getHours(), now.getMinutes());
  }

  /**
   * Validate time format "HH:MM"
   */
  static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Create a formatted time block description
   */
  static formatTimeBlock(block: TimeBlock): string {
    const status = block.enabled ? 'Enabled' : 'Disabled';
    return `${block.start} - ${block.end} (${status})`;
  }

  /**
   * Check if two time blocks overlap
   */
  static timeBlocksOverlap(block1: TimeBlock, block2: TimeBlock): boolean {
    if (!block1.enabled || !block2.enabled) {
      return false;
    }

    const start1 = this.timeToMinutes(block1.start);
    const end1 = this.timeToMinutes(block1.end);
    const start2 = this.timeToMinutes(block2.start);
    const end2 = this.timeToMinutes(block2.end);

    // Handle overnight blocks
    const isOvernight1 = start1 > end1;
    const isOvernight2 = start2 > end2;

    if (!isOvernight1 && !isOvernight2) {
      // Both are normal blocks
      return !(end1 < start2 || end2 < start1);
    }

    if (isOvernight1 && !isOvernight2) {
      // Block1 is overnight, block2 is normal
      return !(start2 > end1 && end2 < start1);
    }

    if (!isOvernight1 && isOvernight2) {
      // Block1 is normal, block2 is overnight
      return !(start1 > end2 && end1 < start2);
    }

    // Both are overnight - they always overlap
    return true;
  }

  /**
   * Get the next time when blocking status will change
   */
  static getNextStatusChange(timeBlocks: TimeBlock[]): Date | null {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const enabledBlocks = timeBlocks.filter(block => block.enabled);
    
    if (enabledBlocks.length === 0) {
      return null;
    }

    let nextChangeMinutes: number | null = null;
    
    for (const block of enabledBlocks) {
      const startMinutes = this.timeToMinutes(block.start);
      const endMinutes = this.timeToMinutes(block.end);
      
      if (startMinutes > endMinutes) {
        // Overnight block
        if (currentMinutes <= endMinutes) {
          // Currently in the overnight block, next change is end time
          nextChangeMinutes = this.getCloserTime(nextChangeMinutes, endMinutes);
        } else if (currentMinutes < startMinutes) {
          // Before the overnight block starts today
          nextChangeMinutes = this.getCloserTime(nextChangeMinutes, startMinutes);
        } else {
          // After overnight block start, next change is end time tomorrow
          nextChangeMinutes = this.getCloserTime(nextChangeMinutes, endMinutes + 24 * 60);
        }
      } else {
        // Normal block
        if (currentMinutes < startMinutes) {
          // Before block starts
          nextChangeMinutes = this.getCloserTime(nextChangeMinutes, startMinutes);
        } else if (currentMinutes <= endMinutes) {
          // Inside block
          nextChangeMinutes = this.getCloserTime(nextChangeMinutes, endMinutes);
        } else {
          // After block ends, next change is start time tomorrow
          nextChangeMinutes = this.getCloserTime(nextChangeMinutes, startMinutes + 24 * 60);
        }
      }
    }

    if (nextChangeMinutes === null) {
      return null;
    }

    // Convert minutes to next change time
    const nextChange = new Date(now);
    
    if (nextChangeMinutes >= 24 * 60) {
      // Tomorrow
      nextChange.setDate(nextChange.getDate() + 1);
      nextChangeMinutes -= 24 * 60;
    }
    
    nextChange.setHours(Math.floor(nextChangeMinutes / 60));
    nextChange.setMinutes(nextChangeMinutes % 60);
    nextChange.setSeconds(0);
    nextChange.setMilliseconds(0);

    return nextChange;
  }

  /**
   * Helper to get the closer time (smaller value, but handle wraparound)
   */
  private static getCloserTime(current: number | null, candidate: number): number {
    if (current === null) {
      return candidate;
    }
    return candidate < current ? candidate : current;
  }
}