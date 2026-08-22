import { X, Circle } from "lucide-react";
import WorkflowTimeline from "./WorkflowTimeline";

type Props = {
  open: boolean;
  onClose: () => void;
  payment: any;
  workflow: any;
};

export default function WorkflowModal({
  open,
  onClose,
  payment,
  workflow,
}: Props) {
  if (!open || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{payment.customer_name}</h2>
            <p className="text-slate-500">{payment.email}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X />
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Amount</p>
            <p className="text-xl font-bold">₹{payment.amount}</p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Priority</p>
            <p className="text-xl font-bold">{payment.priority}</p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Current State</p>

            <div className="mt-1 flex items-center gap-2">
              <Circle className="h-3 w-3 fill-indigo-500 text-indigo-500" />

              <span className="font-medium">
                {workflow?.current_state ?? payment.workflow_state}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-slate-50 p-5">
          <h3 className="mb-3 text-lg font-semibold">AI Diagnosis</h3>

          {payment.root_cause ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-slate-700">Root Cause</p>
                <p className="text-slate-600">{payment.root_cause}</p>
              </div>

              <div>
                <p className="font-medium text-slate-700">Behavior</p>
                <p className="text-slate-600">{payment.customer_behavior}</p>
              </div>

              <div>
                <p className="font-medium text-slate-700">Recommended Action</p>
                <p className="text-slate-600">
                  {payment.recommended_strategy}
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-700">Confidence</p>
                <p className="text-slate-600">
                  {Math.round(payment.confidence * 100)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Diagnosis not generated yet.</p>
          )}
        </div>

        <WorkflowTimeline events={workflow?.timeline ?? []} />
      </div>
    </div>
  );
}