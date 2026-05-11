import WorkPageClient from "@/components/WorkPageClient";
import { getAllWork } from "@/lib/queries";

export const revalidate = 60;

export default async function WorkPage() {
  const works = await getAllWork();

  return <WorkPageClient works={works} />;
}
