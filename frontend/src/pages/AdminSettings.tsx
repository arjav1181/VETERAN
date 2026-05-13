import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Loader2, ArrowLeft } from 'lucide-react';

export function AdminSettings() {
  const navigate = useNavigate();
  const [siteName, setSiteName] = useState('VETERAN');
  const [siteDescription, setSiteDescription] = useState('The veteran-owned Git platform');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [maxRepoSize, setMaxRepoSize] = useState('100');
  const [saving, setSaving] = useState(false);

  const handleSave = () => { setSaving(true); setTimeout(() => setSaving(false), 1000); };

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
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
