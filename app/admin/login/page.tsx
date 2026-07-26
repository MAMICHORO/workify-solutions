import { redirect } from "next/navigation";

import LoginForm from "./LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <main className="adminLoginPage">
      <section className="adminLoginCard">
        <div className="adminLoginBrand">
          WORKIFY
          <span>SOLUTIONS</span>
        </div>

        <p className="adminLoginEyebrow">
          SECURE ADMINISTRATION
        </p>

        <h1>Welcome back.</h1>

        <p className="adminLoginDescription">
          Sign in to manage projects, vacancies,
          recruitment requests and gallery
          presentations.
        </p>

        <LoginForm />

        <p className="adminLoginNotice">
          Access is restricted to approved Workify
          administrators.
        </p>
      </section>
    </main>
  );
}