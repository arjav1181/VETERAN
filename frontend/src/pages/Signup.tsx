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
import { GitFork, UserPlus } from 'lucide-react';

const signupSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(39, 'Username must be at most 39 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export function Signup() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register({
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password,
      });
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-veteran-500 to-brand-500 flex items-center justify-center">
              <GitFork className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl">VETERAN</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-[rgb(var(--veteran-fg))]">Create your account</h1>
          <p className="mt-2 text-sm text-surface-500">Join the veteran-owned Git platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <VeteranInput
            label="Username"
            placeholder="your-username"
            error={errors.username?.message}
            {...register('username')}
          />

          <VeteranInput
            label="Full Name"
            placeholder="Your full name"
            error={errors.name?.message}
            {...register('name')}
          />

          <VeteranInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <VeteranInput
            label="Password"
            type="password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register('password')}
          />

          <VeteranInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <VeteranButton
            type="submit"
            fullWidth
            size="lg"
            loading={isLoading}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Create account
          </VeteranButton>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link to="/login" className="text-veteran-600 dark:text-veteran-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
