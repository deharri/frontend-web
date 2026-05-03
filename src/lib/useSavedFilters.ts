import { useCallback, useEffect, useState } from 'react';

export interface SavedFilter<T> {
  name: string;
  filters: T;
}

const KEY = (page: string) => `deharri.savedFilters.${page}`;

export function useSavedFilters<T>(pageKey: string) {
  const [presets, setPresets] = useState<SavedFilter<T>[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY(pageKey));
      if (raw) setPresets(JSON.parse(raw) as SavedFilter<T>[]);
    } catch (_e) {
      // corrupt local storage – ignore
    }
  }, [pageKey]);

  const persist = useCallback((next: SavedFilter<T>[]) => {
    setPresets(next);
    localStorage.setItem(KEY(pageKey), JSON.stringify(next));
  }, [pageKey]);

  const save = useCallback((name: string, filters: T) => {
    const next = [...presets.filter((p) => p.name !== name), { name, filters }]
      .sort((a, b) => a.name.localeCompare(b.name));
    persist(next);
  }, [presets, persist]);

  const remove = useCallback((name: string) => {
    persist(presets.filter((p) => p.name !== name));
  }, [presets, persist]);

  const load = useCallback((name: string): T | null => {
    return presets.find((p) => p.name === name)?.filters ?? null;
  }, [presets]);

  return { presets, save, remove, load };
}
