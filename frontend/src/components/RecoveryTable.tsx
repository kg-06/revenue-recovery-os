import { useEffect, useState } from "react";
import { getWorkflow } from "../services/workflow";
import WorkflowModal from "./WorkflowModal";
import { getRecoveryCases } from "../services/recovery";

export default function RecoveryTable() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [workflow, setWorkflow] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getRecoveryCases()
      .then(setCases)
      .catch(() => {});
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

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-5 text-xl font-semibold">Recovery Queue</h2>

      <div className="overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-3">Customer</th>
              <th>Amount</th>
              <th>Priority</th>
              <th>Risk</th>
              <th>AI Diagnosis</th>
              <th>Workflow</th>
            </tr>
          </thead>

          <tbody>
            {cases.map((c, i) => (
              <tr key={c._id} className="border-t align-top">
                <td className="py-3">{c.customer_name}</td>

                <td>₹{c.amount}</td>

                <td>{c.priority}</td>

                <td>{c.risk_score}</td>

                <td className="max-w-sm py-3 text-sm text-slate-600">
                  {c.root_cause ? (
                    <div>
                      <p className="font-medium">{c.root_cause}</p>

                      <p className="mt-1 text-slate-500">
                        {c.recommended_strategy}
                      </p>

                      <p className="mt-1 text-xs">
                        Confidence: {Math.round(c.confidence * 100)}%
                      </p>
                    </div>
                  ) : (
                    <span className="italic text-slate-400">Not generated</span>
                  )}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => openWorkflow(c)}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <WorkflowModal
        open={open}
        onClose={() => setOpen(false)}
        payment={selectedPayment}
        workflow={workflow}
      />
    </div>
  );
}