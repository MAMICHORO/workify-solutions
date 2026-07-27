"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";

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
  const [supabase] = useState(createClient);
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState<{
    user: User;
    isAdministrator: boolean;
  } | null>(null);
  const accountRequest = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function loadAccount(user: User | null) {
      const request = ++accountRequest.current;

      if (!user) {
        if (mounted) {
          setAccount(null);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, active")
        .eq("id", user.id)
        .maybeSingle();

      if (
        mounted &&
        request === accountRequest.current
      ) {
        setAccount({
          user,
          isAdministrator:
            profile?.role === "super_admin" &&
            profile?.active === true,
        });
      }
    }

    void supabase.auth.getSession().then(
      ({
        data: { session },
      }) => loadAccount(session?.user ?? null)
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "TOKEN_REFRESHED"
        ) {
          window.setTimeout(() => {
            void loadAccount(session?.user ?? null);
          }, 0);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    ++accountRequest.current;
    setAccount(null);
    setOpen(false);

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
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

          {!account ? (
            <Link
              href="/login"
              className="navLogin"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          ) : (
            <div className="navUser">

              <div
                className="navProfile"
              >
                {account.user.user_metadata?.avatar_url ? (
                  <img
                    src={
                      account.user.user_metadata.avatar_url
                    }
                    alt=""
                    className="navAvatar"
                  />
                ) : (
                  <div className="navAvatarFallback">
                    {(account.user.user_metadata?.full_name ||
                      account.user.email ||
                      "U")[0].toUpperCase()}
                  </div>
                )}

                <span>
                  {account.user.user_metadata?.given_name ||
                    account.user.user_metadata?.full_name ||
                    account.user.email}
                </span>
              </div>

              <Link
                href={
                  account.isAdministrator
                    ? "/admin"
                    : "/profile"
                }
                className="navAccountLink"
                onClick={() => setOpen(false)}
              >
                {account.isAdministrator
                  ? "Dashboard"
                  : "Profile"}
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
