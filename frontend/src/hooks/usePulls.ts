import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pullApi, type CreatePullRequest, type UpdatePullRequest } from '@lib/api/endpoints/pulls';
import { getApiError } from '@lib/api/client';
import toast from 'react-hot-toast';

export function usePulls(
  owner: string,
  name: string,
  params?: {
    state?: 'open' | 'closed' | 'all';
    head?: string;
    base?: string;
    sort?: 'created' | 'updated' | 'popularity' | 'long-running';
    direction?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }
) {
  return useQuery({
    queryKey: ['pulls', owner, name, params],
    queryFn: () => pullApi.list(owner, name, params),
    enabled: !!owner && !!name,
    staleTime: 15_000,
  });
}

export function usePull(owner: string, name: string, pullNumber: number) {
  return useQuery({
    queryKey: ['pull', owner, name, pullNumber],
    queryFn: () => pullApi.get(owner, name, pullNumber),
    enabled: !!owner && !!name && !!pullNumber,
    staleTime: 15_000,
  });
}

export function useCreatePull(owner: string, name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePullRequest) => pullApi.create(owner, name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulls', owner, name] });
      toast.success('Pull request created');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useUpdatePull(owner: string, name: string, pullNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePullRequest) => pullApi.update(owner, name, pullNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pull', owner, name, pullNumber] });
      queryClient.invalidateQueries({ queryKey: ['pulls', owner, name] });
      toast.success('Pull request updated');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useMergePull(owner: string, name: string, pullNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: { merge_method?: 'merge' | 'squash' | 'rebase'; commit_title?: string; commit_message?: string }) =>
      pullApi.merge(owner, name, pullNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pull', owner, name, pullNumber] });
      queryClient.invalidateQueries({ queryKey: ['pulls', owner, name] });
      toast.success('Pull request merged');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function usePullCommits(owner: string, name: string, pullNumber: number) {
  return useQuery({
    queryKey: ['pull-commits', owner, name, pullNumber],
    queryFn: () => pullApi.listCommits(owner, name, pullNumber),
    enabled: !!owner && !!name && !!pullNumber,
  });
}

export function usePullFiles(owner: string, name: string, pullNumber: number) {
  return useQuery({
    queryKey: ['pull-files', owner, name, pullNumber],
    queryFn: () => pullApi.listFiles(owner, name, pullNumber),
    enabled: !!owner && !!name && !!pullNumber,
  });
}

export function usePullReviews(owner: string, name: string, pullNumber: number) {
  return useQuery({
    queryKey: ['pull-reviews', owner, name, pullNumber],
    queryFn: () => pullApi.listReviews(owner, name, pullNumber),
    enabled: !!owner && !!name && !!pullNumber,
  });
}

export function usePullComments(owner: string, name: string, pullNumber: number) {
  return useQuery({
    queryKey: ['pull-comments', owner, name, pullNumber],
    queryFn: () => pullApi.listComments(owner, name, pullNumber),
    enabled: !!owner && !!name && !!pullNumber,
  });
}
