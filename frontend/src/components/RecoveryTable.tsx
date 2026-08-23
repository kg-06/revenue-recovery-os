import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

import { getWorkflow } from "../services/workflow";
import { getRecoveryCases } from "../services/recovery";
import WorkflowModal from "./WorkflowModal";

export default function RecoveryTable() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [open, setOpen] = useState(false);

  async function loadCases() {
    try {
      const data = await getRecoveryCases();
      setCases(data);
    } catch {}
  }

  useEffect(() => {
    loadCases();
  }, []);

  async function openWorkflow(payment: any) {
    setSelectedPayment(payment);

    try {
      const data = await getWorkflow(payment.record_id);
      setWorkflow(data);
    } catch {
      setWorkflow(null);
    }

    setOpen(true);
  }

 function handleRecoveryComplete(recordId: string) {
  setCases((prev) => prev.filter((c) => c.record_id !== recordId));
  setOpen(false);

  // Notify the dashboard to refresh KPIs
  window.dispatchEvent(new Event("recovery-updated"));
}

  return (
    <>
      {cases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Recovery Queue Empty
          </h3>
          <p className="mt-2 text-slate-500">
            All current revenue recovery cases have been completed.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="border-b border-slate-200">
              <tr className="text-left text-sm font-semibold text-slate-500">
                <th className="w-[24%] px-6 py-4">Customer</th>
                <th className="w-[10%] px-3 py-4">Amount</th>
                <th className="w-[11%] px-3 py-4">Priority</th>
                <th className="w-[7%] px-3 py-4">Risk</th>
                <th className="w-[33%] px-3 py-4">AI Diagnosis</th>
                <th className="w-[15%] px-6 py-4 text-right">Workflow</th>
              </tr>
            </thead>

            <tbody>
              {cases.map((c) => (
                <tr
                  key={c._id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {c.customer_name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {c.customer_name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-5 font-medium text-slate-900">
                    ₹{Number(c.amount).toLocaleString()}
                  </td>

                  <td className="px-3 py-5">
                    <Badge
                      className={
                        c.priority === "High"
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                          : c.priority === "Medium"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                      }
                    >
                      {c.priority}
                    </Badge>
                  </td>

                  <td className="px-3 py-5 font-medium text-slate-700">
                    {c.risk_score}
                  </td>

                  <td className="px-3 py-5">
                    {c.root_cause ? (
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">
                          {c.root_cause}
                        </p>

                        <p className="line-clamp-2 text-sm text-slate-500">
                          {c.recommended_strategy}
                        </p>

                        <p className="text-xs text-slate-400">
                          Confidence: {Math.round(c.confidence * 100)}%
                        </p>
                      </div>
                    ) : (
                      <span className="italic text-slate-400">
                        Not generated
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => openWorkflow(c)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WorkflowModal
        open={open}
        onClose={() => setOpen(false)}
        payment={selectedPayment}
        workflow={workflow}
        onRecoveryComplete={handleRecoveryComplete}
      />
    </>
  );
}