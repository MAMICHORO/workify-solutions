import Link from "next/link";

import RecruitmentRequestForm from "@/components/recruitment/RecruitmentRequestForm";

export default function RecruitmentRequestPage() {
  return (
    <section className="recruitmentRequestPage">
      <div className="recruitmentRequestLayout">
        <aside className="recruitmentRequestSummary">
          <Link
            href="/recruitment"
            className="recruitmentBackLink"
          >
            â† Back to recruitment
          </Link>

          <span className="recruitmentSummaryLabel">
            OUTSOURCED RECRUITMENT
          </span>

          <h1>
            Let us manage the hiring process.
          </h1>

          <p>
            Suitable for companies, NGOs, government
            institutions, schools, hospitals,
            contractors and private employers.
          </p>

          <div className="recruitmentSummarySteps">
            <div>
              <span>01</span>
              <strong>Submit requirements</strong>
              <p>
                Tell us the roles, numbers,
                qualifications and deadline.
              </p>
            </div>

            <div>
              <span>02</span>
              <strong>Approve the recruitment plan</strong>
              <p>
                We prepare the sourcing, screening and
                interview approach.
              </p>
            </div>

            <div>
              <span>03</span>
              <strong>Receive recommended candidates</strong>
              <p>
                Review rankings, interview findings and
                the final recruitment report.
              </p>
            </div>
          </div>
        </aside>

        <div className="recruitmentRequestFormPanel">
          <RecruitmentRequestForm />
        </div>
      </div>
    </section>
  );
}
