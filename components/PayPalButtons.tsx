"use client";

import { useEffect } from "react";

interface PayPalProps {
  amount: number;
}

export default function PayPalButtons({ amount }: PayPalProps) {
  useEffect(() => {
    // @ts-expect-error
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID";
    script.addEventListener("load", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paypal: any = (window as any).paypal;
      paypal.Buttons({
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount.toString() } }],
          });
        },
        onApprove: (_data: any, actions: any) => {
          return actions.order.capture().then((_details: any) => {
            alert("Payment completed!");
          });
        },
      }).render("#paypal-buttons");
    });
    document.body.appendChild(script);
  }, [amount]);

  return <div id="paypal-buttons"></div>;
}
