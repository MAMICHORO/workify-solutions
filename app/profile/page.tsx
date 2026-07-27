import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="profilePage">
      <div className="profileContainer">

        <div className="profileHero">

          <img
            src={
              user.user_metadata.avatar_url ??
              "/images/default-avatar.png"
            }
            alt=""
            className="profileAvatar"
          />

          <div>

            <h1>
              {user.user_metadata.full_name ??
                user.email}
            </h1>

            <p>{user.email}</p>

          </div>

        </div>

        <div className="profileGrid">

          <div className="profileCard">
            <h3>Construction Requests</h3>
            <p>0</p>
          </div>

          <div className="profileCard">
            <h3>Recruitment Requests</h3>
            <p>0</p>
          </div>

          <div className="profileCard">
            <h3>Job Applications</h3>
            <p>0</p>
          </div>

          <div className="profileCard">
            <h3>Notifications</h3>
            <p>0</p>
          </div>

        </div>

      </div>
    </main>
  );
}