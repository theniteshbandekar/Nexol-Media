"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import type { NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  primaryNav: NavItem[];
  ctaLabel: string;
  ctaHref: string;
};

export function SiteHeader({
  primaryNav,
  ctaLabel,
  ctaHref,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      role="banner"
      className="fixed inset-x-0 z-50 flex items-center justify-between gap-4 pointer-events-none"
      style={{
        top: "clamp(14px, 1.5vw, 24px)",
        paddingLeft: "var(--page-gutter)",
        paddingRight: "var(--page-gutter)",
      }}
    >
      <div className="pointer-events-auto">
        <Logo />
      </div>

      <nav
        aria-label="Primary"
        className="hidden md:block pointer-events-auto"
      >
        <ul className="pill-nav">
          {primaryNav.map((item: NavItem) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-active={active || undefined}
                  className="pill-nav-item"
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2 pointer-events-auto">
        <Link
          href={ctaHref}
          className="btn-primary hidden sm:inline-flex"
        >
          {ctaLabel}
          <ArrowUpRight className="size-3.5" strokeWidth={2} />
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={cn(
                  "md:hidden h-11 w-11 rounded-full border border-border bg-white/85",
                  "backdrop-blur-md shadow-[var(--shadow-pill)]"
                )}
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Logo responsiveWordmark={false} />
              </SheetTitle>
            </SheetHeader>
            <nav
              aria-label="Mobile"
              className="mt-2 flex flex-col gap-1 px-4 pb-6"
            >
              {primaryNav.map((item: NavItem) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 text-[20px] font-medium text-foreground hover:bg-muted"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="btn-primary btn-primary-lg mt-4 justify-center"
              >
                {ctaLabel}
                <ArrowUpRight className="size-4" strokeWidth={2} />
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
