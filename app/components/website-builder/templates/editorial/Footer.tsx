import Link from "next/link";

import type { PhotographerWebsiteData } from "../types";

type EditorialFooterProps = {
  photographer: PhotographerWebsiteData;
};

export function EditorialFooter({ photographer }: EditorialFooterProps) {
  return (
    <footer className="border-t border-neutral-200 bg-[#f3efe8] px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-3xl text-neutral-900">{photographer.name}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-neutral-500">Editorial photography</p>
        </div>

        <nav className="flex flex-wrap gap-5 text-xs uppercase tracking-[0.22em] text-neutral-600">
          <Link href="#portfolio">Portfolio</Link>
          <Link href="#about">About</Link>
          <Link href="#services">Services</Link>
          <Link href="#contact">Contact</Link>
        </nav>

        <div className="text-sm text-neutral-600">
          {photographer.instagram ? (
            <a href={photographer.instagram} className="mr-4 hover:text-neutral-900">
              Instagram
            </a>
          ) : null}
          <span>© {new Date().getFullYear()} LensConnect</span>
        </div>
      </div>
    </footer>
  );
}
