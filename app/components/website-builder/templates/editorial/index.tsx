import type { WebsiteTemplateProps } from "../types";

import { EditorialAbout } from "./About";
import { EditorialContact } from "./Contact";
import { EditorialFooter } from "./Footer";
import { EditorialHeader } from "./Header";
import { EditorialHero } from "./Hero";
import { EditorialPortfolio } from "./Portfolio";
import { EditorialServices } from "./Services";
import { EditorialTestimonials } from "./Testimonials";

export default function EditorialTemplate({
  photographer,
  content,
  portfolio,
  services,
  testimonials,
  bookingUrl,
}: WebsiteTemplateProps) {
  const order = content.sectionOrder.length > 0 ? content.sectionOrder : ["hero", "about", "portfolio", "services", "testimonials", "contact"];

  const resolveHeroImage = (id: string | null) => {
    if (!id) {
      return portfolio[0]?.imageUrl || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80";
    }

    const match = portfolio.find((item) => item.id === id);
    return match?.imageUrl || portfolio[0]?.imageUrl || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80";
  };

  return (
    <main className="@container min-h-screen bg-[#f8f7f4] text-neutral-900">
      <EditorialHeader name={photographer.name} bookingUrl={bookingUrl} />

      {order.map((sectionKey) => {
        switch (sectionKey) {
          case "hero":
            if (!content.sections.hero.enabled) return null;
            return (
              <EditorialHero
                key="hero"
                name={photographer.name}
                heading={content.sections.hero.heading || "Stories with a quiet, cinematic pulse."}
                description={content.sections.hero.description || "I create intimate, elevated imagery that feels deeply personal."}
                ctaText={content.sections.hero.ctaText}
                image={resolveHeroImage(content.sections.hero.imagePortfolioId)}
                bookingUrl={bookingUrl}
                photographer={photographer}
              />
            );
          case "about":
            if (!content.sections.about.enabled) return null;
            return (
              <EditorialAbout
                key="about"
                photographer={photographer}
                content={content.sections.about}
                image={content.sections.about.imagePortfolioId
                  ? portfolio.find((item) => item.id === content.sections.about.imagePortfolioId)?.imageUrl
                  : photographer.profileImage}
              />
            );
          case "portfolio": {
            if (!content.sections.portfolio.enabled) return null;
            const selectedItems = portfolio.filter((item) =>
              content.sections.portfolio.portfolioItemIds.includes(item.id),
            );
            return <EditorialPortfolio key="portfolio" items={selectedItems} title={content.sections.portfolio.title} />;
          }
          case "services":
            if (!content.sections.services.enabled) return null;
            return <EditorialServices key="services" services={services} />;
          case "testimonials":
            if (!content.sections.testimonials.enabled || !testimonials || testimonials.length === 0) return null;
            return <EditorialTestimonials key="testimonials" testimonials={testimonials} />;
          case "contact":
            if (!content.sections.contact.enabled) return null;
            return (
              <EditorialContact
                key="contact"
                photographer={photographer}
                email={content.sections.contact.email ?? photographer.email}
                phone={content.sections.contact.phone ?? undefined}
                instagram={content.sections.contact.instagram ?? photographer.instagram}
              />
            );
          default:
            return null;
        }
      })}

      <EditorialFooter photographer={photographer} />
    </main>
  );
}
