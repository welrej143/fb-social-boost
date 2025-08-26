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
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    return data;
  };

  const onApprove = async (data: any) => {
    console.log("onApprove", data);
    try {
      const orderData = await captureOrder(data.orderId);
      console.log("Capture result", orderData);
      
      // Check if payment was successful
      if (orderData.status === 'COMPLETED') {
        // Process wallet deposit
        const response = await fetch('/api/wallet/deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            paypalOrderId: data.orderId
          })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          onSuccess?.(result);
        } else {
          onError?.(result.error || 'Failed to process deposit');
        }
      } else {
        onError?.('Payment was not completed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onError?.('An error occurred while processing payment');
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
          script.src = "https://www.paypal.com/web-sdk/v6/core"; // Use production SDK
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
      const clientToken: string = await fetch("/paypal/setup")
        .then((res) => res.json())
        .then((data) => {
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
