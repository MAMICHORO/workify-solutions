export default function AboutPage() {
  return (
    <section className="pageHero section">
      <div className="container">
        <div className="eyebrow">ABOUT THE COMPANY</div>
        <h1 className="pageTitle">Built around accountability, skill and visible results.</h1>
        <div className="aboutGrid">
          <div>
            <p className="bigCopy">
              We help clients execute construction work through complete project delivery
              and flexible workforce deployment.
            </p>
          </div>
          <div className="bodyCopy">
            <p>
              Our approach is practical: understand the scope, identify the skills required,
              organize the site properly and communicate progress clearly.
            </p>
            <p>
              This interface is ready for your official company story, registration details,
              certifications, leadership profile, geographical coverage and completed-project evidence.
            </p>
          </div>
        </div>

        <div className="valuesGrid">
          {[
            ["01", "Accountability", "Clear responsibilities, documented scope and direct communication."],
            ["02", "Quality", "Workmanship standards supported by supervision and progress checks."],
            ["03", "Safety", "Site expectations, PPE requirements and risk awareness built into mobilization."],
            ["04", "Flexibility", "Choose full project delivery or workforce support based on your actual need."]
          ].map(([n, t, d]) => (
            <article className="valueCard" key={n}>
              <span>{n}</span><h3>{t}</h3><p>{d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
