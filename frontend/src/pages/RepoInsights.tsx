import { useParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { ContribGraph } from '@/components/insights/ContribGraph';
import { ContribGlobe } from '@/components/insights/ContribGlobe';
import { InsightCharts } from '@/components/insights/InsightCharts';

const MOCK_CONTRIBUTIONS = Array.from({ length: 364 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (363 - i));
  const count = Math.random() > 0.5 ? Math.floor(Math.random() * 20) : 0;
  return {
    date: d.toISOString().split('T')[0],
    count,
    level: (count === 0 ? 0 : count <= 3 ? 1 : count <= 7 ? 2 : count <= 15 ? 3 : 4) as any,
  };
});

export function RepoInsights() {
  const { owner, name } = useParams<{ owner: string; name: string }>();

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={24} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary">Insights</h1>
        </div>

        <div className="space-y-6">
          <ContribGraph contributions={MOCK_CONTRIBUTIONS} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContribGlobe />
            <InsightCharts />
          </div>
        </div>
      </div>
    </div>
  );
}
