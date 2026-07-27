"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const links = [
  ["/construction", "Construction"],
  ["/recruitment", "Recruitment"],
  ["/projects", "Projects"],
  ["/jobs", "Jobs"],
  ["/gallery", "Gallery"],
  ["/about", "About"],
] as const;

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    router.refresh();
    router.push("/");
  }

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="siteHeader">
      <div className="container headerInner">

        <Link href="/" className="brand">
          WORKIFY
        </Link>

        <button
          className="menuBtn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
        </button>

        <nav className={open ? "nav open" : "nav"}>

          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/contact"
            className="navCta"
            onClick={() => setOpen(false)}
          >
            Start a request
          </Link>

          {!user ? (
            <Link
              href="/login"
              className="navLogin"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          ) : (
            <div className="navUser">

              <Link
                href="/profile"
                className="navProfile"
                onClick={() => setOpen(false)}
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="navAvatar"
                  />
                ) : (
                  <div className="navAvatarFallback">
                    {(user.user_metadata?.full_name ||
                      user.email ||
                      "U")[0].toUpperCase()}
                  </div>
                )}

                <span>
                  {user.user_metadata?.given_name ||
                    user.user_metadata?.full_name ||
                    user.email}
                </span>
              </Link>

              <button
                type="button"
                className="navLogout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          )}

        </nav>
      </div>
    </header>
  );
}