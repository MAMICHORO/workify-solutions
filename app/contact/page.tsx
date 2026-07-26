import RequestForm from "@/components/RequestForm";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    project?: string;
  }>;
}) {
  const params = await searchParams;

  const defaultType =
    params.type ?? "";

  const defaultProject =
    params.project
      ? decodeURIComponent(params.project)
      : "";

  return (
    <section className="workifyRequestPage">
      <div className="workifyRequestShell">
        <aside className="workifyRequestIntro">
          <span className="workifyRequestEyebrow">
            START A REQUEST
          </span>

          <h1>
            Tell us the outcome you need.
          </h1>

          <p>
            Submit a construction, workforce,
            recruitment, interview or job-seeker
            request. The correct team will receive it
            immediately.
          </p>

          {defaultProject && (
            <div className="workifyRequestProjectSummary">
              <span>PROJECT ENQUIRY</span>

              <strong>
                {defaultProject}
              </strong>

              <p>
                This project has already been attached
                to the request form.
              </p>
            </div>
          )}

          <div className="workifyRequestContactDetails">
            <div>
              <span>PHONE</span>
              <strong>
                +254 728 043 113
              </strong>
            </div>

            <div>
              <span>EMAIL</span>
              <strong>
                workify.co.ke@gmail.com
              </strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>Kenya</strong>
            </div>
          </div>
        </aside>

        <div className="workifyRequestFormPanel">
          <RequestForm
            defaultType={defaultType}
            defaultProject={defaultProject}
          />
        </div>
      </div>
    </section>
  );
}
