// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  onSuccess?: (data: { newBalance: string; depositAmount: string }) => void;
  onError?: (error: string) => void;
}

export default function PayPalButton({
  amount,
  currency,
  intent,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const createOrder = async () => {
    console.log("[DEBUG] Creating PayPal order with payload:", { amount, currency, intent });
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    try {
      const response = await fetch("/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      console.log("[DEBUG] Create order response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] Create order failed:", errorText);
        throw new Error(`Failed to create order: ${response.status}`);
      }
      
      const output = await response.json();
      console.log("[DEBUG] Created order:", output);
      return { orderId: output.id };
    } catch (error) {
      console.error("[DEBUG] Error in createOrder:", error);
      throw error;
    }
  };

  const captureOrder = async (orderId: string) => {
    console.log("[DEBUG] Capturing PayPal order:", orderId);
    try {
      const response = await fetch(`/paypal/order/${orderId}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("[DEBUG] Capture response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] Capture failed:", errorText);
        throw new Error(`Failed to capture order: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[DEBUG] Capture result:", data);
      return data;
    } catch (error) {
      console.error("[DEBUG] Error in captureOrder:", error);
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    console.log("[DEBUG] PayPal onApprove triggered:", data);
    try {
      const orderData = await captureOrder(data.orderId);
      console.log("[DEBUG] Capture result:", orderData);
      
      // Check if payment was successful
      if (orderData.status === 'COMPLETED') {
        console.log("[DEBUG] Payment completed, processing wallet deposit...");
        // Process wallet deposit
        const depositPayload = {
          amount: amount,
          paypalOrderId: data.orderId
        };
        console.log("[DEBUG] Deposit payload:", depositPayload);
        
        const response = await fetch('/api/wallet/deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(depositPayload)
        });
        
        console.log("[DEBUG] Deposit response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[DEBUG] Deposit API failed:", errorText);
          onError?.(`Deposit failed: ${response.status}`);
          return;
        }
        
        const result = await response.json();
        console.log("[DEBUG] Deposit result:", result);
        
        if (result.success) {
          console.log("[DEBUG] Deposit successful, calling onSuccess");
          onSuccess?.(result);
        } else {
          console.error("[DEBUG] Deposit failed:", result.error);
          onError?.(result.error || 'Failed to process deposit');
        }
      } else {
        console.error("[DEBUG] Payment status not completed:", orderData.status);
        onError?.(`Payment was not completed. Status: ${orderData.status}`);
      }
    } catch (error) {
      console.error('[DEBUG] Payment processing error:', error);
      onError?.(`An error occurred while processing payment: ${error}`);
    }
  };

  const onCancel = async (data: any) => {
    console.log("onCancel", data);
  };

  const onPayPalError = async (data: any) => {
    console.log("onError", data);
    onError?.('PayPal payment failed');
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
      }
    };

    loadPayPalSDK();
  }, []);
  const initPayPal = async () => {
    try {
      console.log("[DEBUG] Fetching PayPal client token...");
      const clientToken: string = await fetch("/paypal/setup")
        .then((res) => {
          console.log("[DEBUG] Setup response status:", res.status);
          if (!res.ok) {
            throw new Error(`Setup failed: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("[DEBUG] Got client token:", data.clientToken ? "✓" : "✗");
          return data.clientToken;
        });
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout =
            sdkInstance.createPayPalOneTimePaymentSession({
              onApprove,
              onCancel,
              onError: onPayPalError,
            });

      const onClick = async () => {
        try {
          // Track the PayPal button click
          fetch('/api/paypal/track-click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              depositAmount: amount
            })
          }).catch(error => console.error('Error tracking click:', error));

          // Track Google Ads conversion
          if (typeof window.gtag_report_conversion === 'function') {
            window.gtag_report_conversion();
          }

          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
        }
      };

      const paypalButton = document.getElementById("paypal-button");

      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  return <paypal-button id="paypal-button"></paypal-button>;
}
// <END_EXACT_CODE>
