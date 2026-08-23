import { useEffect, useState } from "react";
import { AlertTriangle, Wallet, Users, TrendingUp } from "lucide-react";

import AppShell from "../layout/AppShell";
import CSVUploader from "../components/CSVUploader";
import GenerateDiagnosisButton from "../components/GenerateDiagnosisButton";
import RecoveryTable from "../components/RecoveryTable";

import { getBackendHealth } from "../services/health";
import { getDashboardSummary } from "../services/dashboard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [health, setHealth] = useState<any>(null);

  const [summary, setSummary] = useState({
    revenue_at_risk: 0,
    recovered_today: 0,
    total_cases: 0,
    recovery_rate: 0,
  });

  async function refreshDashboard() {
    getBackendHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: "offline" }));

    getDashboardSummary()
      .then(setSummary)
      .catch(() => {});
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  // Refresh dashboard whenever data changes anywhere in the app
  useEffect(() => {
    const handler = () => refreshDashboard();

    window.addEventListener("data-updated", handler);
    window.addEventListener("recovery-updated", handler);

    return () => {
      window.removeEventListener("data-updated", handler);
      window.removeEventListener("recovery-updated", handler);
    };
  }, []);

  const cards = [
    {
      title: "Revenue at Risk",
      value: `₹${summary.revenue_at_risk.toLocaleString()}`,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      title: "Recovered Today",
      value: `₹${summary.recovered_today.toLocaleString()}`,
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      title: "Active Cases",
      value: summary.total_cases,
      icon: Users,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      title: "Recovery Rate",
      value: `${summary.recovery_rate}%`,
      icon: TrendingUp,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* KPI Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card
              key={card.title}
              className="border-slate-200 shadow-sm transition hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {card.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Import Payment Data</CardTitle>
            </CardHeader>

            <CardContent>
              <CSVUploader />
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>AI Diagnosis</CardTitle>
            </CardHeader>

            <CardContent>
              <GenerateDiagnosisButton />
            </CardContent>
          </Card>
        </div>

        {/* Recovery Queue */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Recovery Queue
            </h2>

            <p className="text-slate-500">
              AI-prioritized customers requiring intervention.
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <RecoveryTable />
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold text-slate-900">System Health</h3>

              <p className="text-sm text-slate-500">
                FastAPI and MongoDB connection status.
              </p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                health?.status === "healthy"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  health?.status === "healthy"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />

              <span className="text-sm font-medium">
                {health?.status === "healthy" ? "Healthy" : "Offline"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}