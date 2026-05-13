import { api } from '../client';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  name?: string;
};

export type AuthResponse = {
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    avatar_url: string | null;
    created_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
};

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),

  logout: () => api.post<void>('/auth/logout'),

  refresh: (refreshToken: string) =>
    api.post<{ session: AuthResponse['session'] }>('/auth/refresh', {
      refresh_token: refreshToken,
    }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    }),

  verifyEmail: (token: string) =>
    api.post<{ message: string }>('/auth/verify-email', { token }),

  resendVerification: (email: string) =>
    api.post<{ message: string }>('/auth/resend-verification', { email }),

  getMe: () => api.get<{ user: AuthResponse['user'] }>('/auth/me'),

  updateProfile: (data: Partial<AuthResponse['user']>) =>
    api.patch<{ user: AuthResponse['user'] }>('/auth/profile', data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ message: string }>('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
};
