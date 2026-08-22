import { useRef, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { uploadCSV } from "../services/upload";

export default function CSVUploader() {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setSelectedFile(file);

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
    <div className="flex h-full flex-col justify-center">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Upload className="h-7 w-7 text-indigo-600" />
        </div>

        <h3 className="text-base font-semibold text-slate-900">
          Upload Payment CSV
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Click to browse your payment export.
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Supports CSV files up to 10 MB.
        </p>

        {selectedFile && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            <FileSpreadsheet className="h-4 w-4" />
            {selectedFile.name}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
    </div>
  );
}