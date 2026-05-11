import OverviewExperience from "@/components/OverviewExperience";
import { getAllWork } from "@/lib/queries";

export const revalidate = 60;

export default async function OverviewPage() {
  const allWork = await getAllWork();

  return <OverviewExperience works={allWork} />;
}
