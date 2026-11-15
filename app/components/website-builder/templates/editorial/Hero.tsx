import Image from "next/image";
import type { PhotographerWebsiteData } from "../types";
type HeroProps = {
  name: string;
  heading: string;
  description: string;
  ctaText: string;
  image: string;
  bookingUrl: string;
  photographer:PhotographerWebsiteData;
};

export function EditorialHero({ name, heading, description, ctaText, photographer,image, bookingUrl }: HeroProps) {
  const safeImage = image || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80";

  return (
    <section className="bg-[#f8f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-14 @min-[48rem]:px-12 @min-[48rem]:py-24">
        <div className="grid grid-cols-1 items-center gap-10 @min-[48rem]:grid-cols-2 @min-[48rem]:gap-12">
          <div className="space-y-7">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Photography by {name}</p>
            <h1 className="break-words font-serif text-4xl leading-tight @min-[48rem]:text-6xl @min-[64rem]:text-7xl">{heading}</h1>
            <p className="max-w-md text-sm leading-7 text-neutral-600 @min-[48rem]:text-base @min-[48rem]:leading-8">{description}</p>

            <div className="flex flex-wrap gap-3 @min-[48rem]:gap-4">
              <a
                href={bookingUrl}
                className="inline-flex border border-neutral-900 px-5 py-3 text-[10px] uppercase tracking-[0.18em] transition hover:bg-neutral-900 hover:text-white @min-[48rem]:px-8 @min-[48rem]:py-4 @min-[48rem]:text-xs @min-[48rem]:tracking-[0.22em]"
              >
                {ctaText || "Book a Session"}
              </a>
              <a
                href="#portfolio"
                className="inline-flex border border-neutral-300 bg-white px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 @min-[48rem]:px-8 @min-[48rem]:py-4 @min-[48rem]:text-xs @min-[48rem]:tracking-[0.22em]"
              >
                View Portfolio
              </a>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={safeImage || photographer.profileImage || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"}
              alt={`${name} photography`}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
