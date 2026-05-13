export interface FeatureFlags {
  codespaces: boolean;
  packages: boolean;
  actions: boolean;
  analytics: boolean;
  aiSearch: boolean;
  email: boolean;
  oauth: boolean;
  webhooks: boolean;
  wiki: boolean;
  discussions: boolean;
  projects: boolean;
  insights: boolean;
  adminPanel: boolean;
  importRepo: boolean;
}

const DEFAULT_FEATURES: FeatureFlags = {
  codespaces: false,
  packages: true,
  actions: true,
  analytics: false,
  aiSearch: false,
  email: false,
  oauth: true,
  webhooks: true,
  wiki: true,
  discussions: true,
  projects: true,
  insights: true,
  adminPanel: true,
  importRepo: true,
};

const CLOUD_FEATURES: FeatureFlags = {
  ...DEFAULT_FEATURES,
  codespaces: true,
  analytics: true,
  aiSearch: true,
  email: true,
};

let cachedFeatures: FeatureFlags | null = null;

export async function loadFeatureFlags(): Promise<FeatureFlags> {
  if (cachedFeatures) return cachedFeatures;

  try {
    const res = await fetch('/api/v1/meta/features');
    if (res.ok) {
      const data = await res.json();
      cachedFeatures = { ...DEFAULT_FEATURES, ...data };
      return cachedFeatures!;
    }
  } catch {}

  const isSelfHosted = !window.location.hostname.includes('.') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  cachedFeatures = isSelfHosted ? DEFAULT_FEATURES : CLOUD_FEATURES;
  return cachedFeatures;
}

export function getFeatures(): FeatureFlags {
  if (cachedFeatures) return cachedFeatures;
  return DEFAULT_FEATURES;
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatures()[feature];
}
