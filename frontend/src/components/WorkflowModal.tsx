import { useEffect } from "react";
import { X, Circle, CheckCircle2, Sparkles } from "lucide-react";
import WorkflowTimeline from "./WorkflowTimeline";

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
  if (!open || !payment) return null;

  const isClosed = workflow?.current_state === "closed";

  useEffect(() => {
    if (isClosed && payment?.record_id) {
      const timer = setTimeout(() => {
        onRecoveryComplete(payment.record_id);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [isClosed, payment, onRecoveryComplete]);

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
                {payment.priority}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current State
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Circle className="h-3 w-3 fill-indigo-500 text-indigo-500" />
                <span className="font-medium capitalize text-slate-900">
                  {(workflow?.current_state ??
                    payment.workflow_state ??
                    "at_risk"
                  ).replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          {/* AI Decision Card */}
          {payment.selected_playbook && (
            <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2">
                  <Sparkles className="h-5 w-5 text-indigo-700" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    AI Decision
                  </h3>

                  <p className="text-sm text-slate-600">
                    The Recovery Agent selected the best intervention before
                    generating the email.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selected Playbook
                  </p>

                  <p className="mt-2 font-semibold capitalize text-slate-900">
                    {payment.selected_playbook.replace(/_/g, " ")}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Tone
                  </p>

                  <p className="mt-2 font-semibold capitalize text-slate-900">
                    {payment.playbook_tone}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    AI Reasoning
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      payment.playbook_urgency === "high"
                        ? "bg-rose-100 text-rose-700"
                        : payment.playbook_urgency === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {payment.playbook_urgency} urgency
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-slate-700">
                  {payment.playbook_reasoning}
                </p>
              </div>
            </div>
          )}

          {/* AI Diagnosis */}
          <div className="mb-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              AI Diagnosis
            </h3>

            {payment.root_cause ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-700">Root Cause</p>
                  <p className="mt-1 text-slate-600">{payment.root_cause}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    Customer Behavior
                  </p>
                  <p className="mt-1 text-slate-600">
                    {payment.customer_behavior}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-700">
                    Recommended Action
                  </p>
                  <p className="mt-1 text-slate-600">
                    {payment.recommended_strategy}
                  </p>
                </div>

                <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Confidence: {Math.round(payment.confidence * 100)}%
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                Diagnosis has not been generated yet.
              </div>
            )}
          </div>

          {/* Timeline */}
          <WorkflowTimeline events={workflow?.timeline ?? []} />
        </div>
      </div>
    </div>
  );
}