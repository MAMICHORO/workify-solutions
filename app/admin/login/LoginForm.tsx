"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isGoogleLoading, setIsGoogleLoading] =
    useState(false);

  async function handleGoogleSignIn() {
  setError("");
  setIsGoogleLoading(true);

  const redirectTo =
    `${window.location.origin}/auth/callback`;

  const { error: googleError } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

  if (googleError) {
    console.error("Google login error:", googleError);

    setError(
      "Google sign-in could not be started. Please try again."
    );

    setIsGoogleLoading(false);
  }
}

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const {
      data: { user },
      error: loginError,
    } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError || !user) {
      setError(
        "The email address or password is incorrect."
      );
      setIsSubmitting(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, active")
      .eq("id", user.id)
      .maybeSingle();

    const isAdministrator =
      profile?.role === "super_admin" &&
      profile?.active === true;

    router.replace(
      isAdministrator ? "/admin" : "/profile"
    );
    router.refresh();
  }

  const isBusy = isSubmitting || isGoogleLoading;

  return (
    <div className="adminLoginMethods">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isBusy}
        className="adminGoogleLoginButton"
      >
        {isGoogleLoading
          ? "Connecting to Google..."
          : "Continue with Google"}
      </button>

      <div className="adminLoginDivider">
        <span>or sign in with email</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="adminLoginForm"
      >
        <div className="adminLoginField">
          <label htmlFor="admin-email">
            Email address
          </label>

          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={isBusy}
            required
          />
        </div>

        <div className="adminLoginField">
          <label htmlFor="admin-password">
            Password
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            disabled={isBusy}
            required
          />
        </div>

        {error ? (
          <p
            className="adminLoginError"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isBusy}
          className="adminLoginButton"
        >
          {isSubmitting
            ? "Signing in..."
            : "Sign in securely"}
        </button>
      </form>
    </div>
  );
}
