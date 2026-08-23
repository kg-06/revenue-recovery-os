import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

import AppShell from "../layout/AppShell";
import { getRecoveredCases } from "../services/recovery";
import { getWorkflow } from "../services/workflow";
import WorkflowModal from "../components/WorkflowModal";

export default function RecoveredCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getRecoveredCases().then(setCases).catch(() => {});
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

  const totalRecovered = cases.reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Recovered Cases
          </h1>
          <p className="mt-2 text-slate-500">
            Completed recoveries with AI decisions and payment audit trail.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Recovered</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              ₹{totalRecovered.toLocaleString()}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Recovered Payments</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {cases.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Status</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              All Recovered
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold">Recovery Audit Trail</h2>
            <p className="mt-1 text-sm text-slate-500">
              Every successful recovery remains visible for verification.
            </p>
          </div>

          {cases.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No recovered payments yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="border-b border-slate-200">
                  <tr className="text-left text-sm font-semibold text-slate-500">
                    <th className="w-[25%] px-6 py-4">Customer</th>
                    <th className="w-[12%] px-3 py-4">Amount</th>
                    <th className="w-[18%] px-3 py-4">AI Playbook</th>
                    <th className="w-[20%] px-3 py-4">Payment ID</th>
                    <th className="w-[15%] px-3 py-4">Recovered</th>
                    <th className="w-[10%] px-6 py-4 text-right">Workflow</th>
                  </tr>
                </thead>

                <tbody>
                  {cases.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                            {c.customer_name.charAt(0)}
                          </div>

                          <div>
                            <p className="font-medium">{c.customer_name}</p>
                            <p className="text-xs text-slate-500">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-5 font-semibold">
                        ₹{Number(c.amount).toLocaleString()}
                      </td>

                      <td className="px-3 py-5">
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 capitalize">
                          {(c.selected_playbook || "N/A").replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="px-3 py-5 text-xs text-slate-500">
                        <span className="block truncate">
                          {c.razorpay_payment_id || "-"}
                        </span>
                      </td>

                      <td className="px-3 py-5 text-sm text-slate-600">
                        {c.recovered_at
                          ? new Date(c.recovered_at).toLocaleString("en-IN")
                          : "-"}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => openWorkflow(c)}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <WorkflowModal
          open={open}
          onClose={() => setOpen(false)}
          payment={selectedPayment}
          workflow={workflow}
          onRecoveryComplete={() => {}}
        />
      </div>
    </AppShell>
  );
}