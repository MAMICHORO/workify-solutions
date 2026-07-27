"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { store } from "@/lib/store";

type RequestFormProps = {
  defaultType?: string;
  defaultProject?: string;
};

export default function RequestForm({
  defaultType = "",
  defaultProject = "",
}: RequestFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(createClient);

  const [requestType, setRequestType] =
    useState(defaultType);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isCheckingUser, setIsCheckingUser] =
    useState(true);

  const [isSignedIn, setIsSignedIn] =
    useState(false);

  useEffect(() => {
    setRequestType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setIsSignedIn(Boolean(user));
        setIsCheckingUser(false);
      }
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsSignedIn(Boolean(session?.user));
        setIsCheckingUser(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function submitRequest(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  // <-- ADD THIS LINE HERE
  const form = event.currentTarget;

  setSubmitted(false);
  setError("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

    if (userError || !user) {
      const nextPath = encodeURIComponent(
        pathname || "/contact"
      );

      router.push(`/login?next=${nextPath}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(form);

      const name = String(
        formData.get("name") ?? ""
      ).trim();

      const phone = String(
        formData.get("phone") ?? ""
      ).trim();

      const email = String(
        formData.get("email") ?? ""
      ).trim();

      const organization = String(
        formData.get("organization") ?? ""
      ).trim();

      const location = String(
        formData.get("location") ?? ""
      ).trim();

      const startDate = String(
        formData.get("startDate") ?? ""
      ).trim();

      const description = String(
        formData.get("description") ?? ""
      ).trim();

      if (
        !name ||
        !phone ||
        !requestType ||
        !location ||
        !description
      ) {
        setError(
          "Complete all required fields before submitting."
        );
        return;
      }

      const existingEnquiries =
        store.enquiries();

      store.saveEnquiries([
        {
          id:
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `enquiry-${Date.now()}`,

          name,
          phone,
          email: email || user.email || "",
          organization,
          service: requestType,
          location,
          details: [
            defaultProject
              ? `Project: ${defaultProject}`
              : "",
            startDate
              ? `Expected start date: ${startDate}`
              : "",
            description,
          ]
            .filter(Boolean)
            .join("\n\n"),
          status: "New",
          createdAt: new Date().toISOString(),
        },
        ...existingEnquiries,
      ]);

      setSubmitted(true);
      form.reset();
      setRequestType(defaultType);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
  console.error(err);

  setError(
    "The request could not be submitted. Please try again."
  );
} 
    finally {
      setIsSubmitting(false);
    }
  }

  function handleLoginRequired() {
    const nextPath = encodeURIComponent(
      pathname || "/contact"
    );

    router.push(`/login?next=${nextPath}`);
  }

  return (
    <form
      className="workifyRequestForm"
      onSubmit={submitRequest}
    >
      <div className="workifyRequestFormHead">
        <span>REQUEST DETAILS</span>

        <h2>
          Provide the information we need to respond.
        </h2>

        {defaultProject && (
          <div className="workifySelectedProject">
            <span>SELECTED PROJECT</span>
            <strong>{defaultProject}</strong>
          </div>
        )}
      </div>

      {!isCheckingUser && !isSignedIn && (
        <div className="workifyRequestLoginRequired">
          <strong>Sign in before submitting.</strong>

          <p>
            You may complete the form, but you must log in
            before the request can be sent.
          </p>

          <button
            type="button"
            onClick={handleLoginRequired}
          >
            Login or create an account
          </button>
        </div>
      )}

      {submitted && (
        <div className="workifyRequestSuccess">
          Your request has been submitted successfully.
          It is now available in the administration
          dashboard.
        </div>
      )}

      {error && (
        <div
          className="workifyRequestError"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="workifyRequestGrid">
        <label>
          Full name
          <input
            name="name"
            required
            placeholder="Your full name"
          />
        </label>

        <label>
          Phone number
          <input
            name="phone"
            required
            placeholder="+254..."
          />
        </label>

        <label>
          Email address
          <input
            name="email"
            type="email"
            placeholder="Enter your email address"
          />
        </label>

        <label>
          Organization
          <input
            name="organization"
            placeholder="Company, NGO, institution or individual"
          />
        </label>

        <label className="workifyRequestWide">
          What do you need?
          <select
            name="type"
            required
            value={requestType}
            onChange={(event) =>
              setRequestType(event.target.value)
            }
          >
            <option value="" disabled>
              Select a service
            </option>

            <option value="construction">
              Complete construction contract
            </option>

            <option value="site-workers">
              Construction workers for a site
            </option>

            <option value="recruitment">
              Recruitment on our behalf
            </option>

            <option value="interviews">
              Interview and screening support
            </option>

            <option value="job">
              Job-seeker enquiry
            </option>
          </select>
        </label>

        <label>
          Location
          <input
            name="location"
            required
            placeholder="Town / County"
          />
        </label>

        <label>
          Expected start date
          <input
            name="startDate"
            type="date"
          />
        </label>

        <label className="workifyRequestWide">
          Brief description
          <textarea
            name="description"
            required
            rows={7}
            placeholder={
              defaultProject
                ? `Tell us what you need for ${defaultProject}.`
                : "Describe the project, positions, worker numbers, deadline or expected outcome."
            }
          />
        </label>

        <label className="workifyRequestWide">
          Supporting documents
          <input
            type="file"
            name="documents"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />

          <small>
            Document upload is not active yet. We will
            connect it to Supabase Storage next.
          </small>
        </label>
      </div>

      <label className="workifyRequestConsent">
        <input
          type="checkbox"
          required
        />

        <span>
          I confirm that the information provided is
          correct.
        </span>
      </label>

      <button
        className="workifyRequestSubmit"
        type="submit"
        disabled={isCheckingUser || isSubmitting}
      >
        {isCheckingUser
          ? "Checking account..."
          : isSubmitting
            ? "Submitting..."
            : isSignedIn
              ? "Submit request"
              : "Login to submit"}
      </button>
    </form>
  );
}
