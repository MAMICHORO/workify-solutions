"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  addRecruitmentRequest,
} from "@/lib/recruitmentRequests";

const availableServices = [
  "Job advertising",
  "Candidate sourcing",
  "CV screening",
  "Shortlisting",
  "Interview management",
  "Skills testing",
  "Reference checks",
  "Background verification",
  "Final recruitment report",
];

export default function RecruitmentRequestForm() {
  const [selectedServices, setSelectedServices] =
    useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState("");

  function toggleService(service: string) {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    );
  }

  function submitRequest(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSubmitted(false);

    if (selectedServices.length === 0) {
      setError(
        "Select at least one recruitment service."
      );
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const vacancies = Number(
      formData.get("vacancies")
    );

    if (!Number.isFinite(vacancies) || vacancies < 1) {
      setError(
        "The number of vacancies must be at least 1."
      );
      return;
    }

    addRecruitmentRequest({
      organizationName: String(
        formData.get("organizationName") ?? ""
      ).trim(),

      contactPerson: String(
        formData.get("contactPerson") ?? ""
      ).trim(),

      phone: String(
        formData.get("phone") ?? ""
      ).trim(),

      email: String(
        formData.get("email") ?? ""
      ).trim(),

      sector: String(
        formData.get("sector") ?? ""
      ).trim(),

      positions: String(
        formData.get("positions") ?? ""
      ).trim(),

      vacancies,

      employmentType: String(
        formData.get("employmentType") ?? ""
      ).trim(),

      location: String(
        formData.get("location") ?? ""
      ).trim(),

      deadline: String(
        formData.get("deadline") ?? ""
      ).trim(),

      services: selectedServices,

      qualifications: String(
        formData.get("qualifications") ?? ""
      ).trim(),

      instructions: String(
        formData.get("instructions") ?? ""
      ).trim(),
    });

    form.reset();
    setSelectedServices([]);
    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <form
      className="recruitmentRequestForm"
      onSubmit={submitRequest}
    >
      <div className="recruitmentFormHeading">
        <span>RECRUITMENT REQUEST</span>

        <h2>
          Tell us who you need us to recruit.
        </h2>

        <p>
          Submit the positions, candidate requirements
          and recruitment services your organization
          needs.
        </p>
      </div>

      {submitted && (
        <div className="recruitmentSuccess">
          Recruitment request submitted successfully.
          It is now available in the admin Recruitment
          Requests table.
        </div>
      )}

      {error && (
        <div className="recruitmentError">
          {error}
        </div>
      )}

      <div className="recruitmentFieldsGrid">
        <label>
          Organization name
          <input
            name="organizationName"
            required
            placeholder="Company, NGO or institution"
          />
        </label>

        <label>
          Contact person
          <input
            name="contactPerson"
            required
            placeholder="Full name"
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
            required
            placeholder="contact@organization.org"
          />
        </label>

        <label>
          Organization sector
          <select
            name="sector"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select sector
            </option>

            <option>Private company</option>
            <option>NGO</option>
            <option>Government institution</option>
            <option>County government</option>
            <option>School or university</option>
            <option>Hospital or health organization</option>
            <option>Construction company</option>
            <option>Individual employer</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Employment type
          <select
            name="employmentType"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select employment type
            </option>

            <option>Permanent</option>
            <option>Contract</option>
            <option>Temporary</option>
            <option>Project-based</option>
            <option>Part-time</option>
            <option>Internship</option>
            <option>Consultancy</option>
          </select>
        </label>

        <label className="recruitmentWideField">
          Position or positions required
          <input
            name="positions"
            required
            placeholder="Example: Finance Officer, Field Officers and Drivers"
          />
        </label>

        <label>
          Number of vacancies
          <input
            name="vacancies"
            type="number"
            min="1"
            required
            placeholder="1"
          />
        </label>

        <label>
          Work location
          <input
            name="location"
            required
            placeholder="Town, county or multiple counties"
          />
        </label>

        <label>
          Recruitment deadline
          <input
            name="deadline"
            type="date"
            required
          />
        </label>
      </div>

      <fieldset className="recruitmentServices">
        <legend>
          Select the services required
        </legend>

        <div className="recruitmentServiceGrid">
          {availableServices.map((service) => {
            const checked =
              selectedServices.includes(service);

            return (
              <label
                key={service}
                className={
                  checked
                    ? "recruitmentService selected"
                    : "recruitmentService"
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggleService(service)
                  }
                />

                <span>{service}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="recruitmentFullField">
        Required qualifications and experience
        <textarea
          name="qualifications"
          rows={5}
          required
          placeholder="Describe education, experience, skills, professional qualifications and any mandatory documents."
        />
      </label>

      <label className="recruitmentFullField">
        Additional instructions
        <textarea
          name="instructions"
          rows={5}
          placeholder="Interview arrangements, reporting requirements, regional targets, background checks or other instructions."
        />
      </label>

      <button
        className="recruitmentSubmitButton"
        type="submit"
      >
        Submit recruitment request
      </button>
    </form>
  );
}
