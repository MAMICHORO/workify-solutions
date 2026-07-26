import Link from "next/link";

const services = [
  ["Residential construction", "New homes, extensions, structural upgrades and finishing works."],
  ["Commercial construction", "Retail, office, hospitality, institutional and mixed-use spaces."],
  ["Renovation and fit-out", "Interior transformation, repairs, remodeling and phased upgrades."],
  ["Civil and structural works", "Concrete, masonry, drainage, external works and site infrastructure."],
  ["Project supervision", "Site coordination, quality checks, reporting and workforce oversight."],
  ["Materials and labour planning", "Practical support for quantities, procurement scheduling and labour allocation."]
];

export default function ServicesPage() {
  return (
    <section className="pageHero section">
      <div className="container">
        <div className="eyebrow">FULL CONSTRUCTION DELIVERY</div>
        <h1 className="pageTitle">One accountable team from scope to handover.</h1>
        <p className="sectionLead narrow">
          Designed for clients who want a capable partner to coordinate the whole build,
          not just supply individual trades.
        </p>
        <div className="detailGrid">
          {services.map(([title, text], i) => (
            <article className="detailCard" key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="ctaInline">
          <div>
            <h2>Have drawings, a BOQ or only an idea?</h2>
            <p>Send what you have and we will help structure the next conversation.</p>
          </div>
          <Link href="/contact" className="btn btnPrimary">Discuss your project</Link>
        </div>
      </div>
    </section>
  );
}
