import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let globalSocket: Socket | null = null;

function getSocket(): Socket | null {
  return globalSocket;
}

export function useRealtime() {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;

    const socket = io(SOCKET_URL, {
      auth: { token: session.access_token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;
    globalSocket = socket;

    socket.on('connect', () => {
      console.log('[Realtime] Connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Realtime] Disconnected:', reason);
    });

    socket.on('notification', () => {
      useNotificationStore.getState().incrementUnread();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('issue:created', () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    });

    socket.on('issue:updated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['issue', data.owner, data.repo, data.number] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    });

    socket.on('pr:created', () => {
      queryClient.invalidateQueries({ queryKey: ['pulls'] });
    });

    socket.on('pr:updated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['pull', data.owner, data.repo, data.number] });
      queryClient.invalidateQueries({ queryKey: ['pulls'] });
    });

    socket.on('pr:merged', (data) => {
      queryClient.invalidateQueries({ queryKey: ['pull', data.owner, data.repo, data.number] });
      queryClient.invalidateQueries({ queryKey: ['pulls'] });
    });

    socket.on('comment:created', (data) => {
      queryClient.invalidateQueries({ queryKey: ['issue-comments', data.owner, data.repo, data.issueNumber] });
      queryClient.invalidateQueries({ queryKey: ['pull-comments', data.owner, data.repo, data.pullNumber] });
    });

    socket.on('repo:updated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['repo', data.owner, data.name] });
    });

    socket.on('repo:starred', (data) => {
      queryClient.invalidateQueries({ queryKey: ['repo', data.owner, data.name] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      globalSocket = null;
    };
  }, [session?.access_token, queryClient]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    emit,
    isConnected: socketRef.current?.connected ?? false,
  };
}

export { getSocket };
