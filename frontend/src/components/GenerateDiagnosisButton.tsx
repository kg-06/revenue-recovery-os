import { useState } from "react";
import { Sparkles } from "lucide-react";
import { generateDiagnoses } from "../services/diagnosis";

export default function GenerateDiagnosisButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    setLoading(true);

    try {
      const result = await generateDiagnoses();

      setMessage(
        `Generated AI diagnoses for ${result.processed} recovery cases.`,
      );
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Diagnosis failed.");
    }

    setLoading(false);
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <button
        onClick={run}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        <Sparkles size={18} />
        {loading ? "Generating..." : "Generate AI Diagnoses"}
      </button>

      {message && (
        <p className="mt-4 text-slate-600">{message}</p>
      )}
    </div>
  );
}