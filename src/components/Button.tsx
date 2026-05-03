import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:     'bg-primary text-white hover:bg-primary-dark disabled:opacity-60',
  secondary:   'bg-card text-foreground border border-border hover:bg-muted disabled:opacity-60',
  destructive: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60',
  ghost:       'text-foreground hover:bg-muted disabled:opacity-60',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: 'sm' | 'md';
  children: ReactNode;
}) {
  const sizeCls = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors ${sizeCls} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
