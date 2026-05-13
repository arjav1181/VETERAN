import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repoApi, type Repo, type CreateRepoRequest, type UpdateRepoRequest } from '@lib/api/endpoints/repos';
import { getApiError } from '@lib/api/client';
import toast from 'react-hot-toast';

export function useRepos(params?: { page?: number; per_page?: number; sort?: string; type?: string }) {
  return useQuery({
    queryKey: ['repos', params],
    queryFn: () => repoApi.list(params),
    staleTime: 30_000,
  });
}

export function useRepo(owner: string, name: string) {
  return useQuery({
    queryKey: ['repo', owner, name],
    queryFn: () => repoApi.get(owner, name),
    enabled: !!owner && !!name,
    staleTime: 30_000,
  });
}

export function useCreateRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRepoRequest) => repoApi.create(data),
    onSuccess: (repo) => {
      queryClient.invalidateQueries({ queryKey: ['repos'] });
      toast.success(`Repository "${repo.name}" created`);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useForkRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ owner, name, organization }: { owner: string; name: string; organization?: string }) =>
      repoApi.fork(owner, name, organization),
    onSuccess: (repo) => {
      queryClient.invalidateQueries({ queryKey: ['repos'] });
      toast.success(`Forked to "${repo.full_name}"`);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useUpdateRepo(owner: string, name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRepoRequest) => repoApi.update(owner, name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repo', owner, name] });
      toast.success('Repository updated');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ owner, name }: { owner: string; name: string }) => repoApi.delete(owner, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repos'] });
      toast.success('Repository deleted');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useStarRepo(owner: string, name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repoApi.star(owner, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repo', owner, name] });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useUnstarRepo(owner: string, name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repoApi.unstar(owner, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repo', owner, name] });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useRepoBranches(owner: string, name: string) {
  return useQuery({
    queryKey: ['branches', owner, name],
    queryFn: () => repoApi.getBranches(owner, name),
    enabled: !!owner && !!name,
  });
}

export function useRepoContents(owner: string, name: string, path: string, ref?: string) {
  return useQuery({
    queryKey: ['contents', owner, name, path, ref],
    queryFn: () => repoApi.getContents(owner, name, path, ref),
    enabled: !!owner && !!name,
  });
}

export function useRepoCommits(owner: string, name: string, params?: { sha?: string; path?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['commits', owner, name, params],
    queryFn: () => repoApi.getCommits(owner, name, params),
    enabled: !!owner && !!name,
  });
}

export function useRepoReadme(owner: string, name: string, ref?: string) {
  return useQuery({
    queryKey: ['readme', owner, name, ref],
    queryFn: () => repoApi.getReadme(owner, name, ref),
    enabled: !!owner && !!name,
  });
}

export function useRepoLanguages(owner: string, name: string) {
  return useQuery({
    queryKey: ['languages', owner, name],
    queryFn: () => repoApi.getLanguages(owner, name),
    enabled: !!owner && !!name,
  });
}

export function useRepoContributors(owner: string, name: string) {
  return useQuery({
    queryKey: ['contributors', owner, name],
    queryFn: () => repoApi.getContributors(owner, name),
    enabled: !!owner && !!name,
  });
}

export function useStarred(owner: string, name: string) {
  return useQuery({
    queryKey: ['starred', owner, name],
    queryFn: () => repoApi.checkStar(owner, name),
    enabled: !!owner && !!name,
  });
}
