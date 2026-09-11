import { getSessionUser } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { PracticeService } from "@/lib/services/practiceService";
import Navbar from "@/components/ui/Navbar";
import FlashcardDeck from "@/components/practice/FlashcardDeck";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PracticePage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const practiceService = new PracticeService();
  const deck = await practiceService.getPracticeDeck(user.userId, params.id);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/kits/${params.id}`}
            className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700/60"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Practice Mode</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-sans">Confidence-weighted flashcard review deck</p>
          </div>
        </div>

        <FlashcardDeck kitId={params.id} initialDeck={deck} />
      </main>
    </div>


  );
}
