import Image from "next/image";

import type { WebsitePortfolioItem } from "../types";

type PortfolioProps = {
  items: WebsitePortfolioItem[];
  title: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80";

export function EditorialPortfolio({ items, title }: PortfolioProps) {
  if (!items.length) {
    return (
      <section className="bg-white px-5 py-16 @min-[48rem]:px-12 @min-[48rem]:py-24">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Portfolio</p>
          <h2 className="mt-4 font-serif text-3xl @min-[48rem]:text-5xl @min-[64rem]:text-6xl">No portfolio pieces yet</h2>
          <p className="mt-5 text-sm leading-7 text-neutral-600 @min-[48rem]:text-base">Add photographs to this photographer profile to populate the gallery.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="bg-white px-5 py-16 @min-[48rem]:px-12 @min-[48rem]:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Selected Works</p>
          <h2 className="mt-4 font-serif text-3xl @min-[48rem]:text-5xl @min-[64rem]:text-6xl">{title || "Stories through my lens"}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 @min-[48rem]:grid-cols-2 @min-[48rem]:gap-5">
          {items.map((item) => (
            <article key={item.id} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
                <Image
                  src={item.imageUrl || fallbackImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 @min-[48rem]:mt-4">
                <h3 className="font-serif text-xl text-neutral-900 @min-[48rem]:text-2xl">{item.title}</h3>
                {item.category ? (
                  <span className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 @min-[48rem]:text-[10px] @min-[48rem]:tracking-[0.2em]">{item.category}</span>
                ) : null}
              </div>
              {item.description ? <p className="mt-2 text-sm leading-6 text-neutral-600 @min-[48rem]:text-base">{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
