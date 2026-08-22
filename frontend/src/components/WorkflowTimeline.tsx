import { Clock } from "lucide-react";

export default function WorkflowTimeline({
  events,
}: {
  events: any[];
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-5 text-xl font-semibold">Workflow Timeline</h2>

      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4">
            <Clock className="mt-1 h-5 w-5 text-slate-400" />

            <div>
              <p className="font-medium capitalize">
                {event.state.replace("_", " ")}
              </p>

              <p className="text-xs text-slate-400">
                {new Date(event.timestamp).toLocaleString()}
              </p>

              <p className="text-sm text-slate-500">{event.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}