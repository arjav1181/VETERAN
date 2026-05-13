import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Loader2, ArrowLeft } from 'lucide-react';
import { adminApi } from '@lib/api/endpoints/admin';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { getApiError } from '@lib/api/client';
import toast from 'react-hot-toast';

export function AdminSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: () => adminApi.getConfig(),
  });

  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [maxRepoSize, setMaxRepoSize] = useState('100');

  useEffect(() => {
    if (config) {
      setSiteName(String(config.site_name ?? config.siteName ?? ''));
      setSiteDescription(String(config.site_description ?? config.siteDescription ?? ''));
      setAllowRegistration(Boolean(config.allow_registration ?? config.allowRegistration ?? true));
      setRequireEmailVerification(Boolean(config.require_email_verification ?? config.requireEmailVerification ?? true));
      setMaxRepoSize(String(config.max_repo_size ?? config.maxRepoSize ?? '100'));
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] });
      toast.success('Settings saved');
    },
    onError: (err) => {
      const apiError = getApiError(err);
      toast.error(apiError.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      site_name: siteName,
      site_description: siteDescription,
      allow_registration: allowRegistration,
      require_email_verification: requireEmailVerification,
      max_repo_size: parseInt(maxRepoSize, 10) || 100,
    });
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Settings size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Site Settings</h1>
        </div>

        {isLoading ? (
          <VeteranSkeleton variant="card" />
        ) : error ? (
          <VeteranEmptyState icon="alert" title="Failed to load settings" description="Could not fetch site configuration." />
        ) : (
          <div className="border border-border rounded-lg bg-surface p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Site name</label>
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Site description</label>
              <textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={2}
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="checkbox" checked={allowRegistration} onChange={(e) => setAllowRegistration(e.target.checked)}
                  className="rounded border-border bg-primary-dark text-accent focus:ring-accent" />
                Allow new user registration
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="checkbox" checked={requireEmailVerification} onChange={(e) => setRequireEmailVerification(e.target.checked)}
                  className="rounded border-border bg-primary-dark text-accent focus:ring-accent" />
                Require email verification
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Max repository size (MB)</label>
              <input value={maxRepoSize} onChange={(e) => setMaxRepoSize(e.target.value)} type="number"
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>

            <div className="pt-4 border-t border-border">
              <button onClick={handleSave} disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50">
                {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {updateMutation.isPending ? 'Saving...' : 'Save settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
