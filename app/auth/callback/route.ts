import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", requestUrl.origin)
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error);

    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", requestUrl.origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=no_user", requestUrl.origin)
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .maybeSingle();

  const isAdministrator =
    profile?.role === "super_admin" &&
    profile?.active === true;

  return NextResponse.redirect(
    new URL(
      isAdministrator ? "/admin" : "/profile",
      requestUrl.origin
    )
  );
}