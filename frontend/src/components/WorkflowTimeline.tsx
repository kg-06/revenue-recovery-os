import {
  CheckCircle2,
  Circle,
  CircleDot,
} from "lucide-react";

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
      id: "risk_scored",
      title: "Risk Scored",
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

  // Current stage comes from the latest workflow event.
  const currentState =
    events.length > 0
      ? events[events.length - 1].state
      : "at_risk";

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === currentState)
  );

  const latestTimestamp =
    events.length > 0
      ? new Date(events[events.length - 1].timestamp).toLocaleString()
      : "Just now";

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <h3 className="mb-5 text-lg font-semibold text-slate-900">
        Recovery Workflow
      </h3>

      <div className="space-y-5">
        {steps.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;

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

                {(completed || current) && (
                  <p className="mt-1 text-xs text-slate-400">
                    {latestTimestamp}
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