'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // ✅ Redirect user to dashboard after email confirmation
        emailRedirectTo: 'https://my-voice-saas-allset.vercel.app/dashboard',
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
      alert(error.message);
    } else {
      alert('Signup successful! Check your email to confirm.');
    }
  };

  return (
    <div className="auth-container">
      <h1>Login / Signup</h1>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Magic Link</button>
      </form>
    </div>
  );
}
