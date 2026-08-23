import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateDiagnoses } from "../services/diagnosis";

export default function GenerateDiagnosisButton() {
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);

    try {
      const result = await generateDiagnoses();

      toast.success("AI diagnoses generated", {
        description: `Generated diagnoses for ${result.processed} recovery cases.`,
      });

      window.dispatchEvent(new Event("data-updated"));
    } catch (err: any) {
      toast.error("Diagnosis failed", {
        description: err.response?.data?.detail || "Something went wrong.",
      });
    }

    setLoading(false);
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
    >
      <Sparkles size={18} />
      {loading ? "Generating..." : "Generate AI Diagnoses"}
    </button>
  );
}