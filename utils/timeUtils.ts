export interface TimeInMinutes {
  minutes: number;
}

export function parseTimeToMinutes(timeString: string): TimeInMinutes {
  const [hour, min] = timeString.split(':').map(Number);
  return { minutes: hour * 60 + min };
}

export function isTimeOverlapping(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  const start1Minutes = parseTimeToMinutes(start1).minutes;
  const end1Minutes = parseTimeToMinutes(end1).minutes;
  const start2Minutes = parseTimeToMinutes(start2).minutes;
  const end2Minutes = parseTimeToMinutes(end2).minutes;

  return (
    (start1Minutes >= start2Minutes && start1Minutes < end2Minutes) ||
    (end1Minutes > start2Minutes && end1Minutes <= end2Minutes) ||
    (start1Minutes <= start2Minutes && end1Minutes >= end2Minutes)
  );
}

export function isValidTimeRange(start: string, end: string): boolean {
  const startMinutes = parseTimeToMinutes(start).minutes;
  const endMinutes = parseTimeToMinutes(end).minutes;
  return startMinutes < endMinutes;
}

export function sortTimeBlocksByStart<T extends { start: string }>(blocks: T[]): T[] {
  return [...blocks].sort((a, b) => {
    const aMinutes = parseTimeToMinutes(a.start).minutes;
    const bMinutes = parseTimeToMinutes(b.start).minutes;
    return aMinutes - bMinutes;
  });
}