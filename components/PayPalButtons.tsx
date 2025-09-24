"use client";

import { useEffect } from "react";

interface PayPalProps {
  amount: number;
}

interface PayPalActions {
  order: {
    create: (order: { purchase_units: { amount: { value: string } }[] }) => Promise<string>;
    capture: () => Promise<void>;
  };
}

interface PayPalButtonsWindow extends Window {
  paypal?: {
    Buttons: (config: {
      createOrder: (_data: unknown, actions: PayPalActions) => Promise<string>;
      onApprove: (_data: unknown, actions: PayPalActions) => Promise<void>;
    }) => { render: (selector: string) => void };
  };
}

export default function PayPalButtons({ amount }: PayPalProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID";

    script.addEventListener("load", () => {
      const win = window as PayPalButtonsWindow;
      if (!win.paypal) return;

      win.paypal.Buttons({
        createOrder: (_data, actions) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: amount.toString() } }],
          });
        },
        onApprove: (_data, actions) => {
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