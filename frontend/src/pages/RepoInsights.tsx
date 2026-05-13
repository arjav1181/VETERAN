import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { ContribGraph } from '@/components/insights/ContribGraph';
import { ContribGlobe } from '@/components/insights/ContribGlobe';
import { InsightCharts } from '@/components/insights/InsightCharts';
import { api } from '@lib/api/client';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';

export function RepoInsights() {
  const p = useParams<{ owner: string; name?: string; repo?: string }>(); const owner = p.owner || ""; const name = p.name || p.repo || "";

  const { data: contribData, isLoading, error } = useQuery({
    queryKey: ['insights', owner, name],
    queryFn: () => api.get<any>(`/repos/${owner}/${name}/insights/contributions`),
    enabled: !!owner && !!name,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={24} className="text-accent" />
            <div className="h-7 w-32 bg-surface rounded animate-pulse" />
          </div>
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Insights</h1>
        </div>

        {error ? (
          <VeteranEmptyState icon="alert" title="Insights unavailable" description="The insights feature is not available or there was an error loading data." />
        ) : (
          <div className="space-y-6">
            <ContribGraph contributions={(contribData as any)?.weeks || []} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ContribGlobe />
              <InsightCharts />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
