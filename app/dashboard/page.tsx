'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/auth');
      } else {
        setUser(data.session.user);
      }
    });
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <p>You can now generate voice content, manage credits, and see payments.</p>
    </div>
  );
}
