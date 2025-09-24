"use client";

import { useEffect } from "react";

interface PayPalProps {
  amount: number;
}

export default function PayPalButtons({ amount }: PayPalProps) {
  useEffect(() => {
    // Load PayPal script
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID";

    script.addEventListener("load", () => {
      // @ts-expect-error PayPal SDK injected globally
      const paypal = (window as unknown as { paypal: any }).paypal;

      paypal.Buttons({
        createOrder: (_data: unknown, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount.toString() } }],
          });
        },
        onApprove: (_data: unknown, actions: any) => {
          return actions.order.capture().then((_details: unknown) => {
            alert("Payment completed!");
          });
        },
      }).render("#paypal-buttons");
    });

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [amount]);

  return <div id="paypal-buttons"></div>;
}
