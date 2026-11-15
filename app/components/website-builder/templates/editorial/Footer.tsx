import Link from "next/link";

import type { PhotographerWebsiteData } from "../types";

type EditorialFooterProps = {
  photographer: PhotographerWebsiteData;
};

export function EditorialFooter({ photographer }: EditorialFooterProps) {
  return (
    <footer className="border-t border-neutral-200 bg-[#f3efe8] px-5 py-10 @min-[48rem]:px-12 @min-[48rem]:py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 @min-[64rem]:flex-row @min-[64rem]:items-end @min-[64rem]:justify-between @min-[64rem]:gap-8">
        <div>
          <p className="font-serif text-2xl text-neutral-900 @min-[48rem]:text-3xl">{photographer.name}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.22em] text-neutral-500">Editorial photography</p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-[10px] uppercase tracking-[0.18em] text-neutral-600 @min-[48rem]:text-xs @min-[48rem]:tracking-[0.22em]">
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
