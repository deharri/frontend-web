import { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
        <Icon size={20} className="text-mutedForeground" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="text-sm text-mutedForeground mt-1">{description}</p>}
    </div>
  );
}
