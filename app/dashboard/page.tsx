'use client'
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardPage(){
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(()=>{
    async function fetchData(){
      const s = await supabase.auth.getSession();
      const user = s.data.session?.user;
      if(!user) { /* redirect to login if needed */ return; }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: c } = await supabase.from('credits').select('balance').eq('user_id', user.id).single();
      setCredits(c?.balance ?? 0);
    }
    fetchData();
  },[]);

  async function generate(){
    const session = (await supabase.auth.getSession()).data.session;
    const token = session?.access_token;
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/eleven-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
      body: JSON.stringify({ text })
    });
    const j = await res.json();
    if (res.status !== 200) return alert(j.error || 'Error');
    setAudioUrl(j.url);
    // refresh credits
    const { data } = await supabase.from('credits').select('balance').eq('user_id', session!.user!.id).single();
    setCredits(data?.balance ?? 0);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Welcome, {profile?.full_name}</h2>
      <p>Credits: {credits}</p>
      <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full h-40 p-2 border rounded" />
      <div className="mt-2 flex gap-2">
        <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded">Generate</button>
      </div>
      {audioUrl && <div className="mt-4">
        <audio controls src={audioUrl}></audio>
      </div>}
    </div>
  )
}
