import { notFound } from "next/navigation";

import AdminPage from "../page";

const dashboardSections = new Set([
  "enquiries",
  "vacancies",
  "applications",
  "workers",
  "settings",
]);

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!dashboardSections.has(section)) {
    notFound();
  }

  return <AdminPage />;
}
