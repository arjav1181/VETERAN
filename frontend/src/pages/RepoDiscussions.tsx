import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { cn, formatRelativeTime, formatCount } from '@/lib/utils';
import { useState } from 'react';

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'General', emoji: '💬', color: '#58A6FF' },
  { id: 'cat-2', name: 'Ideas', emoji: '💡', color: '#D29922' },
  { id: 'cat-3', name: 'Show and tell', emoji: '🎉', color: '#3FB950' },
  { id: 'cat-4', name: 'Q&A', emoji: '❓', color: '#F85149' },
];

const MOCK_DISCUSSIONS = Array.from({ length: 10 }).map((_, i) => ({
  id: `disc-${i}`,
  title: [
    'What are your thoughts on the new API design?',
    'Feature request: dark mode toggle',
    'Showcasing our new dashboard',
    'How to set up local development?',
    'Performance improvements discussion',
    'Roadmap for Q2 2026',
    'Best practices for CI/CD',
    'Community guidelines update',
    'Integration with third-party tools',
    'Bug report: login timeout issue',
  ][i],
  category: MOCK_CATEGORIES[i % 4],
  author: ['jane-dev', 'john-doe', 'alice', 'bob'][i % 4],
  commentCount: Math.floor(Math.random() * 20 + 1),
  voteCount: Math.floor(Math.random() * 30 + 5),
  isPinned: i === 0,
  isAnswered: i === 3,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

export function RepoDiscussions() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('');

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Discussions</h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            <Plus size={16} /> New discussion
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {MOCK_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap',
                activeCategory === cat.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:text-text-primary hover:bg-surface/80'
              )}
            >
              <span>{cat.emoji}</span> {cat.name}
            </button>
          ))}
        </div>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden divide-y divide-border/50">
          {MOCK_DISCUSSIONS.map(disc => (
            <div
              key={disc.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer"
              onClick={() => navigate(`/${owner}/${name}/discussions/${disc.id}`)}
            >
              <div className="flex flex-col items-center gap-1 min-w-[40px]">
                <span className="text-sm font-medium text-text-secondary">{disc.voteCount}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {disc.isPinned && <span className="text-xs text-accent">📌</span>}
                  {disc.isAnswered && <span className="text-xs text-success">✅</span>}
                  <span className="text-sm font-medium text-text-primary truncate">{disc.title}</span>
                  <span className="text-xs">{disc.category.emoji}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                  <span>{disc.author}</span>
                  <span>{formatRelativeTime(disc.createdAt)}</span>
                  <span>{disc.commentCount} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
