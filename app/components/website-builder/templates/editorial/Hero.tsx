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
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-7">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Photography by {name}</p>
            <h1 className="font-serif text-5xl leading-tight md:text-7xl">{heading}</h1>
            <p className="max-w-md text-base leading-8 text-neutral-600">{description}</p>

            <div className="flex flex-wrap gap-4">
              <a
                href={bookingUrl}
                className="inline-flex border border-neutral-900 px-8 py-4 text-xs uppercase tracking-[0.22em] transition hover:bg-neutral-900 hover:text-white"
              >
                {ctaText || "Book a Session"}
              </a>
              <a
                href="#portfolio"
                className="inline-flex border border-neutral-300 bg-white px-8 py-4 text-xs uppercase tracking-[0.22em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
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
