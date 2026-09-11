"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PlusCircle, LogOut, LayoutDashboard, BrainCircuit, ArrowUpRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 border border-zinc-700/60 transition-colors">
            <BrainCircuit className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
            PREPKIT <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">SYSTEM</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <nav className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700/80"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/kits/new"
                className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Kit</span>
              </Link>

              <div className="h-3.5 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hidden sm:inline-block">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </nav>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <span>Get Started</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


