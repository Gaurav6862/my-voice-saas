'use client'
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSignUp(e: any){
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message); else {
      alert('Signup successful — check email for confirmation');
      // you can redirect or prompt login.
    }
  }

  async function handleSignIn(e: any){
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Login / Signup</h3>
      <form className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <button onClick={handleSignIn} className="px-4 py-2 bg-green-600 text-white rounded">Login</button>
          <button onClick={handleSignUp} className="px-4 py-2 bg-blue-600 text-white rounded">Signup</button>
        </div>
      </form>
    </div>
  )
}
