'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/auth';

function AuthPageContent() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect if already authenticated
    if (!loading && user) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.replace(redirectTo);
    }
  }, [user, loading, router, searchParams]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
      </div>
    );
  }

  // Don't render form if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return <AuthForm mode={mode} onModeChange={setMode} />;
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}






