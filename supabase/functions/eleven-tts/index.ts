import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for server-side
);

export async function tryConsumeCredits(userId: string, amount: number) {
  // Call your pre-defined SQL function in Supabase
  const { data, error } = await supabase.rpc("try_consume_credits", {
    user_uuid: userId,
    amount: amount,
  });

  if (error) throw error;
  return data as boolean;
}

export async function generateVoice(text: string) {
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

  if (!response.ok) throw new Error("TTS generation failed");
  const audioBuffer = await response.arrayBuffer();
  return Buffer.from(audioBuffer);
}
