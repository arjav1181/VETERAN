import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 5) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

export function formatAbsoluteTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function formatShortSha(sha: string): string {
  return sha.substring(0, 7);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filename.substring(dotIndex + 1).toLowerCase();
}

export function isBinaryFile(mimeType?: string, filename?: string): boolean {
  if (mimeType) {
    const textTypes = ['text/', 'application/json', 'application/xml', 'application/javascript', 'application/x-yaml'];
    return !textTypes.some(t => mimeType.startsWith(t));
  }
  if (filename) {
    const ext = getFileExtension(filename);
    const binaryExts = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'webp', 'bmp', 'pdf', 'zip', 'gz', 'tar', 'exe', 'dll', 'so', 'dylib', 'woff', 'woff2', 'ttf', 'eot', 'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'ogg', 'wav', 'flac', 'aac', 'mpg', 'mpeg', 'avi', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    return binaryExts.includes(ext);
  }
  return false;
}

export function getLanguageFromFilename(filename: string): string {
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    html: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    dockerfile: 'dockerfile',
    graphql: 'graphql',
    svelte: 'svelte',
    vue: 'vue',
    astro: 'astro',
    mdx: 'markdown',
    tex: 'latex',
    r: 'r',
    toml: 'toml',
    ini: 'ini',
    cfg: 'ini',
    conf: 'ini',
  };
  const ext = getFileExtension(filename);
  if (filename === 'Dockerfile' || filename.endsWith('Dockerfile')) return 'dockerfile';
  if (filename === '.eslintrc' || filename === '.prettierrc') return 'json';
  if (filename === 'Makefile' || filename === 'makefile') return 'makefile';
  return map[ext] || '';
}

export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename);
  const iconMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'react',
    ts: 'typescript',
    tsx: 'react_ts',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    html: 'html',
    css: 'css',
    scss: 'sass',
    json: 'json',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml',
    md: 'markdown',
    sql: 'database',
    sh: 'terminal',
    bash: 'terminal',
    svg: 'image',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    ico: 'image',
    pdf: 'pdf',
    zip: 'zip',
    tar: 'zip',
    gz: 'zip',
    rar: 'zip',
    txt: 'document',
    csv: 'table',
    xlsx: 'table',
    doc: 'document',
    docx: 'document',
    ppt: 'presentation',
    pptx: 'presentation',
    mp3: 'audio',
    mp4: 'video',
    wav: 'audio',
    mov: 'video',
    avi: 'video',
    exe: 'binary',
    dll: 'binary',
    so: 'binary',
    dylib: 'binary',
    lock: 'lock',
    toml: 'config',
    ini: 'config',
    cfg: 'config',
    yaml: 'config',
    yml: 'config',
    env: 'config',
    gitignore: 'git',
    gitattributes: 'git',
    gitmodules: 'git',
  };
  return iconMap[ext] || 'file';
}

export function getSetiIcon(filename: string): string {
  const ext = getFileExtension(filename);
  const icons: Record<string, string> = {
    js: '\ue781', jsx: '\ue7ba', ts: '\ue7b7', tsx: '\ue7b7',
    py: '\ue71c', rb: '\ue21e', rs: '\ue7a8', go: '\ue724',
    java: '\ue738', c: '\ue71e', cpp: '\ue71d', cs: '\ue81c',
    php: '\ue73d', html: '\ue736', css: '\ue749', scss: '\ue74b',
    json: '\ue60b', xml: '\ue619', yml: '\ue6bd', yaml: '\ue6bd',
    md: '\ue73e', sql: '\ue706', sh: '\ue795', bash: '\ue795',
    svg: '\ue71b', png: '\ue71b', jpg: '\ue71b', jpeg: '\ue71b',
    gif: '\ue71b', webp: '\ue71b', ico: '\ue71b',
    pdf: '\ue724', zip: '\ue724', tar: '\ue724', gz: '\ue724',
    txt: '\ue612', csv: '\ue6a1',
    mp3: '\ue641', mp4: '\ue641', wav: '\ue641',
    toml: '\ue6b2', ini: '\ue6b2', cfg: '\ue615', yml: '\ue6bd',
    lock: '\ue623', env: '\ue615',
    dockerfile: '\ue7b0',
  };
  if (filename === 'Dockerfile') return '\ue7b0';
  if (filename === '.gitignore') return '\ue702';
  return icons[ext] || '\ue60f';
}

export function getCommitDateGroup(dateString: string): { label: string; order: number } {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - today.getDay());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  if (date >= today) return { label: 'Today', order: 0 };
  if (date >= yesterday) return { label: 'Yesterday', order: 1 };
  if (date >= weekStart) return { label: 'This week', order: 2 };
  if (date >= monthStart) return { label: 'This month', order: 3 };
  const diffMonths = now.getMonth() - date.getMonth() + (now.getFullYear() - date.getFullYear()) * 12;
  if (diffMonths <= 1) return { label: 'Last month', order: 4 };
  return { label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), order: 5 };
}

export function getContributionColor(count: number, maxCount: number): string {
  if (count === 0) return 'bg-surface-800/50';
  const intensity = count / maxCount;
  if (intensity <= 0.25) return 'bg-success/20';
  if (intensity <= 0.5) return 'bg-success/40';
  if (intensity <= 0.75) return 'bg-success/60';
  return 'bg-success/80';
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
