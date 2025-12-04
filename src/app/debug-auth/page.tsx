'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignUp = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      setResult({ data, error });
    } catch (err) {
      setResult({ error: err });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      setResult({ data, error });
    } catch (err) {
      setResult({ error: err });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      setResult({ data, error });
    } catch (err) {
      setResult({ error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Debug</h1>
        
        <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--card-border)] mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Connection</h2>
          <button
            onClick={testConnection}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Test Database Connection
          </button>
        </div>

        <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--card-border)] mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Authentication</h2>
          
          <div className="space-y-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500"
            />
          </div>
          
          <div className="space-x-4">
            <button
              onClick={testSignUp}
              disabled={loading || !email || !password}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Test Sign Up
            </button>
            <button
              onClick={testSignIn}
              disabled={loading || !email || !password}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Test Sign In
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--card-border)]">
            <h2 className="text-xl font-semibold text-white mb-4">Result</h2>
            <pre className="text-sm text-gray-300 bg-[var(--background)] p-4 rounded-lg overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
