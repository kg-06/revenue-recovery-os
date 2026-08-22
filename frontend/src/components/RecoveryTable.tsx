import { useEffect, useState } from "react";
import { getRecoveryCases } from "../services/recovery";

export default function RecoveryTable() {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    getRecoveryCases()
      .then(setCases)
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-5 text-xl font-semibold">
        Recovery Queue
      </h2>

      <div className="overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-3">Customer</th>
              <th>Amount</th>
              <th>Priority</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {cases.map((c, i) => (
              <tr
                key={i}
                className="border-t"
              >
                <td className="py-3">{c.customer_name}</td>

                <td>₹{c.amount}</td>

                <td>{c.priority}</td>

                <td>{c.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}