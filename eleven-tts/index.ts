// eleven-tts/index.ts
import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVEN_KEY = Deno.env.get("ELEVENLABS_API_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split('Bearer ')[1];
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });

    const { text, voice = "alloy" } = await req.json();
    if (!text) return new Response(JSON.stringify({ error: 'No text' }), { status: 400 });

    // Check credits: e.g., each TTS costs 10 credits (you decide)
    const { data: creditRow } = await supabase.from('credits').select('balance').eq('user_id', userId).single();
    const cost = Math.max(1, Math.ceil(text.length / 100)); // example pricing
    if (!creditRow || creditRow.balance < cost) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), { status: 402 });
    }

    // Call ElevenLabs TTS
    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVEN_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    const audioBuffer = await elevenRes.arrayBuffer();

    // Upload to Supabase Storage
    const fileName = `tts/${userId}/${Date.now()}.mp3`;
    const uploadRes = await supabase.storage.from('tts').upload(fileName, new Uint8Array(audioBuffer), { contentType: 'audio/mpeg' });

    if (uploadRes.error) throw uploadRes.error;

    // Decrement credits + create usage log
    await supabase.from('credits').update({ balance: supabase.raw('credits.balance - ?', [cost]), updated_at: new Date() }).eq('user_id', userId);
    await supabase.from('usage_logs').insert({
      user_id: userId,
      feature: 'tts',
      amount: cost,
      meta: { text_length: text.length, file: fileName }
    });

    // create signed url
    const { data: urlData } = await supabase.storage.from('tts').createSignedUrl(fileName, 60 * 60); // 1 hour
    return new Response(JSON.stringify({ url: urlData.signedUrl }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
