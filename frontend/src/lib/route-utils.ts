/**
 * Reliable owner/repo extraction from URL.
 * Uses window.location.pathname as source of truth.
 * useParams can be unreliable in some environments (Codespaces, proxies).
 */
export function getRepoParams(): { owner: string; repo: string } {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return {
    owner: parts[0] || '',
    repo: parts[1] || '',
  };
}

export function getOwnerParam(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[0] || '';
}

export function getIssueNumber(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[3] || '';
}

export function getPullNumber(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[3] || '';
}
