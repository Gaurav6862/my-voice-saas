// paypal-capture-order/index.ts
import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PAYPAL_CLIENT = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET")!;
const PAYPAL_ENV = Deno.env.get("PAYPAL_ENV") ?? "sandbox";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const PAYPAL_BASE = PAYPAL_ENV === 'live' ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getPayPalToken(){
  const auth = btoa(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`);
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type':'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const j = await res.json();
  return j.access_token;
}

serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split('Bearer ')[1];
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });

    const { orderID } = await req.json();
    const tokenPay = await getPayPalToken();

    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenPay}`, 'Content-Type':'application/json'}
    });
    const captureData = await captureRes.json();

    // Update payment record
    await supabase.from('payments').update({
      status: captureData.status || 'COMPLETED',
      data: captureData
    }).eq('provider_payment_id', orderID);

    // Give credits: Example: $1 => 100 credits (you decide)
    const purchaseAmount = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0";
    const creditsToAdd = Math.round(Number(purchaseAmount) * 100); // example conversion

    // increment credits
    const { error } = await supabase.rpc('increment_credits', { user_uuid: userId, amount: creditsToAdd });
    if (error) {
      console.error(error);
    } else {
      // log usage? or payment already stored
    }

    return new Response(JSON.stringify({ success: true, creditsAdded: creditsToAdd }), { headers: { 'Content-Type': 'application/json' }});
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
