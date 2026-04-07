import OverviewScrollFade from "@/components/OverviewScrollFade";
import { getAllWork } from "@/lib/queries";

export const revalidate = 60;

export default async function OverviewPage() {
  const allWork = await getAllWork();

  return (
    <main className="relative min-h-screen w-full">
      <OverviewScrollFade works={allWork} />
    </main>
  );
}
