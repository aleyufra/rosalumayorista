// Horarios del local. Los valores de dia ('monday'...) son los del CMS (settings.hours);
// los textos para el publico salen de DAY_NAMES y DAY_PLURALS. La hora siempre se calcula
// en la zona horaria del local, no en la del visitante ni la del servidor de build.
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
  reopens?: string | undefined;
  closesLate?: string | undefined;
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

type OpenDay = DayHours & { opens: string; closes: string };

function hasSecondShift(h: OpenDay): h is OpenDay & { reopens: string; closesLate: string } {
  return Boolean(h.reopens && h.closesLate);
}

/** "de 10 a 20" o, con corte al mediodia, "de 10 a 14 y de 18 a 22". */
function shiftsText(h: OpenDay): string {
  const first = `de ${shortTime(h.opens)} a ${shortTime(h.closes)}`;
  return hasSecondShift(h)
    ? `${first} y de ${shortTime(h.reopens)} a ${shortTime(h.closesLate)}`
    : first;
}

/** Dia de la semana y minutos desde la medianoche de un momento, en la zona horaria del local. */
export function localClock(
  date: Date,
  timeZone = STORE_TIMEZONE,
): { day: Weekday; minutes: number } {
  // Se usa 'en-US' a proposito: devuelve el dia en ingles, que coincide con el tipo Weekday.
  // hourCycle h23 evita el "24:00" de medianoche.
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
 * Una linea para el hero: "Hoy abrimos de 10 a 20" mientras el dia todavia no termino,
 * y si no, cuando abrimos de nuevo ("Mañana abrimos a las 10", "El lunes abrimos a las 10").
 */
export function getOpeningStatus(hours: DayHours[], now: Date, timeZone = STORE_TIMEZONE): string {
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const { day, minutes } = localClock(now, timeZone);
  const today = byDay.get(day);
  if (isOpenDay(today)) {
    const lastClose = hasSecondShift(today) ? today.closesLate : today.closes;
    if (minutes < toMinutes(lastClose)) return `Hoy abrimos ${shiftsText(today)}`;
  }
  // Hoy ya cerro o es feriado: se busca el proximo dia abierto, hasta una semana adelante
  // (offset 7 es el mismo dia de la semana que viene).
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

/** Agrupa dias consecutivos con el mismo horario: "Lunes a viernes de 10 a 20". */
export function summarizeHours(hours: DayHours[]): string[] {
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const key = (h: DayHours | undefined) => (isOpenDay(h) ? shiftsText(h) : 'closed');
  // Agrupa dias contiguos con el mismo horario; todos los dias cerrados comparten la clave 'closed'.
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
      ? `${days} ${shiftsText(h)}`
      : `${days} cerrado`;
  });
}
