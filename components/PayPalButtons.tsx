'use client'
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PayPalButtons({ amount = '5.00' }){
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    const addScript = async () => {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID; // set in env
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      s.async = true;
      document.body.appendChild(s);
      s.onload = () => {
        // @ts-ignore
        window.paypal.Buttons({
          createOrder: async () => {
            // call supabase function to create an order
            const session = (await supabase.auth.getSession()).data.session;
            const token = session?.access_token;
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/paypal-create-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ amount })
            });
            const j = await res.json();
            return j.orderID;
          },
          onApprove: async (data: any) => {
            const session = (await supabase.auth.getSession()).data.session;
            const token = session?.access_token;
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/paypal-capture-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ orderID: data.orderID })
            });
            const r = await res.json();
            alert('Payment completed. Credits added: '+ r.creditsAdded);
          }
        }).render(ref.current);
      }
    }
    addScript();
  },[]);

  return <div ref={ref}></div>;
}
