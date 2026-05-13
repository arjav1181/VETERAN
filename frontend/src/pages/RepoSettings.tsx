import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranInput } from '@ui/VeteranInput';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranModal } from '@ui/VeteranModal';
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

const repoInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid repository name'),
  description: z.string().max(500).optional(),
  homepage: z.string().url().optional().or(z.literal('')),
});

export function RepoSettings() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(repoInfoSchema),
    defaultValues: {
      name: repo,
      description: 'A repository for great things',
      homepage: '',
    },
  });

  const tabs: TabItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <form onSubmit={handleSubmit((d) => console.log(d))} className="space-y-8 max-w-2xl">
          {/* Repository name */}
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
              <VeteranButton type="submit" icon={<Save className="w-4 h-4" />}>
                Save changes
              </VeteranButton>
            </div>
          </section>

          {/* Visibility */}
          <section className="pt-8 border-t border-surface-200 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Visibility</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                <input type="radio" name="visibility" value="public" defaultChecked className="text-veteran-600 focus:ring-veteran-500" />
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">Public</p>
                  <p className="text-xs text-surface-500">Anyone can see this repository</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800">
                <input type="radio" name="visibility" value="private" className="text-veteran-600 focus:ring-veteran-500" />
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">Private</p>
                  <p className="text-xs text-surface-500">Only you and collaborators can see this repository</p>
                </div>
              </label>
            </div>
          </section>

          {/* Archive */}
          <section className="pt-8 border-t border-surface-200 dark:border-surface-700">
            <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-2">Archive repository</h3>
            <p className="text-sm text-surface-500 mb-4">Archiving will make the repository read-only.</p>
            <VeteranButton variant="secondary">Archive this repository</VeteranButton>
          </section>

          {/* Delete */}
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
      content: <BranchesSettings />,
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
            <VeteranButton variant="danger" onClick={() => {}}>
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

function BranchesSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))]">Branch Protection Rules</h3>
        <VeteranButton size="sm" icon={<Plus className="w-4 h-4" />}>Add rule</VeteranButton>
      </div>

      <div className="space-y-2">
        {['main', 'develop', 'release/*'].map((branch) => (
          <div key={branch} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-4 h-4 text-surface-400" />
              <div>
                <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">{branch}</p>
                <p className="text-xs text-surface-500">Requires pull request reviews, status checks</p>
              </div>
            </div>
            <VeteranButton variant="ghost" size="sm">Edit</VeteranButton>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-3">Default branch</h3>
        <select className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-[rgb(var(--veteran-bg))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-veteran-500/50">
          <option>main</option>
          <option>develop</option>
          <option>master</option>
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
