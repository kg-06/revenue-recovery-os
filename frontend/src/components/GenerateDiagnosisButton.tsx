import { useState } from "react";
import { Sparkles } from "lucide-react";
import { generateDiagnoses } from "../services/diagnosis";

export default function GenerateDiagnosisButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setLoading(true);
    setMessage("");

    try {
      const result = await generateDiagnoses();

      setMessage(
        `Generated AI diagnoses for ${result.processed} recovery cases.`,
      );

      // Refresh Dashboard + Recovery Queue immediately
      window.dispatchEvent(new Event("data-updated"));
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Diagnosis failed.");
    }

    setLoading(false);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
        <Sparkles className="h-7 w-7 text-indigo-600" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        Generate AI Diagnoses
      </h3>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Analyze imported recovery cases and generate root causes, customer
        behavior, confidence scores, and recommended recovery actions.
      </p>

      <button
        onClick={run}
        disabled={loading}
        className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles size={18} />
        {loading ? "Generating..." : "Generate AI Diagnoses"}
      </button>

      {message && (
        <p className="mt-4 max-w-sm rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {message}
        </p>
      )}
    </div>
  );
}