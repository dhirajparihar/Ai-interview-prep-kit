"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import GenerationProgressModal from "@/components/generation/GenerationProgressModal";
import { Sparkles, Building2, Calendar, FileText, Upload, AlertCircle } from "lucide-react";

export default function NewKitPage() {
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [days, setDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progressStage, setProgressStage] = useState("Initializing pipeline...");
  const [progressPercent, setProgressPercent] = useState(10);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed[0]) {
          setJd(parsed[0].jd || parsed[0].job_description || "");
          setCompanyUrl(parsed[0].company_url || parsed[0].companyUrl || "");
          setDays(parsed[0].days || 5);
        } else if (typeof parsed === "object") {
          setJd(parsed.jd || parsed.job_description || "");
          setCompanyUrl(parsed.company_url || parsed.companyUrl || "");
          setDays(parsed.days || 5);
        }
      } catch {
        setError("Invalid JSON file structure.");
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim()) {
      setError("Please paste a job description.");
      return;
    }
    if (!companyUrl.trim()) {
      setError("Please enter the company website URL.");
      return;
    }

    setError("");
    setLoading(true);
    setProgressStage("Extracting requirements from job description...");
    setProgressPercent(15);

    try {
      // Simulate incremental progress stages during fetch
      const interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 1500);

      const res = await fetch("/api/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, companyUrl, days }),
      });

      clearInterval(interval);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create kit");
      }

      setProgressPercent(100);
      setProgressStage("Kit generated successfully!");

      setTimeout(() => {
        router.push(`/kits/${data.kit._id}`);
        router.refresh();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kit generation failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={{ name: "User", email: "" }} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create Interview Prep Kit</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Provide the job details below. Our pipeline will research the company, extract requirements, and build your kit.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          {/* File Upload Option */}
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-300">Preparing for multiple roles?</p>
              <p className="text-xs text-slate-400">Upload a JSON file containing job description and company URL pairs.</p>
            </div>
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer transition-colors shrink-0">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Job Description (Pasted Text)</span>
            </label>
            <textarea
              required
              rows={8}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the complete job description text here (requirements, responsibilities, tech stack, etc.)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Company URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span>Company Website URL</span>
              </label>
              <input
                type="text"
                required
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Days Available */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Days Until Interview (1-60)</span>
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(60, Number(e.target.value))))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span>Start Kit Generation</span>
          </button>
        </form>
      </main>

      {loading && (
        <GenerationProgressModal
          stage={progressStage}
          percent={progressPercent}
          error={error}
          onRetry={() => {
            setLoading(false);
            setError("");
          }}
        />
      )}
    </div>
  );
}
