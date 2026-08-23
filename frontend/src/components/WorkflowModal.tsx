import { useEffect, useState } from "react";
import { X, Circle, CheckCircle2, Sparkles, Send } from "lucide-react";
import WorkflowTimeline from "./WorkflowTimeline";
import API from "../services/api";
import { getWorkflow } from "../services/workflow";

type Props = {
  open: boolean;
  onClose: () => void;
  payment: any;
  workflow: any;
  onRecoveryComplete: (recordId: string) => void;
};

export default function WorkflowModal({
  open,
  onClose,
  payment,
  workflow,
  onRecoveryComplete,
}: Props) {
  const [sending, setSending] = useState(false);
  const [localPayment, setLocalPayment] = useState(payment);
  const [localWorkflow, setLocalWorkflow] = useState(workflow);

  useEffect(() => {
    setLocalPayment(payment);
  }, [payment]);

  useEffect(() => {
    setLocalWorkflow(workflow);
  }, [workflow]);

  const isClosed = localWorkflow?.current_state === "closed";

  useEffect(() => {
    if (!open || !isClosed || !payment?.record_id) return;

    const timer = setTimeout(() => {
      onRecoveryComplete(payment.record_id);
    }, 1800);

    return () => clearTimeout(timer);
  }, [open, isClosed, payment?.record_id, onRecoveryComplete]);

  if (!open || !payment) return null;

  async function startRecovery() {
    setSending(true);

    try {
      await API.post("/recovery/send", {
        record_id: payment.record_id,
      });

      const cases = await API.get("/recovery/cases");
      const updatedPayment = cases.data.find(
        (c: any) => c.record_id === payment.record_id
      );
      if (updatedPayment) setLocalPayment(updatedPayment);

      const updated = await getWorkflow(payment.record_id);
      setLocalWorkflow(updated);

      window.dispatchEvent(new Event("data-updated"));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to send recovery email.");
    }

    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {payment.customer_name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{payment.email}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 pr-4">
          {/* Recovery Success */}
          {isClosed && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 h-8 w-8 text-green-600" />

                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Recovery Completed
                  </h3>

                  <p className="mt-1 text-sm text-green-700">
                    Revenue has been successfully recovered through Razorpay.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-green-700">Recovered</p>
                      <p className="font-semibold">
                        ₹{Number(payment.amount).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-green-700">Method</p>
                      <p className="font-semibold">Razorpay</p>
                    </div>

                    <div>
                      <p className="text-xs text-green-700">Status</p>
                      <p className="font-semibold">Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Amount
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                ₹{Number(payment.amount).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Priority
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {localPayment.priority}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current State
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Circle className="h-3 w-3 fill-indigo-500 text-indigo-500" />
                <span className="font-medium capitalize text-slate-900">
                  {(localWorkflow?.current_state ?? "risk_assessed").replace(
                    /_/g,
                    " ",
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Start Recovery CTA */}
          {localWorkflow?.current_state === "diagnosis_generated" &&
            localPayment.root_cause && (
              <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Ready to start recovery
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      The AI agent has generated a personalized recovery
                      strategy. Send the Razorpay payment email to the customer.
                    </p>
                  </div>

                  <button
                    onClick={startRecovery}
                    disabled={sending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    <Send size={18} />
                    {sending ? "Sending..." : "Start Recovery"}
                  </button>
                </div>
              </div>
            )}

          {/* AI Decision */}
          {localPayment.selected_playbook && (
            <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2">
                  <Sparkles className="h-5 w-5 text-indigo-700" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recovery Strategy
                  </h3>

                  <p className="text-sm text-slate-600">
                    The AI Recovery Agent selected the best approach for this
                    customer before generating a personalized recovery email.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Approach
                  </p>

                  <p className="mt-2 font-semibold capitalize text-slate-900">
                    {localPayment.selected_playbook.replace(/_/g, " ")}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Tone
                  </p>

                  <p className="mt-2 font-semibold capitalize text-slate-900">
                    {localPayment.playbook_tone}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white p-4">
                <div className="mb-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Why the AI chose this
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-700">
                  {localPayment.playbook_reasoning}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Diagnosis Confidence
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {Math.round(localPayment.confidence * 100)}%
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      localPayment.priority === "High"
                        ? "bg-rose-100 text-rose-700"
                        : localPayment.priority === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {localPayment.priority} Priority
                  </span>
                </div>
            </div>
          )}

          {/* AI Diagnosis */}
          <div className="mb-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              AI Diagnosis
            </h3>

            {localPayment.root_cause ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-700">Root Cause</p>
                  <p className="mt-1 text-slate-600">{localPayment.root_cause}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    Customer Behavior
                  </p>
                  <p className="mt-1 text-slate-600">
                    {localPayment.customer_behavior}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    Recommended Action
                  </p>
                  <p className="mt-1 text-slate-600">
                    {localPayment.recommended_strategy}
                  </p>
                </div>

              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Diagnosis has not been generated yet.
              </div>
            )}
          </div>

          {/* Timeline */}
          <WorkflowTimeline events={localWorkflow?.timeline ?? []} />
        </div>
      </div>
    </div>
  );
}
