import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .maybeSingle();

  const isAdministrator =
    !profileError &&
    profile?.role === "super_admin" &&
    profile?.active === true;

  if (!isAdministrator) {
    redirect("/profile");
  }

  return <>{children}</>;
}