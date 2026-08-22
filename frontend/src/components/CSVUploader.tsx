import { useState } from "react";
import { Upload } from "lucide-react";
import { uploadCSV } from "../services/upload";

export default function CSVUploader() {
  const [message, setMessage] = useState("");

  async function handleFile(file: File) {
    try {
      const result = await uploadCSV(file);

      setMessage(
        `Processed ${result.processed} records • Added ${result.inserted} • Updated ${result.updated} • ₹${result.total_amount.toLocaleString()}`,
      );
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Upload failed.");
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
      <Upload className="mx-auto mb-4 h-10 w-10 text-slate-500" />

      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) handleFile(file);
        }}
      />

      {message && (
        <p className="mt-4 font-medium text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}