import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Terminal, Plus } from 'lucide-react';
import { CodespaceList } from '@/components/codespaces/CodespaceList';
import { codespaceApi } from '@lib/api/endpoints/codespaces';
import { VeteranSkeleton } from '@ui/VeteranSkeleton';
import { VeteranEmptyState } from '@ui/VeteranEmptyState';
import toast from 'react-hot-toast';

export function CodespacesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: codespaces, isLoading, error } = useQuery({
    queryKey: ['codespaces'],
    queryFn: () => codespaceApi.list(),
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => codespaceApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codespaces'] });
      toast.success('Codespace starting...');
    },
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => codespaceApi.stop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codespaces'] });
      toast.success('Codespace stopped');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => codespaceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codespaces'] });
      toast.success('Codespace deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Terminal size={24} className="text-accent" />
            <div className="h-7 w-40 bg-surface rounded animate-pulse" />
          </div>
          <VeteranSkeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <VeteranEmptyState icon="alert" title="Failed to load codespaces" description="There was an error loading your codespaces." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Terminal size={24} className="text-accent" />
            <h1 className="text-xl font-bold text-text-primary">Codespaces</h1>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-primary-dark rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} /> New codespace
          </button>
        </div>

        {!codespaces || codespaces.length === 0 ? (
          <VeteranEmptyState
            icon="code"
            title="No codespaces"
            description="Create a codespace to start coding in the cloud"
            action={{ label: 'Create codespace', onClick: () => setShowCreate(true) }}
          />
        ) : (
          <CodespaceList
            codespaces={codespaces}
            onStart={(id) => startMutation.mutate(id)}
            onStop={(id) => stopMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
            onOpen={(id) => window.open(`https://cs-${id}.veteran.dev`, '_blank')}
            onCreate={() => setShowCreate(true)}
          />
        )}
      </div>
    </div>
  );
}
