"use client";

import { useEffect } from "react";

interface PayPalProps {
  amount: number;
}

interface PayPalActions {
  order: {
    create: (data: any) => Promise<string>;
    capture: () => Promise<void>;
  };
}

export default function PayPalButtons({ amount }: PayPalProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID";

    script.addEventListener("load", () => {
      // PayPal SDK injected globally
      const win = window as typeof window & { paypal?: any };
      if (!win.paypal) return;

      const paypal = win.paypal;

      paypal.Buttons({
        createOrder: (_data: unknown, actions: { order: PayPalActions["order"] }) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount.toString() } }],
          });
        },
        onApprove: (_data: unknown, actions: { order: PayPalActions["order"] }) => {
          return actions.order.capture().then(() => {
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