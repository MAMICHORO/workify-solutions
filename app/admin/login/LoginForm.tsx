"use client";

import { useState } from "react";

import { getSafePublicReturnPath } from "@/lib/auth-redirect";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  returnTo,
}: {
  returnTo?: string;
}) {
  const [supabase] = useState(createClient);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] =
    useState(false);

  async function handleGoogleSignIn() {
    setError("");
    setIsGoogleLoading(true);

    const callbackUrl = new URL(
      "/auth/callback",
      window.location.origin
    );
    const safeReturnPath =
      getSafePublicReturnPath(returnTo);

    if (safeReturnPath) {
      callbackUrl.searchParams.set(
        "next",
        safeReturnPath
      );
    }

    const { error: googleError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
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

  return (
    <div className="adminLoginMethods">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="adminGoogleLoginButton"
      >
        {isGoogleLoading
          ? "Connecting to Google..."
          : "Continue with Google"}
      </button>

      <p className="adminLoginNotice">
        Workify uses your Google account only to identify
        you, protect your requests and provide the correct
        account access.
      </p>

      {error ? (
        <p
          className="adminLoginError"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
