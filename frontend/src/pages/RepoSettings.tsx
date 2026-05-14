import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { repoApi, type Repo } from '@lib/api/endpoints/repos';
import { getApiError } from '@lib/api/client';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranInput } from '@ui/VeteranInput';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranModal } from '@ui/VeteranModal';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import {
  Settings,
  Shield,
  GitBranch,
  Bell,
  Webhook,
  Key,
  Delete,
  AlertTriangle,
  Save,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRepoParams } from '@lib/route-utils';

const repoInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid repository name'),
  description: z.string().max(500).optional(),
  homepage: z.string().url().optional().or(z.literal('')),
});

export function RepoSettings() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: repoData, isLoading, error } = useQuery({
    queryKey: ['repo', owner, repo],
    queryFn: () => repoApi.get(owner!, repo!),
    enabled: !!owner && !!repo,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(repoInfoSchema),
    defaultValues: {
      name: repo || '',
      description: '',
      homepage: '',
    },
  });

  useEffect(() => {
    if (repoData) {
      reset({
        name: repoData.name || repo || '',
        description: repoData.description || '',
        homepage: '',
      });
    }
  }, [repoData, reset, repo]);

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string; homepage?: string }) =>
      repoApi.update(owner!, repo!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repo', owner, repo] });
      toast.success('Repository updated');
    },
    onError: (err) => {
      const apiError = getApiError(err);
      toast.error(apiError.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => repoApi.delete(owner!, repo!),
    onSuccess: () => {
      toast.success('Repository deleted');
    },
    onError: (err) => {
      const apiError = getApiError(err);
      toast.error(apiError.message);
    },
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <VeteranSkeleton variant="text" className="w-64 h-8" />
        </div>
        <VeteranSkeleton variant="card" />
      </div>
    );
  }

  if (error || !repoData) {
    return (
      <VeteranEmptyState icon="alert" title="Failed to load repository" description="Could not fetch repository settings." />
    );
  }

  const onSave = (data: { name?: string; description?: string; homepage?: string }) => {
    updateMutation.mutate(data);
  };

  const tabs: TabItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <form onSubmit={handleSubmit(onSave)} className="space-y-8 max-w-2xl">
          <section>
            <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Repository Details</h3>
            <div className="space-y-4">
              <VeteranInput
                label="Repository name"
                error={errors.name?.message}
                {...register('name')}
              />
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-[rgb(var(--veteran-bg))] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-veteran-500/50"
                />
              </div>
              <VeteranInput
                label="Homepage URL"
                placeholder="https://example.com"
                error={errors.homepage?.message}
                {...register('homepage')}
              />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <VeteranButton type="submit" icon={<Save className="w-4 h-4" />} loading={updateMutation.isPending}>
                Save changes
              </VeteranButton>
            </div>
          </section>

          <section className="pt-8 border-t border-surface-200 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Visibility</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                <input type="radio" name="visibility" value="public" defaultChecked={!repoData.isPrivate} className="text-veteran-600 focus:ring-veteran-500" />
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">Public</p>
                  <p className="text-xs text-surface-500">Anyone can see this repository</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                <input type="radio" name="visibility" value="private" defaultChecked={repoData.isPrivate} className="text-veteran-600 focus:ring-veteran-500" />
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">Private</p>
                  <p className="text-xs text-surface-500">Only you and collaborators can see this repository</p>
                </div>
              </label>
            </div>
          </section>

          <section className="pt-8 border-t border-surface-200 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-2">Archive repository</h3>
            <p className="text-sm text-surface-500 mb-4">Archiving will make the repository read-only.</p>
            <VeteranButton variant="secondary">Archive this repository</VeteranButton>
          </section>

          <section className="pt-8 border-t border-red-200 dark:border-red-900">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-surface-500 mb-4">
              Once you delete a repository, there is no going back. Please be certain.
            </p>
            <VeteranButton variant="danger" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4" />
              Delete this repository
            </VeteranButton>
          </section>
        </form>
      ),
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: <GitBranch className="w-4 h-4" />,
      content: <BranchesSettings owner={owner!} repo={repo!} />,
    },
    {
      id: 'collaborators',
      label: 'Collaborators',
      icon: <Users className="w-4 h-4" />,
      content: <CollaboratorsSettings />,
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: <Webhook className="w-4 h-4" />,
      content: <WebhooksSettings />,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-4 h-4" />,
      content: <SecuritySettings />,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--veteran-fg))]">
          {owner}/{repo} settings
        </h1>
      </div>

      <VeteranTabs tabs={tabs} variant="underline" />

      <VeteranModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete repository"
        description="This action cannot be undone. All data will be permanently deleted."
        size="sm"
        footer={
          <>
            <VeteranButton variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</VeteranButton>
            <VeteranButton variant="danger" onClick={() => deleteMutation.mutate()} loading={deleteMutation.isPending}>
              I understand, delete this repository
            </VeteranButton>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-600 dark:text-red-400">
            <p className="font-medium">Warning</p>
            <p>This will permanently delete the {owner}/{repo} repository, including all issues, pull requests, and wiki pages.</p>
          </div>
        </div>
      </VeteranModal>
    </div>
  );
}

function BranchesSettings({ owner, repo }: { owner: string; repo: string }) {
  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches', owner, repo],
    queryFn: () => repoApi.getBranches(owner, repo),
    enabled: !!owner && !!repo,
  });

  if (isLoading) {
    return <VeteranSkeleton variant="card" />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">Branch Protection Rules</h3>
        <VeteranButton size="sm" icon={<Plus className="w-4 h-4" />}>Add rule</VeteranButton>
      </div>

      <div className="space-y-2">
        {(branches || []).map((branch) => (
          <div key={branch.name} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-4 h-4 text-surface-400" />
              <div>
                <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">{branch.name}</p>
                <p className="text-xs text-surface-500">{branch.protected ? 'Protected' : 'Not protected'} · {branch.commit.sha.slice(0, 7)}</p>
              </div>
            </div>
            <VeteranButton variant="ghost" size="sm">Edit</VeteranButton>
          </div>
        ))}
      </div>

      {(!branches || branches.length === 0) && (
        <div className="card p-8 text-center">
          <p className="text-sm text-surface-500">No branches found.</p>
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Default branch</h3>
        <select className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-[rgb(var(--veteran-bg))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-veteran-500/50">
          {(branches || []).map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CollaboratorsSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Add collaborator</h3>
        <div className="flex gap-2">
          <VeteranInput placeholder="Search by username..." className="flex-1" />
          <VeteranButton>Add</VeteranButton>
        </div>
      </div>
    </div>
  );
}

function WebhooksSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">Webhooks</h3>
        <VeteranButton size="sm" icon={<Plus className="w-4 h-4" />}>Add webhook</VeteranButton>
      </div>
      <div className="card p-8 text-center">
        <Webhook className="w-8 h-8 text-surface-400 mx-auto mb-3" />
        <p className="text-sm text-surface-500">No webhooks configured yet.</p>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Deploy keys</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">No deploy keys configured.</p>
          <VeteranButton size="sm" variant="secondary">Add deploy key</VeteranButton>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Secret scanning</h3>
        <p className="text-sm text-surface-500 mb-3">Detect and alert on secrets pushed to this repository.</p>
        <VeteranBadge variant="success" dot>Active</VeteranBadge>
      </section>
    </div>
  );
}
