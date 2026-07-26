import Link from "next/link";

export default function ServiceCard({
  number, title, text, items, href
}: {
  number: string;
  title: string;
  text: string;
  items: string[];
  href: string;
}) {
  return (
    <article className="serviceCard">
      <div className="serviceTop"><span>{number}</span><div className="serviceLine" /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>
      <Link href={href} className="textLink">Explore service →</Link>
    </article>
  );
}
