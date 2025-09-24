// paypal-create-order/index.ts (Supabase Edge Function)
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
    // Authenticate supabase user from header
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split('Bearer ')[1];
    const { data: userData } = await supabase.auth.getUser(token);
    const userId = userData?.user?.id;
    if (!userId) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });

    const body = await req.json();
    const amount = body.amount || "5.00";
    // create paypal token
    const tokenPay = await getPayPalToken();
    // create order
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPay}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: amount } }]
      })
    });
    const orderData = await orderRes.json();
    // Save pending payment
    await supabase.from('payments').insert({
      user_id: userId,
      provider: 'paypal',
      provider_payment_id: orderData.id,
      amount: amount,
      currency: 'USD',
      status: 'CREATED',
      data: orderData
    });

    return new Response(JSON.stringify({ orderID: orderData.id }), { headers: { 'Content-Type': 'application/json' }});
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
