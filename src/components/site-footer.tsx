import Link from "next/link";

import { Logo } from "@/components/logo";
import type { FooterLink } from "@/lib/sanity/site-settings";

type SiteFooterProps = {
  tagline: string;
  services: FooterLink[];
  company: FooterLink[];
  connect: FooterLink[];
  location: string;
  rights: string;
};

function renderLink(link: FooterLink) {
  if (link.external) {
    return (
      <li key={`${link.label}-${link.href}`}>
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      </li>
    );
  }
  return (
    <li key={`${link.label}-${link.href}`}>
      <Link href={link.href}>{link.label}</Link>
    </li>
  );
}

export function SiteFooter({
  tagline,
  services,
  company,
  connect,
  location,
  rights,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo responsiveWordmark={false} />
          <p>{tagline}</p>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>{services.map(renderLink)}</ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>{company.map(renderLink)}</ul>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <ul>{connect.map(renderLink)}</ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {year} Nexol Media · {rights}</span>
        <span>{location}</span>
      </div>
    </footer>
  );
}
