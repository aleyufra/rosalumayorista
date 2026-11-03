import { describe, expect, it } from 'vitest';
import { getOpeningStatus, summarizeHours, type DayHours } from './opening-hours';

const hours: DayHours[] = [
  { day: 'monday', opens: '10:00', closes: '20:00' },
  { day: 'tuesday', opens: '10:00', closes: '20:00' },
  { day: 'wednesday', opens: '10:00', closes: '20:00' },
  { day: 'thursday', opens: '10:00', closes: '20:00' },
  { day: 'friday', opens: '10:00', closes: '20:00' },
  { day: 'saturday', opens: '10:00', closes: '14:00' },
  { day: 'sunday', closed: true },
];

// Jujuy is UTC-3 all year. 2026-11-02 is a Monday.
const at = (local: string) => new Date(`${local}-03:00`);

describe('getOpeningStatus', () => {
  it('announces today before opening', () => {
    expect(getOpeningStatus(hours, at('2026-11-02T08:00:00'))).toBe('Hoy abrimos de 10 a 20');
  });

  it('keeps today while open', () => {
    expect(getOpeningStatus(hours, at('2026-11-02T15:30:00'))).toBe('Hoy abrimos de 10 a 20');
  });

  it('says tomorrow after closing', () => {
    expect(getOpeningStatus(hours, at('2026-11-02T20:30:00'))).toBe('Mañana abrimos a las 10');
  });

  it('skips Sunday on Saturday afternoon', () => {
    expect(getOpeningStatus(hours, at('2026-11-07T15:00:00'))).toBe('El lunes abrimos a las 10');
  });

  it('says tomorrow on Sunday', () => {
    expect(getOpeningStatus(hours, at('2026-11-08T11:00:00'))).toBe('Mañana abrimos a las 10');
  });
});

describe('summarizeHours', () => {
  it('groups days with the same hours', () => {
    expect(summarizeHours(hours)).toEqual([
      'Lunes a viernes de 10 a 20',
      'Sábados de 10 a 14',
      'Domingos cerrado',
    ]);
  });
});

describe('split hours', () => {
  const split: DayHours[] = [
    ...['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => ({
      day: day as DayHours['day'],
      opens: '10:00',
      closes: '14:00',
      reopens: '18:00',
      closesLate: '22:00',
    })),
    { day: 'sunday', closed: true },
  ];

  it('shows both shifts until the evening close', () => {
    expect(getOpeningStatus(split, at('2026-11-02T16:00:00'))).toBe(
      'Hoy abrimos de 10 a 14 y de 18 a 22',
    );
    expect(getOpeningStatus(split, at('2026-11-02T22:30:00'))).toBe('Mañana abrimos a las 10');
  });

  it('summarizes both shifts', () => {
    expect(summarizeHours(split)).toEqual([
      'Lunes a sábado de 10 a 14 y de 18 a 22',
      'Domingos cerrado',
    ]);
  });
});
