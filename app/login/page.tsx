import { redirect } from "next/navigation";

import LoginForm from "@/app/admin/login/LoginForm";
import { getSafePublicReturnPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const returnTo = getSafePublicReturnPath(params.next);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .maybeSingle();

    const isAdministrator =
      profile?.role === "super_admin" &&
      profile?.active === true;

    if (isAdministrator) {
      redirect("/admin");
    }

    redirect(returnTo ?? "/profile");
  }

  return (
    <main className="publicLoginPage">
      <section className="publicLoginShell">
        <div className="publicLoginIntroduction">
          <p className="publicLoginEyebrow">
            SECURE ACCOUNT ACCESS
          </p>

          <h1>
            Continue with your Workify account.
          </h1>

          <p className="publicLoginDescription">
            Sign in with Google to submit requests, review
            your profile and access the services available
            to your account.
          </p>

          <div className="publicLoginBenefits">
            <div>
              <span>01</span>
              Submit service requests securely
            </div>

            <div>
              <span>02</span>
              Keep your account details together
            </div>

            <div>
              <span>03</span>
              Access the correct workspace automatically
            </div>
          </div>
        </div>

        <div className="publicLoginCard">
          <div className="publicLoginBrand">
            WORKIFY
            <span>NEXUS</span>
          </div>

          <h2>Welcome back.</h2>

          <p className="publicLoginCardText">
            Use the Google account you want associated with
            your Workify Nexus profile.
          </p>

          <LoginForm returnTo={returnTo ?? undefined} />

          <p className="publicLoginNotice">
            Administrators and customers use this same secure
            sign-in. Access is determined by the account profile.
          </p>
        </div>
      </section>
    </main>
  );
}
