import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueApi, type CreateIssueRequest, type UpdateIssueRequest } from '@lib/api/endpoints/issues';
import { getApiError } from '@lib/api/client';
import toast from 'react-hot-toast';

export function useIssues(
  owner: string,
  name: string,
  params?: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
    milestone?: number;
    assignee?: string;
  }
) {
  return useQuery({
    queryKey: ['issues', owner, name, params],
    queryFn: () => issueApi.list(owner, name, params),
    enabled: !!owner && !!name,
    staleTime: 15_000,
  });
}

export function useIssue(owner: string, name: string, issueNumber: number) {
  return useQuery({
    queryKey: ['issue', owner, name, issueNumber],
    queryFn: () => issueApi.get(owner, name, issueNumber),
    enabled: !!owner && !!name && !!issueNumber,
    staleTime: 15_000,
  });
}

export function useCreateIssue(owner: string, name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssueRequest) => issueApi.create(owner, name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', owner, name] });
      toast.success('Issue created');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useUpdateIssue(owner: string, name: string, issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIssueRequest) => issueApi.update(owner, name, issueNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', owner, name, issueNumber] });
      queryClient.invalidateQueries({ queryKey: ['issues', owner, name] });
      toast.success('Issue updated');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useIssueComments(owner: string, name: string, issueNumber: number) {
  return useQuery({
    queryKey: ['issue-comments', owner, name, issueNumber],
    queryFn: () => issueApi.listComments(owner, name, issueNumber),
    enabled: !!owner && !!name && !!issueNumber,
  });
}

export function useCreateComment(owner: string, name: string, issueNumber: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => issueApi.createComment(owner, name, issueNumber, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue-comments', owner, name, issueNumber] });
      toast.success('Comment added');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useIssueLabels(owner: string, name: string) {
  return useQuery({
    queryKey: ['labels', owner, name],
    queryFn: () => issueApi.listLabels(owner, name),
    enabled: !!owner && !!name,
  });
}

export function useIssueMilestones(owner: string, name: string, state?: 'open' | 'closed' | 'all') {
  return useQuery({
    queryKey: ['milestones', owner, name, state],
    queryFn: () => issueApi.listMilestones(owner, name, state),
    enabled: !!owner && !!name,
  });
}
