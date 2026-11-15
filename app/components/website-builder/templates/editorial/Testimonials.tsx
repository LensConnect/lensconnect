import type { WebsiteTestimonial } from "../types";

type EditorialTestimonialsProps = {
  testimonials?: WebsiteTestimonial[];
};

export function EditorialTestimonials({ testimonials }: EditorialTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Testimonials</p>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl">Kind words</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.id} className="border border-neutral-200 bg-[#f9f6f0] p-8">
              <p className="text-lg leading-8 text-neutral-700">“{testimonial.quote}”</p>
              <footer className="mt-6 border-t border-neutral-200 pt-5">
                <p className="font-medium text-neutral-900">{testimonial.author}</p>
                <p className="text-sm text-neutral-500">{testimonial.role || testimonial.location || "Client"}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
