import Image from "next/image";

import type { PhotographerWebsiteData, WebsiteContent } from "../types";

type EditorialAboutProps = {
  photographer: PhotographerWebsiteData;
  content: WebsiteContent["sections"]["about"];
  image?: string | null;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";

export function EditorialAbout({ photographer, content, image }: EditorialAboutProps) {
  return (
    <section id="about" className="bg-[#f5f2ec] px-6 py-24 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200">
          <Image
            src={image || photographer.profileImage || fallbackImage}
            alt={photographer.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">About</p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">{photographer.name}</h2>

          <div className="mt-8 space-y-5 text-base leading-8 text-neutral-700">
            <p>{content.biography || photographer.biography || "Photographer crafting timeless stories through natural light, thoughtful direction, and documentary eye."}</p>
            <p>{photographer.location ? `Based in ${photographer.location}.` : "Available for destination and editorial work."}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {(photographer.specialties && photographer.specialties.length > 0
              ? photographer.specialties
              : ["Editorial", "Portrait", "Lifestyle", "Travel"]
            ).map((specialty) => (
              <span
                key={specialty}
                className="border border-neutral-300 bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-700"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
