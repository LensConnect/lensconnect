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
    <section id="contact" className="bg-[#f8f4ee] px-6 py-24 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Contact</p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">Let’s create your next story</h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-neutral-700">
            Available for editorial commissions, portrait sessions, brand storytelling, and destination work.
          </p>
        </div>

        <div className="grid gap-6 border border-neutral-200 bg-white p-8 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Email</p>
            <a href={`mailto:${contactEmail}`} className="mt-3 block text-lg text-neutral-900 hover:text-neutral-600">
              {contactEmail}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Location</p>
            <p className="mt-3 text-lg text-neutral-900">{photographer.location || "Remote / Worldwide"}</p>
          </div>
          {phone ? (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Phone</p>
              <p className="mt-3 text-lg text-neutral-900">{phone}</p>
            </div>
          ) : null}
          {contactInstagram ? (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Instagram</p>
              <a href={contactInstagram} className="mt-3 block text-lg text-neutral-900 hover:text-neutral-600">
                @{contactInstagram.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").split("/").slice(-1)[0] || "instagram"}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
