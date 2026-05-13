import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Loader2, Building2 } from 'lucide-react';

export function OrgSettings() {
  const { org } = useParams<{ org: string }>();
  const [name, setName] = useState('VETERAN Corporation');
  const [description, setDescription] = useState('Building the next-generation Git platform.');
  const [location, setLocation] = useState('San Francisco, CA');
  const [website, setWebsite] = useState('https://veteran.dev');
  const [email, setEmail] = useState('contact@veteran.dev');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Building2 size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Building2 settings</h1>
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
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-accent text-primary-dark rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
