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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/kits/${params.id}`}
            className="p-2 rounded-xl bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Practice Mode</h1>
            <p className="text-xs text-slate-400 mt-0.5">Confidence-weighted flashcard review deck</p>
          </div>
        </div>

        <FlashcardDeck kitId={params.id} initialDeck={deck} />
      </main>
    </div>
  );
}
