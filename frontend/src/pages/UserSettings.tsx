import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VeteranTabs, type TabItem } from '@ui/VeteranTabs';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranInput } from '@ui/VeteranInput';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { useAuthStore } from '@stores/authStore';
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Command,
  Save,
  Upload,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().max(160, 'Bio must be at most 160 characters').optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  twitter: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function UserSettings() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: '',
      company: '',
      location: '',
      website: '',
      twitter: '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const tabs: TabItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      content: <ProfileSettings form={profileForm} saving={saving} />,
    },
    {
      id: 'account',
      label: 'Account',
      icon: <Shield className="w-4 h-4" />,
      content: <AccountSettings form={passwordForm} />,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      content: <NotificationSettings />,
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette className="w-4 h-4" />,
      content: <AppearanceSettings />,
    },
    {
      id: 'shortcuts',
      label: 'Keyboard Shortcuts',
      icon: <Command className="w-4 h-4" />,
      content: <ShortcutSettings />,
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Key className="w-4 h-4" />,
      content: <SecuritySettingsSection />,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--veteran-fg))]">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your account settings and preferences.</p>
      </div>
      <VeteranTabs tabs={tabs} variant="underline" />
    </div>
  );
}

function ProfileSettings({ form, saving }: { form: ReturnType<typeof useForm>; saving: boolean }) {
  const { user } = useAuthStore();

  return (
    <form onSubmit={form.handleSubmit(() => {})} className="space-y-8 max-w-2xl">
      {/* Avatar */}
      <section>
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Profile Picture</h3>
        <div className="flex items-center gap-4">
          <VeteranAvatar src={user?.avatar_url} name={user?.name || user?.username || ''} size="xl" />
          <div>
            <VeteranButton variant="secondary" size="sm" icon={<Upload className="w-4 h-4" />}>
              Upload new picture
            </VeteranButton>
            <p className="text-xs text-surface-400 mt-1">PNG, JPG, or WebP. Max 2MB.</p>
          </div>
        </div>
      </section>

      {/* Basic info */}
      <section>
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Basic Information</h3>
        <div className="space-y-4">
          <VeteranInput label="Name" {...form.register('name')} error={form.formState.errors.name?.message as string} />
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Bio</label>
            <textarea
              {...form.register('bio')}
              rows={3}
              className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-[rgb(var(--veteran-bg))] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-veteran-500/50"
            />
            <p className="text-xs text-surface-400 mt-1">Tell us a bit about yourself. Max 160 characters.</p>
          </div>
        </div>
      </section>

      {/* Links */}
      <section>
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VeteranInput label="Company" {...form.register('company')} />
          <VeteranInput label="Location" {...form.register('location')} />
          <VeteranInput label="Website" placeholder="https://example.com" {...form.register('website')} />
          <VeteranInput label="Twitter username" placeholder="@username" {...form.register('twitter')} />
        </div>
      </section>

      <VeteranButton type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
        Save profile
      </VeteranButton>
    </form>
  );
}

function AccountSettings({ form }: { form: ReturnType<typeof useForm> }) {
  return (
    <form onSubmit={form.handleSubmit(() => {})} className="space-y-8 max-w-2xl">
      <section>
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Change Password</h3>
        <div className="space-y-4">
          <VeteranInput
            label="Current password"
            type="password"
            {...form.register('currentPassword')}
            error={form.formState.errors.currentPassword?.message as string}
          />
          <VeteranInput
            label="New password"
            type="password"
            {...form.register('newPassword')}
            error={form.formState.errors.newPassword?.message as string}
          />
          <VeteranInput
            label="Confirm new password"
            type="password"
            {...form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message as string}
          />
        </div>
        <div className="mt-4">
          <VeteranButton type="submit">Update password</VeteranButton>
        </div>
      </section>

      <section className="pt-8 border-t border-surface-200 dark:border-surface-700">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Delete Account</h3>
        <p className="text-sm text-surface-500 mb-4">
          Permanently delete your account and all associated data.
        </p>
        <VeteranButton variant="danger">Delete account</VeteranButton>
      </section>
    </form>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Email Notifications</h3>
        <div className="space-y-3">
          {[
            { id: 'push', label: 'Push notifications', desc: 'Receive notifications for new commits to your repositories' },
            { id: 'pr', label: 'Pull request reviews', desc: 'Get notified when you are requested to review a pull request' },
            { id: 'issue', label: 'Issue assignments', desc: 'Receive notifications when you are assigned to an issue' },
            { id: 'mentions', label: 'Mentions', desc: 'Get notified when someone mentions you' },
          ].map((item) => (
            <label key={item.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--veteran-fg))]">{item.label}</p>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-surface-300 text-veteran-600 focus:ring-veteran-500" />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function AppearanceSettings() {
  const { theme, toggleTheme } = useAuthStore();
  const currentTheme = useAuthStore.getState ? 'dark' : 'light';

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Theme</h3>
        <div className="flex items-center gap-4">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {}}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                currentTheme === t
                  ? 'border-veteran-500 bg-veteran-50 dark:bg-veteran-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                <span className="text-xs">{t === 'dark' ? '🌙' : '☀️'}</span>
              </div>
              <span className="text-sm font-medium capitalize">{t}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ShortcutSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <div className="divide-y divide-surface-200 dark:divide-surface-700">
          {[
            { keys: '⌘K', action: 'Command palette' },
            { keys: '⌘B', action: 'Toggle sidebar' },
            { keys: '⌘⇧T', action: 'Toggle theme' },
            { keys: '⌘S', action: 'Save file' },
            { keys: '⌘I', action: 'New issue' },
            { keys: '⌘P', action: 'New pull request' },
            { keys: '⌘⇧F', action: 'Search repository' },
          ].map((shortcut) => (
            <div key={shortcut.action} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-[rgb(var(--veteran-fg))]">{shortcut.action}</span>
              <kbd className="px-2 py-1 text-xs font-mono rounded bg-surface-100 dark:bg-surface-800 text-surface-500">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecuritySettingsSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Two-Factor Authentication</h3>
        <p className="text-sm text-surface-500 mb-3">Add an extra layer of security to your account.</p>
        <VeteranButton variant="secondary">Enable 2FA</VeteranButton>
      </section>

      <section className="card p-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--veteran-fg))] mb-4">Sessions</h3>
        <p className="text-sm text-surface-500 mb-3">Manage your active sessions.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-surface-200 dark:border-surface-700">
            <div>
              <p className="text-sm text-[rgb(var(--veteran-fg))]">Chrome on macOS</p>
              <p className="text-xs text-surface-400">Active now</p>
            </div>
            <VeteranBadge variant="success" dot>Current</VeteranBadge>
          </div>
        </div>
      </section>
    </div>
  );
}
