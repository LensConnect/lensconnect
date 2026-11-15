export type WebsiteTemplateKey = "editorial";

export type WebsiteThemeConfig = {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  accentColor?: string;
  fontFamily?: "sans" | "serif";
};

export type WebsitePortfolioItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  location?: string;
};

export type WebsiteService = {
  id: string;
  name: string;
  description: string;
  price?: number;
  currency?: string;
  duration?: string;
};

export type WebsiteTestimonial = {
  id: string;
  quote: string;
  author: string;
  role?: string;
  location?: string;
};

export type PhotographerWebsiteData = {
  id?: string;
  name: string;
  slug?: string;
  location?: string;
  profileImage?: string | null;
  biography?: string;
  email?: string;
  instagram?: string;
  website?: string;
  specialties?: string[];
};

export type WebsiteSectionOrder =
  | "hero"
  | "about"
  | "portfolio"
  | "services"
  | "testimonials"
  | "contact";

export type WebsiteContent = {
  theme: WebsiteThemeConfig;
  sections: {
    hero: {
      enabled: boolean;
      heading: string;
      description: string;
      ctaText: string;
      imagePortfolioId: string | null;
    };
    about: {
      enabled: boolean;
      biography: string;
      imagePortfolioId: string | null;
    };
    portfolio: {
      enabled: boolean;
      title: string;
      portfolioItemIds: string[];
    };
    services: {
      enabled: boolean;
      serviceIds: string[];
    };
    testimonials: {
      enabled: boolean;
    };
    contact: {
      enabled: boolean;
      email?: string | null;
      phone?: string | null;
      instagram?: string | null;
    };
  };
  sectionOrder: WebsiteSectionOrder[];
};

export type WebsiteTemplateProps = {
  photographer: PhotographerWebsiteData;
  content: WebsiteContent;
  portfolio: WebsitePortfolioItem[];
  services: WebsiteService[];
  testimonials?: WebsiteTestimonial[];
  bookingUrl: string;
};