'use client';

import { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return <AuthForm mode={mode} onModeChange={setMode} />;
}






