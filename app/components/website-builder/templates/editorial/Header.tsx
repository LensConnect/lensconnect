"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

type EditorialHeaderProps = {
  name: string;
  bookingUrl: string;
};

export function EditorialHeader({ name, bookingUrl }: EditorialHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-neutral-200 bg-[#f9f6f0]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 @min-[48rem]:px-12 @min-[48rem]:py-5">
        <Link href="#top" className="min-w-0 truncate font-serif text-xl tracking-tight text-neutral-900 @min-[48rem]:text-2xl">
          {name}
        </Link>

        <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.18em] text-neutral-600 @min-[64rem]:flex @min-[64rem]:gap-8 @min-[64rem]:text-sm @min-[64rem]:tracking-[0.22em]">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-neutral-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden @min-[64rem]:block">
          <a
            href={bookingUrl}
            className="inline-flex items-center border border-neutral-900 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            Book a Session
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 @min-[64rem]:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-neutral-200 bg-[#f9f6f0] px-5 py-4 @min-[64rem]:hidden">
          <div className="flex flex-col gap-4 text-sm uppercase tracking-[0.18em] text-neutral-700">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <a href={bookingUrl} className="mt-2 inline-flex w-fit border border-neutral-900 px-4 py-3 text-[10px] tracking-[0.22em] text-neutral-900">
              Book a Session
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
