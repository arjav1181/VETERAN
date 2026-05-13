type Shortcut = {
  id: string;
  keys: string[];
  description: string;
  category: 'navigation' | 'actions' | 'editor' | 'search';
};

export const defaultShortcuts: Shortcut[] = [
  { id: 'command-palette', keys: ['mod+k'], description: 'Open command palette', category: 'navigation' },
  { id: 'search', keys: ['mod+shift+f'], description: 'Search repository', category: 'search' },
  { id: 'goto-file', keys: ['mod+p'], description: 'Go to file', category: 'navigation' },
  { id: 'create-file', keys: ['mod+n'], description: 'Create new file', category: 'actions' },
  { id: 'save', keys: ['mod+s'], description: 'Save file', category: 'editor' },
  { id: 'commit', keys: ['mod+shift+enter'], description: 'Commit changes', category: 'actions' },
  { id: 'toggle-sidebar', keys: ['mod+b'], description: 'Toggle sidebar', category: 'navigation' },
  { id: 'toggle-theme', keys: ['mod+shift+t'], description: 'Toggle theme', category: 'actions' },
  { id: 'go-home', keys: ['mod+shift+h'], description: 'Go to dashboard', category: 'navigation' },
  { id: 'go-issues', keys: ['mod+shift+i'], description: 'Go to issues', category: 'navigation' },
  { id: 'go-pulls', keys: ['mod+shift+p'], description: 'Go to pull requests', category: 'navigation' },
  { id: 'new-issue', keys: ['mod+i'], description: 'New issue', category: 'actions' },
  { id: 'new-pull', keys: ['mod+p'], description: 'New pull request', category: 'actions' },
  { id: 'focus-search', keys: ['mod+l'], description: 'Focus search bar', category: 'search' },
  { id: 'escape', keys: ['escape'], description: 'Close panel / Cancel', category: 'navigation' },
];

export function getShortcutLabel(keys: string[]): string {
  return keys
    .map((key) =>
      key
        .replace('mod', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
        .replace('shift', '⇧')
        .replace('alt', '⌥')
        .replace('escape', 'Esc')
        .replace('enter', '↵')
        .replace(/\+/g, ' ')
    )
    .join(' ');
}
