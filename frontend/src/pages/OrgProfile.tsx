import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Globe, MapPin, Users, GitFork, Shield, Mail } from 'lucide-react';
import { orgApi } from '@lib/api/endpoints/orgs';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function OrgProfile() {
  const { org } = useParams<{ org: string }>();

  const { data: organization, isLoading, error } = useQuery({
    queryKey: ['org', org],
    queryFn: () => orgApi.get(org!),
    enabled: !!org,
  });

  const { data: repos } = useQuery({
    queryKey: ['org-repos', org],
    queryFn: () => orgApi.listRepos(org!),
    enabled: !!org,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-xl bg-surface animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-surface rounded animate-pulse w-64" />
              <div className="h-5 bg-surface rounded animate-pulse w-48" />
              <div className="h-4 bg-surface rounded animate-pulse w-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <VeteranEmptyState icon="alert" title="Organization not found" description="The requested organization could not be found." />
        </div>
      </div>
    );
  }

  const orgData = organization as any;

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30">
            {orgData.avatarUrl || orgData.avatar_url ? (
              <img src={orgData.avatarUrl || orgData.avatar_url} alt="" className="w-24 h-24 rounded-xl" />
            ) : (
              <Building2 size={40} className="text-accent" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{orgData.displayName || orgData.name || org}</h1>
            <p className="text-lg text-text-muted">@{orgData.slug || orgData.name || org}</p>
            {(orgData.description) && (
              <p className="text-sm text-text-secondary mt-2 max-w-xl">{orgData.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted flex-wrap">
              {(orgData.location) && (
                <span className="flex items-center gap-1.5"><MapPin size={14} />{orgData.location}</span>
              )}
              {(orgData.websiteUrl || orgData.website) && (
                <a href={orgData.websiteUrl || orgData.website} className="flex items-center gap-1.5 text-info hover:underline"><Globe size={14} />{orgData.websiteUrl || orgData.website}</a>
              )}
              {(orgData.email) && (
                <span className="flex items-center gap-1.5"><Mail size={14} />{orgData.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Users size={16} /> <span className="font-medium text-text-primary">{orgData.memberCount || orgData.public_members || 0}</span> members
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <GitFork size={16} /> <span className="font-medium text-text-primary">{orgData.repoCount || orgData.repos_count || 0}</span> repositories
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Shield size={16} /> <span className="font-medium text-text-primary">{orgData.teamCount || 0}</span> teams
          </div>
        </div>

        <h3 className="text-sm font-semibold text-text-primary mb-4">Repositories</h3>
        {!repos || repos.length === 0 ? (
          <VeteranEmptyState icon="folder" title="No repositories" description="This organization has no public repositories yet." />
        ) : (
          <div className="space-y-2">
            {(repos as any[]).map((repo: any) => (
              <div key={repo.id} className="border border-border rounded-lg px-4 py-3 hover:bg-surface/20 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <GitFork size={14} className="text-text-muted" />
                  <span className="text-sm font-medium text-info hover:text-info/80">{repo.full_name || repo.fullName || `${org}/${repo.name}`}</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{repo.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
