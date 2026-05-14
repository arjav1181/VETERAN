import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranInput } from '@ui/VeteranInput';
import { VeteranAvatar } from '@ui/VeteranAvatar';
import { VeteranBadge } from '@ui/VeteranBadge';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@lib/api/endpoints/auth';
import { api } from '@lib/api/client';
import toast from 'react-hot-toast';
import {
  User,
  Bell,
  Shield,
  Key,
  Palette,
  Command,
  Save,
  Upload,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Fingerprint,
  LogOut,
  Clock,
  FileKey,
  HardDrive,
  Package,
  Mail,
  CreditCard,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  Download,
  QrCode,
  RefreshCw,
  Trash2,
  Plus,
  Settings,
  Terminal,
  AppWindow,
  ToggleLeft,
  Sun,
  Moon,
  UserCog,
  ScrollText,
} from 'lucide-react';

type Section = 
  | 'profile' | 'account' | 'appearance' | 'notifications'
  | 'applications' | 'developer' | 'password' | '2fa'
  | 'sessions' | 'security-log' | 'ssh-keys' | 'repositories'
  | 'codespaces' | 'packages' | 'emails' | 'billing';

const sidebarSections: { id: Section; label: string; icon: any; group: string }[] = [
  { id: 'profile', label: 'Profile', icon: User, group: 'Public profile' },
  { id: 'account', label: 'Account', icon: UserCog, group: 'Account settings' },
  { id: 'appearance', label: 'Appearance', icon: Palette, group: 'Account settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Account settings' },
  { id: 'applications', label: 'Applications', icon: AppWindow, group: 'Integrations' },
  { id: 'developer', label: 'Developer settings', icon: Terminal, group: 'Integrations' },
  { id: 'password', label: 'Password', icon: Key, group: 'Security' },
  { id: '2fa', label: 'Two-factor auth', icon: Shield, group: 'Security' },
  { id: 'sessions', label: 'Sessions', icon: Monitor, group: 'Security' },
  { id: 'security-log', label: 'Security log', icon: ScrollText, group: 'Security' },
  { id: 'ssh-keys', label: 'SSH/GPG keys', icon: FileKey, group: 'Security' },
  { id: 'repositories', label: 'Repositories', icon: HardDrive, group: 'Code, planning and automation' },
  { id: 'codespaces', label: 'Codespaces', icon: Monitor, group: 'Code, planning and automation' },
  { id: 'packages', label: 'Packages', icon: Package, group: 'Code, planning and automation' },
  { id: 'emails', label: 'Emails', icon: Mail, group: 'Emails' },
  { id: 'billing', label: 'Billing', icon: CreditCard, group: 'Billing' },
];

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bio: z.string().max(160, 'Bio must be at most 160 characters').optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
  pronouns: z.string().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export function UserSettings() {
  const [activeSection, setActiveSection] = useState<Section>('profile');

  const sectionGroups = useMemo(() => {
    const groups: { group: string; items: typeof sidebarSections }[] = [];
    const seen = new Set<string>();
    sidebarSections.forEach((s) => {
      if (!seen.has(s.group)) { seen.add(s.group); groups.push({ group: s.group, items: sidebarSections.filter((x) => x.group === s.group) }); }
    });
    return groups;
  }, []);

  return (
    <div className="flex gap-8 max-w-6xl mx-auto">
      <nav className="hidden lg:block w-56 shrink-0">
        <div className="space-y-6 sticky top-8">
          {sectionGroups.map((g) => (
            <div key={g.group}>
              <h4 className="text-2xs font-semibold text-[var(--text-disabled)] uppercase tracking-wider mb-2 px-3">{g.group}</h4>
              <div className="space-y-0.5">
                {g.items.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all text-left ${
                        isActive
                          ? 'bg-[var(--surface-3)] text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {sidebarSections.find((s) => s.id === activeSection)?.label || 'Settings'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeSection === 'profile' && <ProfileSettings />}
            {activeSection === 'account' && <AccountSettings />}
            {activeSection === 'appearance' && <AppearanceSettings />}
            {activeSection === 'notifications' && <NotificationSettings />}
            {activeSection === 'applications' && <ApplicationsSettings />}
            {activeSection === 'developer' && <DeveloperSettings />}
            {activeSection === 'password' && <PasswordSettings />}
            {activeSection === '2fa' && <TwoFactorSettings />}
            {activeSection === 'sessions' && <SessionsSettings />}
            {activeSection === 'security-log' && <SecurityLogSettings />}
            {activeSection === 'ssh-keys' && <SSHKeySettings />}
            {activeSection === 'repositories' && <RepositorySettings />}
            {activeSection === 'codespaces' && <CodespaceSettings />}
            {activeSection === 'packages' && <PackageSettings />}
            {activeSection === 'emails' && <EmailSettings />}
            {activeSection === 'billing' && <BillingSettings />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex lg:hidden flex-wrap gap-2 border-t border-[var(--border)] pt-6">
          {sidebarSections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                  isActive
                    ? 'bg-[var(--surface-3)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile-settings'],
    queryFn: () => authApi.getMe(),
  });

  const profileData = (userProfile as any)?.user || user;

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (res: any) => {
      toast.success('Profile updated successfully');
      if (res?.user) updateUser(res.user);
      queryClient.invalidateQueries({ queryKey: ['user-profile-settings'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: profileData?.name || profileData?.displayName || '',
      bio: profileData?.bio || '',
      company: profileData?.company || '',
      location: profileData?.location || '',
      website: profileData?.websiteUrl || profileData?.website || profileData?.blog || '',
      twitter: profileData?.twitter || profileData?.twitterUsername || '',
      pronouns: profileData?.pronouns || '',
    },
  });

  const bioLength = form.watch('bio')?.length ?? 0;

  return (
    <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-8 max-w-2xl">
      <section className="card p-6 space-y-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Profile picture</h3>
        <div className="flex items-center gap-4">
          <VeteranAvatar
            src={profileData?.avatarUrl || profileData?.avatar_url}
            name={profileData?.name || profileData?.displayName || profileData?.username || ''}
            size="xl"
            className="ring-2 ring-[var(--border)]"
          />
          <div>
            <VeteranButton variant="secondary" size="sm" icon={<Upload className="w-4 h-4" />}>
              Upload new picture
            </VeteranButton>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">PNG, JPG, or WebP. Max 2MB. Square recommended.</p>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Basic information</h3>
        <VeteranInput label="Name" {...form.register('name')} error={form.formState.errors.name?.message as string} />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Bio</label>
          <textarea
            {...form.register('bio')}
            rows={4}
            maxLength={160}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-disabled)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]/50 focus:border-[var(--accent-gold)] transition-colors"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[var(--text-secondary)]">Tell us about yourself.</span>
            <span className={`text-xs ${bioLength >= 160 ? 'text-[var(--danger)]' : 'text-[var(--text-disabled)]'}`}>{bioLength}/160</span>
          </div>
        </div>
        <VeteranInput label="Pronouns" placeholder="e.g. they/them, he/him, she/her" {...form.register('pronouns')} />
      </section>

      <section className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Links & social</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VeteranInput label="Company" placeholder="Acme Inc." {...form.register('company')} />
          <VeteranInput label="Location" placeholder="San Francisco, CA" {...form.register('location')} />
          <VeteranInput label="Website" placeholder="https://example.com" {...form.register('website')} />
          <VeteranInput label="Twitter" placeholder="@username" {...form.register('twitter')} />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <VeteranButton type="submit" loading={updateProfileMutation.isPending} icon={<Save className="w-4 h-4" />}>
          Save changes
        </VeteranButton>
      </div>
    </form>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-8 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Change username</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Changing your username will update all references across Veteran.</p>
        <VeteranInput placeholder="username" />
        <div className="mt-3"><VeteranButton variant="secondary" size="sm">Update username</VeteranButton></div>
      </section>

      <section className="card p-6 border-[var(--danger)]/30">
        <h3 className="text-sm font-semibold text-[var(--danger)] mb-1">Delete account</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Permanently delete your account and all associated data. This action is irreversible.</p>
        <VeteranButton variant="danger" icon={<Trash2 className="w-4 h-4" />}>Delete account</VeteranButton>
      </section>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('veteran-theme') as any) || 'dark';
  });

  const themes = [
    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes. Default Veteran experience.' },
    { id: 'light', label: 'Light', icon: Sun, desc: 'Bright and clean. Works well in sunlight.' },
    { id: 'system', label: 'System', icon: Monitor, desc: 'Follows your system preference automatically.' },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Theme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id as any); localStorage.setItem('veteran-theme', t.id); }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isActive
                    ? 'border-[var(--accent-gold)] bg-[var(--accent-gold-muted)]'
                    : 'border-[var(--border)] hover:border-[var(--text-disabled)] bg-[var(--surface-1)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                  isActive ? 'bg-[var(--accent-gold)]/20' : 'bg-[var(--surface-3)]'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]'}`} />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t.label}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Layout preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[var(--text-primary)]">Tab size</p><p className="text-xs text-[var(--text-secondary)]">Indent width in code blocks</p></div>
            <select className="bg-[var(--surface-2)] text-sm text-[var(--text-primary)] border border-[var(--border)] rounded-md px-3 py-1.5">
              <option>2</option><option>4</option><option>8</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[var(--text-primary)]">Default diff view</p><p className="text-xs text-[var(--text-secondary)]">How diffs appear by default</p></div>
            <select className="bg-[var(--surface-2)] text-sm text-[var(--text-primary)] border border-[var(--border)] rounded-md px-3 py-1.5">
              <option>Unified</option><option>Split</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

function NotificationSettings() {
  const categories = [
    {
      title: 'Email notifications',
      items: [
        { id: 'push', label: 'Push notifications', desc: 'New commits pushed to your repositories.' },
        { id: 'pr', label: 'Pull request reviews', desc: 'When you are requested to review a PR.' },
        { id: 'issue', label: 'Issue assignments', desc: 'When you are assigned to an issue.' },
        { id: 'mentions', label: 'Mentions', desc: 'When someone @mentions your username.' },
      ],
    },
    {
      title: 'System notifications',
      items: [
        { id: 'security', label: 'Security alerts', desc: 'Vulnerabilities detected in your repositories.' },
        { id: 'billing', label: 'Billing updates', desc: 'Invoices, payment failures, plan changes.' },
        { id: 'product', label: 'Product updates', desc: 'New features and important announcements.' },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {categories.map((cat) => (
        <section key={cat.title} className="card p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">{cat.title}</h3>
          <div className="space-y-0 divide-y divide-[var(--border)]">
            {cat.items.map((item) => (
              <label key={item.id} className="flex items-center justify-between py-3 cursor-pointer group">
                <div>
                  <p className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">{item.label}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
                </div>
                <div className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-[var(--surface-3)] data-[state=checked]:bg-[var(--accent-gold)]" role="switch" aria-checked="true" tabIndex={0}>
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform translate-x-1 data-[state=checked]:translate-x-[18px]" />
                </div>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PasswordSettings() {
  const form = useForm({ resolver: zodResolver(passwordSchema) });
  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.updatePassword(data.currentPassword, data.newPassword),
    onSuccess: () => { toast.success('Password updated successfully'); form.reset(); },
    onError: () => toast.error('Failed to update password'),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-8 max-w-lg">
      <section className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Change password</h3>
        <VeteranInput label="Current password" type="password" {...form.register('currentPassword')} error={form.formState.errors.currentPassword?.message as string} />
        <VeteranInput label="New password" type="password" {...form.register('newPassword')} error={form.formState.errors.newPassword?.message as string} />
        <VeteranInput label="Confirm new password" type="password" {...form.register('confirmPassword')} error={form.formState.errors.confirmPassword?.message as string} />
        <VeteranButton type="submit" loading={updatePasswordMutation.isPending} icon={<Key className="w-4 h-4" />}>Update password</VeteranButton>
      </section>
    </form>
  );
}

function TwoFactorSettings() {
  const [step, setStep] = useState<'setup' | 'verify' | 'done'>('setup');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [codesCopied, setCodesCopied] = useState(false);

  const handleSetup = () => {
    setRecoveryCodes(['VETA-XXXXX-XXXXX', 'VETA-YYYYY-YYYYY', 'VETA-ZZZZZ-ZZZZZ', 'VETA-AAAAA-AAAAA', 'VETA-BBBBB-BBBBB', 'VETA-CCCCC-CCCCC', 'VETA-DDDDD-DDDDD', 'VETA-EEEEE-EEEEE']);
    setStep('verify');
  };

  const handleCopyCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCodesCopied(true);
    setTimeout(() => setCodesCopied(false), 2000);
    toast.success('Recovery codes copied');
  };

  if (false) {
    return (
      <section className="card p-6 max-w-lg">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Two-factor authentication</h3>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[var(--success)]" />
          <VeteranBadge variant="success" dot>Enabled</VeteranBadge>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Your account is protected by two-factor authentication.</p>
        <div className="space-y-2 mb-4">
          <p className="text-xs text-[var(--text-secondary)]">Recovery codes remaining: <strong className="text-[var(--text-primary)]">5</strong></p>
        </div>
        <div className="flex gap-2">
          <VeteranButton variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>Regenerate codes</VeteranButton>
          <VeteranButton variant="danger" size="sm">Disable 2FA</VeteranButton>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8 max-w-lg">
      {step === 'setup' && (
        <section className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Set up two-factor authentication</h3>
          <p className="text-sm text-[var(--text-secondary)]">Protect your account with TOTP two-factor authentication.</p>
          <div className="flex justify-center py-6">
            <div className="w-48 h-48 bg-[var(--surface-2)] rounded-xl flex items-center justify-center border-2 border-dashed border-[var(--border)]">
              <QrCode className="w-16 h-16 text-[var(--text-disabled)]" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">Or enter this key manually:</p>
            <code className="block text-xs font-mono bg-[var(--surface-2)] px-3 py-2 rounded-md text-[var(--text-primary)] select-all">VETA2FA-ABCD-EFGH-IJKL-MNOP</code>
          </div>
          <VeteranButton onClick={handleSetup} icon={<QrCode className="w-4 h-4" />}>Next: Verify code</VeteranButton>
        </section>
      )}

      {step === 'verify' && (
        <section className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Verify code</h3>
          <p className="text-sm text-[var(--text-secondary)]">Enter the 6-digit code from your authenticator app.</p>
          <VeteranInput placeholder="000000" maxLength={6} className="text-center text-lg tracking-[0.5em] font-mono" />
          <VeteranButton onClick={() => setStep('done')}>Verify & enable</VeteranButton>
        </section>
      )}

      {step === 'done' && (
        <section className="card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[var(--success)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Save recovery codes</h3>
          </div>
          <div className="bg-[var(--surface-2)] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="text-[var(--text-primary)]">{code}</div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[var(--warning)] flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Save these codes somewhere safe. You will need them to access your account if you lose your authenticator device.
          </p>
          <div className="flex gap-2">
            <VeteranButton onClick={handleCopyCodes} variant="secondary" size="sm" icon={codesCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
              {codesCopied ? 'Copied!' : 'Copy codes'}
            </VeteranButton>
            <VeteranButton variant="secondary" size="sm" icon={<Download className="w-4 h-4" />}>Download</VeteranButton>
          </div>
        </section>
      )}
    </div>
  );
}

function SessionsSettings() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => api.get<any[]>('/user/sessions'),
  });
  const sessionList = (sessions ?? []) as any[];

  const killMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/user/sessions/${id}`),
    onSuccess: () => toast.success('Session revoked'),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Active sessions</h3>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 skeleton rounded" />)}</div>
        ) : sessionList.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">No active sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessionList.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{s.device || s.userAgent || 'Unknown device'}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {s.ip || s.ipAddress} · {s.createdAt ? relativeTime(s.createdAt) : 'just now'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.isCurrent && <VeteranBadge variant="success" dot size="sm">Current</VeteranBadge>}
                  {!s.isCurrent && (
                    <VeteranButton variant="ghost" size="sm" onClick={() => killMutation.mutate(s.id)}>
                      Revoke
                    </VeteranButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SecurityLogSettings() {
  const { data: logData, isLoading } = useQuery({
    queryKey: ['user-security-log'],
    queryFn: () => api.get<any[]>('/user/security-log', { params: { per_page: 20 } }),
  });
  const events = (logData ?? []) as any[];

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Security log</h3>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 skeleton rounded" />)}</div>
        ) : events.length === 0 ? (
          <VeteranEmptyState icon="inbox" title="No security events" description="Security events will appear here." />
        ) : (
          <div className="space-y-2">
            {events.map((e: any, i: number) => (
              <div key={e.id || i} className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <Shield className="w-4 h-4 text-[var(--text-disabled)] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">{e.action || e.type || 'Event'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{e.detail || e.description || ''} {e.ip ? `· ${e.ip}` : ''}</p>
                </div>
                <span className="text-xs text-[var(--text-disabled)] shrink-0">{relativeTime(e.createdAt || e.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SSHKeySettings() {
  const { data: keys, isLoading } = useQuery({
    queryKey: ['user-ssh-keys'],
    queryFn: () => api.get<any[]>('/user/keys'),
  });
  const sshKeys = (keys ?? []) as any[];

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">SSH keys</h3>
          <VeteranButton variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />}>New key</VeteranButton>
        </div>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 skeleton rounded" />)}</div>
        ) : sshKeys.length === 0 ? (
          <VeteranEmptyState icon="key" title="No SSH keys" description="Add an SSH key to access repositories via SSH." action={{ label: 'Add SSH key', onClick: () => {} }} />
        ) : (
          <div className="space-y-3">
            {sshKeys.map((k: any) => (
              <div key={k.id} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <FileKey className="w-4 h-4 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{k.title || k.label || 'Unnamed key'}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">{k.fingerprint || k.key?.substring(0, 40) || ''} · Added {relativeTime(k.createdAt)}</p>
                  </div>
                </div>
                <VeteranButton variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-[var(--danger)]" /></VeteranButton>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">GPG keys</h3>
        <VeteranEmptyState icon="key" title="No GPG keys" description="Add a GPG key to sign commits and tags." action={{ label: 'Add GPG key', onClick: () => {} }} />
      </section>
    </div>
  );
}

function RepositorySettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Default repository settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[var(--text-primary)]">Default branch name</p><p className="text-xs text-[var(--text-secondary)]">For new repositories.</p></div>
            <input defaultValue="main" className="bg-[var(--surface-2)] text-sm text-[var(--text-primary)] border border-[var(--border)] rounded-md px-3 py-1.5 w-32 text-center font-mono" />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[var(--text-primary)]">Default repository type</p><p className="text-xs text-[var(--text-secondary)]">Public or private by default.</p></div>
            <select className="bg-[var(--surface-2)] text-sm text-[var(--text-primary)] border border-[var(--border)] rounded-md px-3 py-1.5">
              <option>Public</option><option>Private</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

function CodespaceSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Codespace defaults</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-[var(--text-primary)]">Default machine type</p><p className="text-xs text-[var(--text-secondary)]">For new codespaces.</p></div>
            <select className="bg-[var(--surface-2)] text-sm text-[var(--text-primary)] border border-[var(--border)] rounded-md px-3 py-1.5">
              <option>2-core · 8GB RAM · 32GB</option>
              <option>4-core · 16GB RAM · 32GB</option>
              <option>8-core · 32GB RAM · 64GB</option>
            </select>
          </div>
          <div>
            <p className="text-sm text-[var(--text-primary)] mb-1.5">Dotfiles repository</p>
            <VeteranInput placeholder="username/dotfiles" />
            <p className="text-xs text-[var(--text-secondary)] mt-1">Personalize your codespace environment.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PackageSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Package registry settings</h3>
        <VeteranEmptyState icon="box" title="No package settings" description="Package registry settings and access tokens for package publishing." />
      </section>
    </div>
  );
}

function EmailSettings() {
  const { data: emails, isLoading } = useQuery({
    queryKey: ['user-emails'],
    queryFn: () => api.get<any[]>('/user/emails'),
  });
  const emailList = (emails ?? []) as any[];

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Email addresses</h3>
          <VeteranButton variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />}>Add email</VeteranButton>
        </div>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-14 skeleton rounded" />)}</div>
        ) : emailList.length === 0 ? (
          <VeteranEmptyState icon="mail" title="No email addresses" description="Add an email to receive notifications." />
        ) : (
          <div className="space-y-3">
            {emailList.map((e: any) => (
              <div key={e.id || e.email} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{e.email}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{e.isPrimary ? 'Primary' : 'Backup'} · {e.verified ? 'Verified' : 'Unverified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {e.isPrimary && <VeteranBadge variant="info" size="sm">Primary</VeteranBadge>}
                  {!e.verified && <VeteranBadge variant="warning" size="sm">Unverified</VeteranBadge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Email preferences</h3>
        <label className="flex items-center justify-between py-2">
          <div><p className="text-sm text-[var(--text-primary)]">Keep my email address private</p><p className="text-xs text-[var(--text-secondary)]">Don't expose my email in git commit attribution.</p></div>
          <input type="checkbox" defaultChecked className="rounded border-[var(--border)] text-[var(--accent-gold)] focus:ring-[var(--accent-gold)]" />
        </label>
        <label className="flex items-center justify-between py-2">
          <div><p className="text-sm text-[var(--text-primary)]">Block command line pushes that expose my email</p><p className="text-xs text-[var(--text-secondary)]">Prevent accidental email exposure in commits.</p></div>
          <input type="checkbox" defaultChecked className="rounded border-[var(--border)] text-[var(--accent-gold)] focus:ring-[var(--accent-gold)]" />
        </label>
      </section>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Current plan</h3>
        <div className="flex items-center justify-between p-4 bg-[var(--surface-2)] rounded-lg mb-4">
          <div>
            <p className="text-base font-semibold text-[var(--text-primary)]">Free</p>
            <p className="text-xs text-[var(--text-secondary)]">$0/month · Unlimited public repositories</p>
          </div>
          <VeteranBadge variant="veteran" size="md">Current</VeteranBadge>
        </div>
        <VeteranButton variant="primary">Upgrade to Pro</VeteranButton>
      </section>

      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-primary)]">Storage</span><span className="text-[var(--text-secondary)]">245 MB / 500 MB</span></div>
            <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden"><div className="h-full rounded-full bg-[var(--accent-gold)]" style={{ width: '49%' }} /></div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-[var(--text-primary)]">Bandwidth</span><span className="text-[var(--text-secondary)]">1.2 GB / 5 GB</span></div>
            <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden"><div className="h-full rounded-full bg-[var(--accent-blue)]" style={{ width: '24%' }} /></div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ApplicationsSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Authorized OAuth apps</h3>
        <VeteranEmptyState icon="code" title="No authorized apps" description="OAuth applications you authorize will appear here." />
      </section>
    </div>
  );
}

function DeveloperSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Personal access tokens</h3>
          <VeteranButton variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />}>Generate token</VeteranButton>
        </div>
        <VeteranEmptyState icon="key" title="No tokens" description="Generate a personal access token to authenticate API requests." />
      </section>
    </div>
  );
}
