import type { PhotographerWebsiteData } from "../types";

type EditorialContactProps = {
  photographer: PhotographerWebsiteData;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
};

export function EditorialContact({ photographer, email, phone, instagram }: EditorialContactProps) {
  const contactEmail = email || photographer.email || "hello@lensconnect.com";
  const contactInstagram = instagram || photographer.instagram;

  return (
    <section id="contact" className="bg-[#f8f4ee] px-5 py-16 @min-[48rem]:px-12 @min-[48rem]:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 @min-[48rem]:grid-cols-[0.9fr_1.1fr] @min-[48rem]:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Contact</p>
          <h2 className="mt-4 font-serif text-3xl @min-[48rem]:text-5xl @min-[64rem]:text-6xl">Let’s create your next story</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-700 @min-[48rem]:mt-6 @min-[48rem]:text-base @min-[48rem]:leading-8">
            Available for editorial commissions, portrait sessions, brand storytelling, and destination work.
          </p>
        </div>

        <div className="grid min-w-0 gap-6 border border-neutral-200 bg-white p-5 @min-[48rem]:grid-cols-2 @min-[48rem]:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Email</p>
            <a href={`mailto:${contactEmail}`} className="mt-3 block break-words text-base text-neutral-900 hover:text-neutral-600 @min-[48rem]:text-lg">
              {contactEmail}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Location</p>
            <p className="mt-3 break-words text-base text-neutral-900 @min-[48rem]:text-lg">{photographer.location || "Remote / Worldwide"}</p>
          </div>
          {phone ? (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Phone</p>
              <p className="mt-3 break-words text-base text-neutral-900 @min-[48rem]:text-lg">{phone}</p>
            </div>
          ) : null}
          {contactInstagram ? (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Instagram</p>
              <a href={contactInstagram} className="mt-3 block break-words text-base text-neutral-900 hover:text-neutral-600 @min-[48rem]:text-lg">
                @{contactInstagram.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").split("/").slice(-1)[0] || "instagram"}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
