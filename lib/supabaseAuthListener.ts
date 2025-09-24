// call this early in client (e.g., _app or a useEffect in layout's client component)
import { supabase } from './supabaseClient';

export function initAuthListener(){
  supabase.auth.onAuthStateChange(async (event, session) => {
    const user = session?.user;
    if(!user) return;
    // create profile if not exists
    const { data } = await supabase.from('profiles').select('id').eq('id', user.id).limit(1);
    if (!data || data.length===0){
      await supabase.from('profiles').insert({ id: user.id, full_name: user.email });
      // also create credits row
      await supabase.from('credits').insert({ user_id: user.id, balance: 0 });
    }
  });
}
