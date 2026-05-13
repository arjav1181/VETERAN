import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@lib/api/endpoints/notifications';
import { useNotificationStore } from '@stores/notificationStore';
import { getApiError } from '@lib/api/client';
import toast from 'react-hot-toast';

export function useNotifications(params?: {
  all?: boolean;
  participating?: boolean;
  page?: number;
  per_page?: number;
  since?: string;
  before?: string;
}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationApi.list(params),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: async () => {
      const data = await notificationApi.getUnreadCount();
      useNotificationStore.getState().setUnreadCount(data.unread);
      return data;
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      toast.error(apiError.message);
    },
  });
}
