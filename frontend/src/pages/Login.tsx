import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VeteranButton } from '@ui/VeteranButton';
import { VeteranInput } from '@ui/VeteranInput';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@lib/api/endpoints/auth';
import { getApiError } from '@lib/api/client';
import { GitFork, LogIn } from 'lucide-react';

const loginSchema = z.object({
  login: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);
      setAuth(response);
      navigate('/dashboard');
    } catch (err) {
      const apiError = getApiError(err);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-veteran-500 to-brand-500 flex items-center justify-center">
              <GitFork className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl">VETERAN</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[rgb(var(--veteran-fg))]">Welcome back</h1>
          <p className="mt-2 text-sm text-surface-500">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <VeteranInput
            type="text"
            placeholder="username or email"
            label="Username or Email"
            error={errors.login?.message}
            {...register('login')}
          />

          <div>
            <VeteranInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-veteran-600 dark:text-veteran-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <VeteranButton
            type="submit"
            fullWidth
            size="lg"
            loading={isLoading}
            icon={<LogIn className="w-4 h-4" />}
          >
            Sign in
          </VeteranButton>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-veteran-600 dark:text-veteran-400 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
