import Image from "next/image";
import Link from "next/link";

import LogoSquare from "../../public/logo.png";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
  /** When true, hides the wordmark at md breakpoint to prevent header collision */
  responsiveWordmark?: boolean;
};

export function Logo({
  className,
  size = 44,
  responsiveWordmark = true,
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Nexol Media — home"
      className={cn(
        "group inline-flex items-center gap-3 select-none",
        className
      )}
    >
      <span
        className="inline-flex overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: 12,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Image
          src={LogoSquare}
          alt=""
          width={size}
          height={size}
          priority
          className="h-full w-full object-cover
                     motion-safe:transition-transform motion-safe:duration-300
                     motion-safe:group-hover:rotate-[-4deg] motion-safe:group-hover:scale-[1.04]"
        />
      </span>
      <span
        className={cn(
          "font-sans text-[17px] font-semibold tracking-[-0.01em] text-foreground",
          responsiveWordmark && "hidden sm:inline md:hidden lg:inline"
        )}
      >
        Nexol Media
      </span>
    </Link>
  );
}
