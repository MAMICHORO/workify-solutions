import { redirect } from "next/navigation";

import LoginForm from "@/app/admin/login/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
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

    redirect("/profile");
  }

  return (
    <main className="publicLoginPage">
      <section className="publicLoginShell">
        <div className="publicLoginIntroduction">
          <p className="publicLoginEyebrow">
            SECURE ADMINISTRATION
          </p>

          <h1>
            Manage Workify Nexus operations.
          </h1>

          <p className="publicLoginDescription">
            Sign in to manage projects, recruitment requests,
            gallery presentations and administrative records.
          </p>

          <div className="publicLoginBenefits">
            <div>
              <span>01</span>
              Review submitted requests
            </div>

            <div>
              <span>02</span>
              Manage construction and recruitment
            </div>

            <div>
              <span>03</span>
              Control administrative records
            </div>
          </div>
        </div>

        <div className="publicLoginCard">
          <div className="publicLoginBrand">
            WORKIFY
            <span>ADMINISTRATION</span>
          </div>

          <h2>Welcome back.</h2>

          <p className="publicLoginCardText">
            Continue securely using the approved Workify Google
            account or administrator email credentials.
          </p>

          <LoginForm />

          <p className="publicLoginNotice">
            Access is restricted to approved Workify administrators.
          </p>
        </div>
      </section>
    </main>
  );
}
