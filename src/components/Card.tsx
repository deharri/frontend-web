import { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  title,
  description,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className={`bg-card rounded-xl border border-border ${className}`}>
      {(title || description) && (
        <div className="border-b border-border p-5">
          {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-sm text-mutedForeground mt-1">{description}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
