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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12">
        <Link href="#top" className="font-serif text-2xl tracking-tight text-neutral-900">
          {name}
        </Link>

        <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.22em] text-neutral-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-neutral-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href={bookingUrl}
            className="inline-flex items-center border border-neutral-900 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            Book a Session
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-neutral-200 bg-[#f9f6f0] px-6 py-4 md:hidden">
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
