// eleven-tts/index.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function generateVoice(text: string) {
  // Node.js / Next.js 18+ me fetch global hai
  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/YOUR_VOICE_ID",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({ text }),
    }
  );

  if (!response.ok) {
    throw new Error("TTS generation failed");
  }

  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer);
}