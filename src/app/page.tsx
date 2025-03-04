'use client';
import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      const result = await signIn('credentials', {
        password: password,
        redirect: false
      });
  
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
        toast.success('Logged in successfully');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-blue-600">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password"
              className="w-full rounded-md border border-blue-300 p-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}