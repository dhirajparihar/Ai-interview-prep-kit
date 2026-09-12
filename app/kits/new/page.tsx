"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import GenerationProgressModal from "@/components/generation/GenerationProgressModal";
import { Sparkles, Building2, Calendar, FileText, Upload, AlertCircle } from "lucide-react";

export default function NewKitPage() {
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [days, setDays] = useState<number | "">(5);
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

    const finalDays =
      typeof days === "number" && !isNaN(days)
        ? Math.max(1, Math.min(60, days))
        : 5;

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
        body: JSON.stringify({ jd, companyUrl, days: finalDays }),
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
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navbar user={{ name: "User", email: "" }} />

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Create Interview Prep Kit</h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-sans">
            Provide the job details below. Our pipeline will research the company, extract requirements, and build your kit.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 p-3.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#121215] p-6 sm:p-7 rounded-xl border border-zinc-200 dark:border-zinc-800/90 shadow-sm dark:shadow-none space-y-5">
          {/* File Upload Option */}
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Preparing for multiple roles?</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Upload a JSON file containing job description and company URL pairs.</p>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700/60 text-xs font-medium cursor-pointer transition-colors shrink-0">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>Job Description (Pasted Text)</span>
            </label>
            <textarea
              required
              rows={8}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the complete job description text here (requirements, responsibilities, tech stack, etc.)..."
              className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/80 rounded-md p-3.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors resize-y font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Company URL */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                <span>Company Website URL</span>
              </label>
              <input
                type="text"
                required
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/80 rounded-md py-2 px-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-sans"
              />
            </div>

            {/* Days Available */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300" />
                <span>Days Until Interview (1-60)</span>
              </label>
              <input
                type="number"
                min={1}
                max={60}
                required
                value={days}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setDays("");
                  } else {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) {
                      setDays(parsed);
                    }
                  }
                }}
                onBlur={() => {
                  if (days === "" || typeof days !== "number" || isNaN(days) || days < 1) {
                    setDays(1);
                  } else if (days > 60) {
                    setDays(60);
                  }
                }}
                className="w-full bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700/80 rounded-md py-2 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors disabled:opacity-50 mt-2 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
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
