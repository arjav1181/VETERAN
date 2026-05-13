import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultShortcuts } from '@lib/shortcuts';

type ShortcutConfig = {
  id: string;
  keys: string[];
  enabled: boolean;
};

type ShortcutState = {
  shortcuts: ShortcutConfig[];
  isEnabled: boolean;
  setShortcutKeys: (id: string, keys: string[]) => void;
  toggleShortcut: (id: string) => void;
  toggleAll: (enabled: boolean) => void;
  resetDefaults: () => void;
  getKeys: (id: string) => string[] | undefined;
};

export const useShortcutStore = create<ShortcutState>()(
  persist(
    (set, get) => ({
      shortcuts: defaultShortcuts.map((s) => ({
        id: s.id,
        keys: s.keys,
        enabled: true,
      })),
      isEnabled: true,

      setShortcutKeys: (id, keys) =>
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, keys } : s
          ),
        })),

      toggleShortcut: (id) =>
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
        })),

      toggleAll: (enabled) =>
        set((state) => ({
          isEnabled: enabled,
          shortcuts: state.shortcuts.map((s) => ({ ...s, enabled })),
        })),

      resetDefaults: () =>
        set({
          shortcuts: defaultShortcuts.map((s) => ({
            id: s.id,
            keys: s.keys,
            enabled: true,
          })),
        }),

      getKeys: (id) => get().shortcuts.find((s) => s.id === id)?.keys,
    }),
    {
      name: 'veteran-shortcuts',
    }
  )
);
