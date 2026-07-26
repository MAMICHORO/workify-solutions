"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="footer">
      <div className="container footerGrid">

        {/* Company */}
        <div>
          <div className="brand">WORKIFY</div>
          <p>
            Connecting clients with trusted construction professionals and
            delivering reliable recruitment solutions across Kenya.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4>Services</h4>

          <Link href="/construction">
            Construction
          </Link>

          <Link href="/recruitment">
            Recruitment
          </Link>

          <Link href="/gallery">
            Gallery
          </Link>
        </div>

        {/* Company */}
        <div>
          <h4>Company</h4>

          <Link href="/projects">
            Projects
          </Link>

          <Link href="/jobs">
            Jobs
          </Link>

          <Link href="/about">
            About Us
          </Link>

          <Link href="/contact">
            Contact
          </Link>
        </div>

        {/* Contact */}
        <div>
          <h4>Contact</h4>

          <a href="tel:+254728043113">
            +254 728 043 113
          </a>

          <a href="mailto:workify.co.ke@gmail.com">
            workify.co.ke@gmail.com
          </a>

          <span>Nairobi, Kenya</span>
        </div>

      </div>

      <div className="container footerBottom">
        <span>
          © 2026 Workify Solutions Ltd. All Rights Reserved.
        </span>

        <span>
          Building projects. Connecting people. Creating opportunities.
        </span>
      </div>
    </footer>
  );
}