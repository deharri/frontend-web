import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bookmark, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import type { SavedFilter } from '@/lib/useSavedFilters';

export function SaveFilterMenu<T>({
  presets,
  current,
  onLoad,
  onSave,
  onRemove,
}: {
  presets: SavedFilter<T>[];
  current: T;
  onLoad: (filters: T) => void;
  onSave: (name: string, filters: T) => void;
  onRemove: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const promptAndSave = () => {
    const name = window.prompt('Name this filter preset:');
    if (name && name.trim()) {
      onSave(name.trim(), current);
      setOpen(false);
    }
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size="sm" aria-label="Saved filters">
          <Bookmark size={14} />
          Filters
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="min-w-[220px] bg-card rounded-md border border-border shadow-md p-1 z-50"
        >
          <DropdownMenu.Item
            onSelect={promptAndSave}
            className="flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-muted cursor-pointer outline-none"
          >
            <Plus size={14} />
            Save current as preset…
          </DropdownMenu.Item>
          {presets.length > 0 && (
            <>
              <DropdownMenu.Separator className="h-px bg-border my-1" />
              <div className="px-2 py-1 text-xs text-mutedForeground uppercase tracking-wider">Saved</div>
              {presets.map((p) => (
                <div key={p.name} className="flex items-center justify-between hover:bg-muted rounded-sm">
                  <DropdownMenu.Item
                    onSelect={() => { onLoad(p.filters); setOpen(false); }}
                    className="flex-1 px-2 py-2 text-sm cursor-pointer outline-none"
                  >
                    {p.name}
                  </DropdownMenu.Item>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(p.name); }}
                    className="px-2 py-2 text-mutedForeground hover:text-red-700"
                    aria-label={`Delete preset ${p.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
