import { useMemo, useState } from 'react';
import { startOfDay, startOfMonth, subDays, subMonths } from 'date-fns';

export type RangePreset = '7D' | '30D' | '12M' | 'MTD';

export interface DateRange {
  preset: RangePreset;
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  granularity: 'day' | 'week' | 'month';
  label: string;
}

export function useDateRange(initial: RangePreset = '30D') {
  const [preset, setPreset] = useState<RangePreset>(initial);

  const range = useMemo<DateRange>(() => buildRange(preset), [preset]);

  return { range, preset, setPreset };
}

function buildRange(preset: RangePreset): DateRange {
  const now = new Date();
  switch (preset) {
    case '7D': {
      const to = startOfDay(now);
      const from = subDays(to, 7);
      return {
        preset, from, to,
        prevFrom: subDays(from, 7), prevTo: from,
        granularity: 'day',
        label: 'Last 7 days',
      };
    }
    case '30D': {
      const to = startOfDay(now);
      const from = subDays(to, 30);
      return {
        preset, from, to,
        prevFrom: subDays(from, 30), prevTo: from,
        granularity: 'day',
        label: 'Last 30 days',
      };
    }
    case '12M': {
      const to = startOfDay(now);
      const from = subMonths(to, 12);
      return {
        preset, from, to,
        prevFrom: subMonths(from, 12), prevTo: from,
        granularity: 'month',
        label: 'Last 12 months',
      };
    }
    case 'MTD': {
      const from = startOfMonth(now);
      const to = startOfDay(now);
      const prevFrom = startOfMonth(subMonths(now, 1));
      const prevTo = subMonths(to, 1);
      return {
        preset, from, to, prevFrom, prevTo,
        granularity: 'day',
        label: 'Month to date',
      };
    }
  }
}
