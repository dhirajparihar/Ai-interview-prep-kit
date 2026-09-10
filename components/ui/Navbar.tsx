"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, PlusCircle, LogOut, LayoutDashboard, BrainCircuit } from "lucide-react";

interface NavbarProps {
  user?: { name: string; email: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            PrepKit <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">AI</span>
          </span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${
                pathname === "/dashboard"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/kits/new"
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Kit</span>
            </Link>

            <div className="h-4 w-[1px] bg-slate-800 mx-1" />

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 hidden sm:inline-block">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-850 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get Started</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
