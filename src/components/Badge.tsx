import { ReactNode } from 'react';

type Tone = 'green' | 'amber' | 'red' | 'blue' | 'slate';

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-green-100 text-green-700 border-green-600/20',
  amber: 'bg-amber-100 text-amber-500 border-amber-500/20',
  red:   'bg-red-50  text-red-700  border-red-600/20',
  blue:  'bg-blue-50 text-blue-700 border-blue-700/20',
  slate: 'bg-slate-100 text-slate-700 border-slate-300/40',
};

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
