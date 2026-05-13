import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { VeteranButton } from '@ui/VeteranButton';
import { authApi } from '@lib/api/endpoints/auth';
import { getApiError } from '@lib/api/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        const apiError = getApiError(err);
        setStatus('error');
        setMessage(apiError.message);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-veteran-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-[rgb(var(--veteran-fg))]">Verifying your email...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[rgb(var(--veteran-fg))]">{message}</h1>
            <p className="text-sm text-surface-500 mt-2">Redirecting you to sign in...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[rgb(var(--veteran-fg))]">Verification failed</h1>
            <p className="text-sm text-surface-500 mt-2">{message}</p>
            <VeteranButton className="mt-4" onClick={() => navigate('/login')}>
              Back to sign in
            </VeteranButton>
          </>
        )}
      </div>
    </div>
  );
}
