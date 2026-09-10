import { getSessionUser } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { KitService } from "@/lib/services/kitService";
import Navbar from "@/components/ui/Navbar";
import KitViewer from "@/components/kit/KitViewer";

export default async function KitPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const kitService = new KitService();
  const kitDoc = await kitService.getKitById(user.userId, params.id);

  if (!kitDoc) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar user={user} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <KitViewer kitId={params.id} initialKit={kitDoc.kit} />
      </main>
    </div>
  );
}
