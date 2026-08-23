import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadCSV } from "../services/upload";

export default function CSVUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);

    try {
      const result = await uploadCSV(file);

      toast.success("CSV imported successfully", {
        description: `Processed ${result.processed} records • Added ${result.inserted} • Updated ${result.updated}`,
      });

      window.dispatchEvent(new Event("data-updated"));
    } catch (err: any) {
      toast.error("Upload failed", {
        description: err.response?.data?.detail || "Something went wrong.",
      });
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
    >
      <Upload size={18} />
      {loading ? "Uploading..." : "Upload Payment CSV"}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </button>
  );
}