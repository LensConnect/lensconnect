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
    <section id="services" className="bg-[#f9f7f3] px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Services</p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">Tailored photography experiences</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="border border-neutral-200 bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
              <p className="text-xs uppercase tracking-[0.26em] text-neutral-500">{service.duration || "Session"}</p>
              <h3 className="mt-5 font-serif text-3xl text-neutral-900">{service.name}</h3>
              <p className="mt-5 text-base leading-7 text-neutral-600">{service.description}</p>
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
