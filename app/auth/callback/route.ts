import { NextResponse } from "next/server";

import { getSafePublicReturnPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnTo = getSafePublicReturnPath(
    requestUrl.searchParams.get("next")
  );

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=missing_code",
        requestUrl.origin
      )
    );
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error(
      "OAuth session exchange failed:",
      exchangeError
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=oauth_failed",
        requestUrl.origin
      )
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Authenticated user lookup failed:",
      userError
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=no_user",
        requestUrl.origin
      )
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Admin profile lookup failed:",
      profileError
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=profile_lookup_failed",
        requestUrl.origin
      )
    );
  }

  const isAdministrator =
    profile?.role === "super_admin" &&
    profile?.active === true;

  const destination = isAdministrator
    ? "/admin"
    : returnTo ?? "/profile";

  return NextResponse.redirect(
    new URL(destination, requestUrl.origin)
  );
}
