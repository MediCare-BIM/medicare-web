const MONTHS_ROMANIAN: Record<string, number> = {
  ian: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mai: 4,
  iun: 5,
  iul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  noi: 10,
  dec: 11,
};

const MONTHS_NAMES = [
  'ian',
  'feb',
  'mar',
  'apr',
  'mai',
  'iun',
  'iul',
  'aug',
  'sep',
  'oct',
  'noi',
  'dec',
];

/**
 * Parses a Romanian date string (e.g., "15 ian. 2025") to timestamp
 */
export const parseRomanianDate = (dateStr: string): number => {
  const parts = dateStr.toLowerCase().split(' ');
  const day = parseInt(parts[0]);
  const month = MONTHS_ROMANIAN[parts[1]?.replace('.', '') || ''] ?? 0;
  const year = parseInt(parts[2] || '2025');
  return new Date(year, month, day).getTime();
};

/**
 * Formats a date string to Romanian format (e.g., "15 ian. 2025")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = MONTHS_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month}. ${year}`;
}

/**
 * Calculates age from a birth date string
 */
export function calculateAge(birthDate: string | null): number {
  if (!birthDate) return 0;

  const today = new Date();
  const birth = new Date(birthDate);

  // Check if date is valid
  if (isNaN(birth.getTime())) {
    console.error('Invalid birth date:', birthDate);
    return 0;
  }

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
