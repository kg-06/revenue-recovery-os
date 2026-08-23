import { BarChart3, CheckCircle2 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  const items = [
    {
      icon: BarChart3,
      label: "Dashboard",
      path: "/",
    },
    {
      icon: CheckCircle2,
      label: "Recovered Cases",
      path: "/recovered",
    },
  ];

  const pageTitle =
    location.pathname === "/recovered" ? "Recovered Cases" : "Dashboard";

  const pageSubtitle =
    location.pathname === "/recovered"
      ? "Completed recovery workflows and successful payments."
      : "AI-powered revenue recovery platform.";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 text-white md:flex md:flex-col">
        <div className="border-b border-slate-800 p-6">
          <h1 className="text-xl font-bold">Revenue Recovery OS</h1>

          <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
            AI Revenue Recovery
          </p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {items.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-3 transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-500">Razorpay Buildathon</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {pageTitle}
              </h2>

              <p className="text-sm text-slate-500">{pageSubtitle}</p>
            </div>

            <div className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">
              Demo Mode
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}