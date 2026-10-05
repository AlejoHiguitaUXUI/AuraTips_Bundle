import { redirect } from "next/navigation";

export default async function CoursesRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; proc?: string; selected?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const queryParams = new URLSearchParams();

  if (resolvedParams.category) {
    queryParams.set("category", resolvedParams.category);
  }
  if (resolvedParams.proc) {
    queryParams.set("proc", resolvedParams.proc);
  } else if (resolvedParams.selected) {
    queryParams.set("proc", resolvedParams.selected);
  }

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
  redirect(`/procedimientos${queryStr}`);
}
