import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, Building2, ArrowLeft } from 'lucide-react';
import { orgApi } from '@lib/api/endpoints/orgs';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { getApiError } from '@lib/api/client';
import toast from 'react-hot-toast';

export function OrgSettings() {
  const { org: orgSlug } = useParams<{ org: string }>();
  const queryClient = useQueryClient();

  const { data: org, isLoading, error } = useQuery({
    queryKey: ['org', orgSlug],
    queryFn: () => orgApi.get(orgSlug!),
    enabled: !!orgSlug,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (org) {
      setName(org.name || '');
      setDescription(org.description || '');
      setLocation(org.location || '');
      setWebsite(org.website || '');
      setEmail(org.email || '');
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string; location?: string; website?: string; email?: string }) =>
      orgApi.update(orgSlug!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org', orgSlug] });
      toast.success('Organization settings saved');
    },
    onError: (err) => {
      const apiError = getApiError(err);
      toast.error(apiError.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ name, description, location, website, email });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <VeteranEmptyState icon="alert" title="Failed to load organization" description="Could not fetch organization settings." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Building2 size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">{orgSlug} settings</h1>
        </div>

        <div className="border border-border rounded-lg bg-surface p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Display name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Website</label>
              <input value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Contact email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
              className="w-full px-3 py-2 bg-primary-dark border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>

          <div className="pt-4 border-t border-border">
            <button onClick={handleSave} disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50">
              {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
