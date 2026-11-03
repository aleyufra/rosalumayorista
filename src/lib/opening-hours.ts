export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface DayHours {
  day: Weekday;
  closed?: boolean | undefined;
  opens?: string | undefined;
  closes?: string | undefined;
}

const DAY_NAMES: Record<Weekday, string> = {
  monday: 'lunes',
  tuesday: 'martes',
  wednesday: 'miércoles',
  thursday: 'jueves',
  friday: 'viernes',
  saturday: 'sábado',
  sunday: 'domingo',
};

const DAY_PLURALS: Record<Weekday, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábados',
  sunday: 'Domingos',
};

export const STORE_TIMEZONE = 'America/Argentina/Jujuy';

/** "10:00" -> "10", "10:30" -> "10:30". */
export function shortTime(time: string): string {
  return time.endsWith(':00') ? String(Number(time.slice(0, 2))) : time.replace(/^0/, '');
}

function isOpenDay(h: DayHours | undefined): h is DayHours & { opens: string; closes: string } {
  return Boolean(h && !h.closed && h.opens && h.closes);
}

/** Weekday and minutes since midnight of a moment, in the store's timezone. */
export function localClock(
  date: Date,
  timeZone = STORE_TIMEZONE,
): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = get('weekday').toLowerCase() as Weekday;
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * One line for the hero: "Hoy abrimos de 10 a 20" while today is still ahead or open,
 * otherwise when we open next ("Mañana abrimos a las 10", "El lunes abrimos a las 10").
 */
export function getOpeningStatus(hours: DayHours[], now: Date, timeZone = STORE_TIMEZONE): string {
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const { day, minutes } = localClock(now, timeZone);
  const today = byDay.get(day);
  if (isOpenDay(today) && minutes < toMinutes(today.closes)) {
    return `Hoy abrimos de ${shortTime(today.opens)} a ${shortTime(today.closes)}`;
  }
  const start = WEEKDAYS.indexOf(day);
  for (let offset = 1; offset <= 7; offset++) {
    const next = WEEKDAYS[(start + offset) % 7] as Weekday;
    const h = byDay.get(next);
    if (!isOpenDay(h)) continue;
    const when = offset === 1 ? 'Mañana' : `El ${DAY_NAMES[next]}`;
    return `${when} abrimos a las ${shortTime(h.opens)}`;
  }
  return '';
}

/** Groups consecutive days with the same hours: "Lunes a viernes de 10 a 20". */
export function summarizeHours(hours: DayHours[]): string[] {
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const key = (h: DayHours | undefined) => (isOpenDay(h) ? `${h.opens}-${h.closes}` : 'closed');
  const groups: { from: Weekday; to: Weekday; h: DayHours | undefined }[] = [];
  for (const day of WEEKDAYS) {
    const h = byDay.get(day);
    const last = groups.at(-1);
    if (last && key(last.h) === key(h)) last.to = day;
    else groups.push({ from: day, to: day, h });
  }
  return groups.map(({ from, to, h }) => {
    const days = from === to ? DAY_PLURALS[from] : `${DAY_PLURALS[from]} a ${DAY_NAMES[to]}`;
    return isOpenDay(h)
      ? `${days} de ${shortTime(h.opens)} a ${shortTime(h.closes)}`
      : `${days} cerrado`;
  });
}
