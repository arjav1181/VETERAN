import { create } from 'zustand';

interface RepoStore {
  currentBranch: string;
  setCurrentBranch: (branch: string) => void;
  expandPaths: Set<string>;
  togglePath: (path: string) => void;
  expandPath: (path: string) => void;
  collapsePath: (path: string) => void;
  collapseAll: () => void;
  fileView: 'tree' | 'list';
  setFileView: (view: 'tree' | 'list') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLines: [number, number] | null;
  setSelectedLines: (lines: [number, number] | null) => void;
  theme: 'vs-dark' | 'dracula' | 'nord' | 'one-dark' | 'monokai';
  setTheme: (theme: 'vs-dark' | 'dracula' | 'nord' | 'one-dark' | 'monokai') => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  wordWrap: boolean;
  setWordWrap: (wrap: boolean) => void;
  vimMode: boolean;
  setVimMode: (vim: boolean) => void;
  minimap: boolean;
  setMinimap: (minimap: boolean) => void;
}

export const useRepoStore = create<RepoStore>((set) => ({
  currentBranch: 'main',
  setCurrentBranch: (branch) => set({ currentBranch: branch }),
  expandPaths: new Set(),
  togglePath: (path) =>
    set((state) => {
      const next = new Set(state.expandPaths);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return { expandPaths: next };
    }),
  expandPath: (path) =>
    set((state) => {
      const next = new Set(state.expandPaths);
      next.add(path);
      return { expandPaths: next };
    }),
  collapsePath: (path) =>
    set((state) => {
      const next = new Set(state.expandPaths);
      next.delete(path);
      return { expandPaths: next };
    }),
  collapseAll: () => set({ expandPaths: new Set() }),
  fileView: 'tree',
  setFileView: (view) => set({ fileView: view }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedLines: null,
  setSelectedLines: (lines) => set({ selectedLines: lines }),
  theme: 'vs-dark',
  setTheme: (theme) => set({ theme }),
  fontSize: 14,
  setFontSize: (size) => set({ fontSize: size }),
  wordWrap: false,
  setWordWrap: (wrap) => set({ wordWrap: wrap }),
  vimMode: false,
  setVimMode: (vim) => set({ vimMode: vim }),
  minimap: true,
  setMinimap: (minimap) => set({ minimap }),
}));
