import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Checkout() {
  const [status, setStatus] = useState("Preparing secure payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function startCheckout() {
      try {
        const params = new URLSearchParams(window.location.search);

        const orderId = params.get("order_id");
        const recordId = params.get("record_id");

        if (!orderId || !recordId) {
          throw new Error("Missing payment information.");
        }

        // Fetch checkout configuration from backend
        const res = await fetch(
          `${BACKEND_URL}/payment/checkout-config?record_id=${recordId}`
        );

        const config = await res.json();

        if (!res.ok) {
          throw new Error(config.detail || "Unable to prepare payment.");
        }

        // Load Razorpay SDK
        await loadRazorpayScript();

        const razorpay = new window.Razorpay({
          key: config.key_id,
          amount: config.amount,
          currency: "INR",
          name: "Revenue Recovery OS",
          description: "Payment Recovery",
          order_id: config.order_id,

          prefill: {
            name: config.customer_name,
            email: config.email,
          },

          theme: {
            color: "#4F46E5",
          },

          handler: async function (response: any) {
            try {
              setStatus("Confirming payment...");

              const confirm = await fetch(
                `${BACKEND_URL}/payment/verify-payment`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    record_id: recordId,
                  }),
                }
              );

              const result = await confirm.json();

              if (!confirm.ok) {
                throw new Error(
                  result.detail || "Payment confirmation failed."
                );
              }

              setStatus("Payment recovered successfully.");
            } catch (err: any) {
              setError(err.message || "Payment confirmation failed.");
            }
          },

          modal: {
            ondismiss() {
              setStatus("Payment cancelled.");
            },
          },
        });

        razorpay.open();
      } catch (err: any) {
        setError(err.message || "Unable to prepare payment.");
      }
    }

    startCheckout();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-indigo-100 p-4">
            {status.includes("successfully") ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <ShieldCheck className="h-10 w-10 text-indigo-600" />
            )}
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold">
          Revenue Recovery OS
        </h1>

        <p className="mt-3 text-center text-slate-600">
          Secure Razorpay Test Checkout
        </p>

        <div className="mt-8 rounded-xl bg-slate-50 p-4 text-center">
          {error ? (
            <p className="font-medium text-red-600">{error}</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {!status.includes("successfully") && (
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              )}

              <p className="font-medium text-slate-700">{status}</p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          This uses Razorpay Test Mode for demonstration purposes.
        </p>
      </div>
    </div>
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK."));
    document.body.appendChild(script);
  });
}