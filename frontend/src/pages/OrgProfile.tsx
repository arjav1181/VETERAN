import { useParams } from 'react-router-dom';
import { Building2, Globe, MapPin, Users, GitFork, Shield, Mail } from 'lucide-react';

const MOCK_ORG = {
  name: 'veteran-corp',
  displayName: 'VETERAN Corporation',
  description: 'Building the next-generation Git platform for mission-critical code. We believe in secure, reliable, and performant development tools.',
  location: 'San Francisco, CA',
  website: 'https://veteran.dev',
  email: 'contact@veteran.dev',
  memberCount: 24,
  repoCount: 47,
  teamCount: 6,
  avatarUrl: null,
};

export function OrgProfile() {
  const { org } = useParams<{ org: string }>();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30">
            <Building2 size={40} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{MOCK_ORG.displayName}</h1>
            <p className="text-lg text-text-muted">@{MOCK_ORG.name}</p>
            <p className="text-sm text-text-secondary mt-2 max-w-xl">{MOCK_ORG.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted flex-wrap">
              {MOCK_ORG.location && (
                <span className="flex items-center gap-1.5"><MapPin size={14} />{MOCK_ORG.location}</span>
              )}
              {MOCK_ORG.website && (
                <a href={MOCK_ORG.website} className="flex items-center gap-1.5 text-info hover:underline"><Globe size={14} />{MOCK_ORG.website}</a>
              )}
              {MOCK_ORG.email && (
                <span className="flex items-center gap-1.5"><Mail size={14} />{MOCK_ORG.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Users size={16} /> <span className="font-medium text-text-primary">{MOCK_ORG.memberCount}</span> members
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <GitFork size={16} /> <span className="font-medium text-text-primary">{MOCK_ORG.repoCount}</span> repositories
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Shield size={16} /> <span className="font-medium text-text-primary">{MOCK_ORG.teamCount}</span> teams
          </div>
        </div>

        <h3 className="text-sm font-semibold text-text-primary mb-4">Repositories</h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <GitFork size={14} className="text-text-muted" />
                <span className="text-sm font-medium text-info hover:text-info/80">{MOCK_ORG.name}/project-{i + 1}</span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">Description for project {i + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
