import type { WebsiteService } from "../types";

type EditorialServicesProps = {
  services: WebsiteService[];
};

const formatCurrency = (price?: number, currency = "USD") => {
  if (typeof price !== "number" || Number.isNaN(price)) {
    return "Custom pricing";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
};

export function EditorialServices({ services }: EditorialServicesProps) {
  if (!services.length) {
    return null;
  }

  return (
    <section id="services" className="bg-[#f9f7f3] px-5 py-16 @min-[48rem]:px-12 @min-[48rem]:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Services</p>
          <h2 className="mt-4 font-serif text-3xl @min-[48rem]:text-5xl @min-[64rem]:text-6xl">Tailored photography experiences</h2>
        </div>

        <div className="grid gap-5 @min-[64rem]:grid-cols-3 @min-[64rem]:gap-6">
          {services.map((service) => (
            <article key={service.id} className="border border-neutral-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] @min-[48rem]:p-8">
              <p className="text-xs uppercase tracking-[0.26em] text-neutral-500">{service.duration || "Session"}</p>
              <h3 className="mt-4 font-serif text-2xl text-neutral-900 @min-[48rem]:mt-5 @min-[48rem]:text-3xl">{service.name}</h3>
              <p className="mt-4 text-sm leading-6 text-neutral-600 @min-[48rem]:mt-5 @min-[48rem]:text-base @min-[48rem]:leading-7">{service.description}</p>
              <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-5">
                <span className="text-xl font-medium text-neutral-900">
                  {formatCurrency(service.price, service.currency)}
                </span>
                <a href="#contact" className="text-xs uppercase tracking-[0.22em] text-neutral-900">
                  Inquire
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
