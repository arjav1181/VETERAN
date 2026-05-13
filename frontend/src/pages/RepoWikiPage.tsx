import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Edit3, Clock, History } from 'lucide-react';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { formatRelativeTime } from '@/lib/utils';

const MOCK_CONTENT = `# Architecture Overview

## System Architecture

The VETERAN platform follows a microservices architecture with the following components:

### Frontend
- React-based SPA with TypeScript
- TailwindCSS for styling
- Monaco Editor for code editing
- TipTap for rich text editing

### Backend
- Node.js with Express
- PostgreSQL for primary data
- Redis for caching
- RabbitMQ for message queuing

### Infrastructure
- Docker containers
- Kubernetes orchestration
- AWS cloud services
- CDN for static assets

## Data Flow

\`\`\`
Client -> Load Balancer -> API Gateway -> Services -> Database
\`\`\`

## Security

All traffic is encrypted using TLS 1.3. Authentication is handled via JWT tokens with refresh token rotation.
`;

export function RepoWikiPage() {
  const { owner, name, slug } = useParams<{ owner: string; name: string; slug: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/${owner}/${name}/wiki`)}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to wiki
        </button>

        <div className="border border-border rounded-lg bg-primary-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-accent" />
              <h1 className="text-lg font-semibold text-text-primary capitalize">{(slug || 'home').replace(/-/g, ' ')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
                <Edit3 size={14} /> Edit
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface/80 transition-colors">
                <History size={14} /> History
              </button>
            </div>
          </div>
          <div className="p-6">
            <MarkdownRenderer content={MOCK_CONTENT} />
          </div>
          <div className="px-4 py-2 bg-surface border-t border-border text-xs text-text-muted flex items-center gap-1">
            <Clock size={12} /> Last edited {formatRelativeTime(new Date(Date.now() - 432000000).toISOString())} by jane-dev
          </div>
        </div>
      </div>
    </div>
  );
}
