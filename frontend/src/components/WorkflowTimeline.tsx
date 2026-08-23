import { CheckCircle2, Circle, CircleDot } from "lucide-react";

export default function WorkflowTimeline({
  events,
}: {
  events: any[];
}) {
  const steps = [
    {
      id: "at_risk",
      title: "Payment Imported",
      description: "Payment identified as revenue at risk.",
    },
    {
      id: "risk_assessed",
      title: "Risk Assessed",
      description: "Detection Agent calculated the recovery priority.",
    },
    {
      id: "diagnosis_generated",
      title: "AI Diagnosis Generated",
      description: "Root cause and recovery strategy were created.",
    },
    {
      id: "email_sent",
      title: "Recovery Email Sent",
      description: "Customer has been contacted.",
    },
    {
      id: "waiting",
      title: "Waiting for Payment",
      description: "Monitoring customer response.",
    },
    {
      id: "payment_received",
      title: "Payment Received",
      description: "Revenue successfully recovered.",
    },
    {
      id: "closed",
      title: "Workflow Closed",
      description: "Recovery workflow completed.",
    },
  ];

  const currentState =
    events.length > 0 ? events[events.length - 1].state : "at_risk";

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentState)
  );

  const eventMap = new Map(events.map((event) => [event.state, event]));

  function formatIST(timestamp: string) {
    return new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <h3 className="mb-5 text-lg font-semibold text-slate-900">
        Recovery Workflow
      </h3>

      <div className="space-y-5">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;

          const event = eventMap.get(step.id);
          const timestamp = event?.timestamp
            ? formatIST(event.timestamp)
            : null;

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                {completed ? (
                  <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                ) : current ? (
                  <CircleDot className="h-6 w-6 animate-pulse text-indigo-600" />
                ) : (
                  <Circle className="h-6 w-6 text-slate-300" />
                )}

                {index !== steps.length - 1 && (
                  <div
                    className={`mt-1 h-8 w-0.5 ${
                      index < currentIndex
                        ? "bg-indigo-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>

              <div className="pb-2">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-medium ${
                      completed || current
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>

                  {current && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {step.description}
                </p>

                {timestamp && (
                  <p className="mt-1 text-xs text-slate-400">
                    {timestamp} IST
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}