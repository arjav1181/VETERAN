import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

const MOCK_PAGES = [
  { id: 'w1', title: 'Home', slug: 'home', updatedAt: new Date(Date.now() - 86400000).toISOString(), updatedBy: 'jane-dev' },
  { id: 'w2', title: 'Getting Started', slug: 'getting-started', updatedAt: new Date(Date.now() - 172800000).toISOString(), updatedBy: 'john-doe' },
  { id: 'w3', title: 'API Reference', slug: 'api-reference', updatedAt: new Date(Date.now() - 259200000).toISOString(), updatedBy: 'jane-dev' },
  { id: 'w4', title: 'Contributing Guide', slug: 'contributing', updatedAt: new Date(Date.now() - 345600000).toISOString(), updatedBy: 'alice' },
  { id: 'w5', title: 'Architecture Overview', slug: 'architecture', updatedAt: new Date(Date.now() - 432000000).toISOString(), updatedBy: 'bob' },
];

export function RepoWiki() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Wiki</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus size={16} /> New page
          </button>
        </div>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                placeholder="Search wiki..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {MOCK_PAGES.map(page => (
              <div
                key={page.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/${owner}/${name}/wiki/${page.slug}`)}
              >
                <BookOpen size={16} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-text-primary hover:text-accent transition-colors">{page.title}</span>
                </div>
                <div className="text-xs text-text-muted shrink-0">
                  <span>{formatRelativeTime(page.updatedAt)} by {page.updatedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
