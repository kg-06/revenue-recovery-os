import { useEffect, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { getBackendHealth } from "../services/health";
import CSVUploader from "../components/CSVUploader";
import { getDashboardSummary } from "../services/dashboard";

export default function Dashboard() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    getBackendHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: "offline" }));
  }, []);

  const [summary, setSummary] = useState({
    revenue_at_risk: 0,
    recovered_today: 0,
    total_cases: 0,
    recovery_rate: 0,
  });

  useEffect(() => {
    getBackendHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: "offline" }));

    getDashboardSummary()
      .then(setSummary)
      .catch(() => {});
  }, []);

  const cards = [
    {
      title: "Revenue at Risk",
      value: `₹${summary.revenue_at_risk.toLocaleString()}`,
    },
    {
      title: "Recovered Today",
      value: `₹${summary.recovered_today.toLocaleString()}`,
    },
    {
      title: "Active Cases",
      value: summary.total_cases.toString(),
    },
    {
      title: "Recovery Rate",
      value: `${summary.recovery_rate}%`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Revenue Recovery OS
          </h1>
          <p className="text-slate-500">
            AI-powered payment recovery platform.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Backend Status</h2>
              <p className="text-slate-500">
                Live connection with FastAPI.
              </p>
            </div>

            {health?.status === "healthy" ? (
              <CircleCheck className="h-8 w-8 text-green-500" />
            ) : (
              <CircleX className="h-8 w-8 text-red-500" />
            )}
          </div>

          <div className="mt-6 rounded-xl bg-slate-100 p-4">
            <pre className="overflow-x-auto text-sm">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
          <CSVUploader />
        </div>
      </div>
    </div>
  );
}