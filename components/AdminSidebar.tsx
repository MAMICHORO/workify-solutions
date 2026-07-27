"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/vacancies", label: "Vacancies" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/workers", label: "Workers" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="adminNav">
      <div className="adminBrand">
        WORKIFY<span>SOLUTIONS</span>
      </div>

      <nav aria-label="Admin navigation">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              href={item.href}
              className={isActive ? "active" : undefined}
              aria-current={isActive ? "page" : undefined}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/" className="backSite">
        ← Public Website
      </Link>
    </aside>
  );
}
