"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutTemplate,
  Mail,
  MessageSquare,
  Monitor,
  PanelBottom,
  PanelTop,
  Smartphone,
  Tablet,
  User,
  type LucideIcon,
} from "lucide-react";

import { WebsiteRenderer } from "@/app/components/website-builder/WebsiteRenderer";
import type {
  WebsiteContent,
  WebsiteSectionOrder,
  WebsiteTemplateProps,
} from "@/app/components/website-builder/templates/types";

type EditorSectionKey = "header" | WebsiteSectionOrder | "footer";
type PreviewMode = "desktop" | "tablet" | "mobile";

const sections: { id: EditorSectionKey; label: string; icon: LucideIcon }[] = [
  { id: "header", label: "Header", icon: PanelTop },
  { id: "hero", label: "Hero", icon: Camera },
  { id: "about", label: "About", icon: User },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "contact", label: "Contact", icon: Mail },
  { id: "footer", label: "Footer", icon: PanelBottom },
];

const previewModes: { id: PreviewMode; label: string; icon: LucideIcon }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

const contentSections: WebsiteSectionOrder[] = [
  "hero",
  "about",
  "portfolio",
  "services",
  "testimonials",
  "contact",
];

function isContentSection(section: EditorSectionKey): section is WebsiteSectionOrder {
  return contentSections.includes(section as WebsiteSectionOrder);
}

function SectionSettings({
  section,
  data,
  updateHero,
  updateAbout,
  updatePortfolio,
  updateContact,
}: {
  section: EditorSectionKey;
  data: WebsiteTemplateProps;
  updateHero: (patch: Partial<WebsiteContent["sections"]["hero"]>) => void;
  updateAbout: (patch: Partial<WebsiteContent["sections"]["about"]>) => void;
  updatePortfolio: (patch: Partial<WebsiteContent["sections"]["portfolio"]>) => void;
  updateContact: (patch: Partial<WebsiteContent["sections"]["contact"]>) => void;
}) {
  const { content, portfolio, photographer, services, testimonials } = data;
  const selectedAboutImage = content.sections.about.imagePortfolioId
    ? portfolio.find((item) => item.id === content.sections.about.imagePortfolioId)?.imageUrl
    : photographer.profileImage;

  if (section === "hero") {
    const hero = content.sections.hero;
    const selectedImage = portfolio.find((item) => item.id === hero.imagePortfolioId);

    return (
      <div className="space-y-5">
        <label className="block text-sm font-medium text-neutral-200">
          Heading
          <input
            value={hero.heading}
            onChange={(event) => updateHero({ heading: event.target.value })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none transition focus:border-[#d9c2a5] focus:ring-2 focus:ring-[#d9c2a5]/20"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-200">
          Description
          <textarea
            value={hero.description}
            onChange={(event) => updateHero({ description: event.target.value })}
            rows={4}
            className="mt-2 w-full resize-y border border-[#414141] bg-[#2b2b2b] px-3 py-2 text-sm leading-6 text-neutral-100 outline-none transition focus:border-[#d9c2a5] focus:ring-2 focus:ring-[#d9c2a5]/20"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-200">
          Button text
          <input
            value={hero.ctaText}
            onChange={(event) => updateHero({ ctaText: event.target.value })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none transition focus:border-[#d9c2a5] focus:ring-2 focus:ring-[#d9c2a5]/20"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-200">
          Hero image
          <select
            value={hero.imagePortfolioId ?? ""}
            onChange={(event) => updateHero({ imagePortfolioId: event.target.value || null })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none focus:border-[#d9c2a5]"
          >
            <option value="">First portfolio image</option>
            {portfolio.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
        {selectedImage ? (
          <div className="flex items-center gap-3 border border-[#414141] bg-[#2b2b2b] p-2">
            <Image
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              width={64}
              height={64}
              unoptimized
              className="size-16 object-cover"
            />
            <span className="min-w-0 text-xs text-neutral-300">{selectedImage.title}</span>
          </div>
        ) : null}
        {portfolio.length === 0 ? (
          <p className="text-xs leading-5 text-neutral-400">Add portfolio images to your profile to choose a hero image.</p>
        ) : null}
      </div>
    );
  }

  if (section === "about") {
    const about = content.sections.about;

    return (
      <div className="space-y-5">
        <label className="block text-sm font-medium text-neutral-200">
          Biography
          <textarea
            value={about.biography}
            onChange={(event) => updateAbout({ biography: event.target.value })}
            rows={7}
            className="mt-2 w-full resize-y border border-[#414141] bg-[#2b2b2b] px-3 py-2 text-sm leading-6 text-neutral-100 outline-none transition focus:border-[#d9c2a5] focus:ring-2 focus:ring-[#d9c2a5]/20"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-200">
          About image
          <select
            value={about.imagePortfolioId ?? ""}
            onChange={(event) => updateAbout({ imagePortfolioId: event.target.value || null })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none focus:border-[#d9c2a5]"
          >
            <option value="">Profile photo</option>
            {portfolio.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </label>
        {selectedAboutImage ? (
          <Image
            src={selectedAboutImage}
            alt="Selected About section"
            width={320}
            height={220}
            unoptimized
            className="aspect-[4/3] w-full border border-[#414141] object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center border border-dashed border-[#414141] bg-[#2b2b2b] text-xs text-neutral-400">
            No profile image selected
          </div>
        )}
      </div>
    );
  }

  if (section === "portfolio") {
    const portfolioSection = content.sections.portfolio;

    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-neutral-200">
          Display title
          <input
            value={portfolioSection.title}
            onChange={(event) => updatePortfolio({ title: event.target.value })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none focus:border-[#d9c2a5]"
          />
        </label>
        <p className="text-xs font-medium text-neutral-400">Displayed images</p>
        {portfolio.length === 0 ? (
          <p className="text-sm leading-6 text-neutral-400">No portfolio images are available yet.</p>
        ) : (
          <div className="space-y-2">
            {portfolio.map((item) => {
              const checked = portfolioSection.portfolioItemIds.includes(item.id);

              return (
                <label key={item.id} className="flex cursor-pointer items-center gap-3 border border-[#414141] bg-[#2b2b2b] p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const portfolioItemIds = checked
                        ? portfolioSection.portfolioItemIds.filter((id) => id !== item.id)
                        : [...portfolioSection.portfolioItemIds, item.id];
                      updatePortfolio({ portfolioItemIds });
                    }}
                    className="size-4 accent-[#d9c2a5]"
                  />
                  <Image
                    src={item.imageUrl}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                    className="size-11 object-cover"
                  />
                  <span className="min-w-0 truncate text-neutral-200">{item.title}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (section === "services") {
    return (
      <p className="text-sm leading-6 text-neutral-300">
        {services.length > 0
          ? "Service records are available in the preview, but service selection is not connected to an editor data source yet."
          : "Photographer service records are not loaded in this website preview yet."}
      </p>
    );
  }

  if (section === "testimonials") {
    return (
      <p className="text-sm leading-6 text-neutral-300">
        {testimonials?.length
          ? "Existing testimonials will appear when this section is enabled."
          : "No testimonial records are loaded for this website yet."}
      </p>
    );
  }

  if (section === "contact") {
    const contact = content.sections.contact;

    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-neutral-200">
          Email
          <input
            type="email"
            value={contact.email ?? ""}
            onChange={(event) => updateContact({ email: event.target.value })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none focus:border-[#d9c2a5]"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-200">
          Phone
          <input
            value={contact.phone ?? ""}
            onChange={(event) => updateContact({ phone: event.target.value || null })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none focus:border-[#d9c2a5]"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-200">
          Instagram
          <input
            value={contact.instagram ?? ""}
            onChange={(event) => updateContact({ instagram: event.target.value || null })}
            className="mt-2 min-h-10 w-full border border-[#414141] bg-[#2b2b2b] px-3 text-sm text-neutral-100 outline-none focus:border-[#d9c2a5]"
          />
        </label>
        <p className="text-xs leading-5 text-neutral-400">Contact edits are local to this preview and are not saved to your profile.</p>
      </div>
    );
  }

  return (
    <p className="text-sm leading-6 text-neutral-300">
      This template area is fixed and is not editable independently.
    </p>
  );
}

export function WebsiteEditor({ initialData }: { initialData: WebsiteTemplateProps }) {
  const [data, setData] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState<EditorSectionKey>("hero");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [previewOnly, setPreviewOnly] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateContent = (update: (content: WebsiteContent) => WebsiteContent) => {
    setData((current) => ({ ...current, content: update(current.content) }));
    setHasChanges(true);
  };

  const updateHero = (patch: Partial<WebsiteContent["sections"]["hero"]>) => {
    updateContent((content) => ({
      ...content,
      sections: { ...content.sections, hero: { ...content.sections.hero, ...patch } },
    }));
  };

  const updateAbout = (patch: Partial<WebsiteContent["sections"]["about"]>) => {
    updateContent((content) => ({
      ...content,
      sections: { ...content.sections, about: { ...content.sections.about, ...patch } },
    }));
  };

  const updatePortfolio = (patch: Partial<WebsiteContent["sections"]["portfolio"]>) => {
    updateContent((content) => ({
      ...content,
      sections: { ...content.sections, portfolio: { ...content.sections.portfolio, ...patch } },
    }));
  };

  const updateContact = (patch: Partial<WebsiteContent["sections"]["contact"]>) => {
    updateContent((content) => ({
      ...content,
      sections: { ...content.sections, contact: { ...content.sections.contact, ...patch } },
    }));
  };

  const setSectionEnabled = (section: WebsiteSectionOrder, enabled: boolean) => {
    updateContent((content) => ({
      ...content,
      sections: {
        ...content.sections,
        [section]: { ...content.sections[section], enabled },
      },
    }));
  };

  const moveSection = (section: WebsiteSectionOrder, direction: -1 | 1) => {
    updateContent((content) => {
      const sectionOrder = [...content.sectionOrder];
      const currentIndex = sectionOrder.indexOf(section);
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= sectionOrder.length) {
        return content;
      }

      [sectionOrder[currentIndex], sectionOrder[nextIndex]] = [
        sectionOrder[nextIndex],
        sectionOrder[currentIndex],
      ];
      return { ...content, sectionOrder };
    });
  };

  const sectionName = sections.find((item) => item.id === selectedSection)?.label || "Section";
  const previewWidth = previewMode === "tablet" ? "768px" : previewMode === "mobile" ? "390px" : "100%";

  return (
    <div className="flex min-h-dvh flex-col bg-[#171717] text-neutral-100">
      <header className="z-10 grid min-h-16 shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 border-b border-[#383838] bg-[#202020] px-2 py-2 sm:flex sm:gap-3 sm:px-5 sm:py-0">
        <Link
          href="/dashboard/website/templates"
          aria-label="Back to template selection"
          title="Back to template selection"
          className="flex size-9 shrink-0 items-center justify-center border border-[#414141] text-neutral-300 transition hover:bg-[#303030] hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden size-9 shrink-0 items-center justify-center bg-[#d9c2a5] text-neutral-900 sm:flex">
            <Camera className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{data.photographer.name}&apos;s website</p>
            <p className="flex items-center gap-1.5 text-xs text-neutral-400">
              <LayoutTemplate className="size-3" aria-hidden="true" />
              Editorial template
            </p>
          </div>
        </div>

        <div
          className="hidden shrink-0 items-center gap-2 text-xs text-neutral-300 sm:flex"
          aria-live="polite"
        >
          {hasChanges ? <span className="size-2 rounded-full bg-amber-500" /> : <Check className="size-3.5 text-neutral-500" aria-hidden="true" />}
          {hasChanges ? "Unsaved changes" : "Preview only"}
        </div>

        <div className="col-span-2 flex min-w-0 items-center justify-between gap-2 sm:contents">
          <div className="flex shrink-0 items-center border border-[#414141] bg-[#292929] p-0.5" aria-label="Preview size">
            {previewModes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={`${label} preview`}
                aria-pressed={previewMode === id}
                title={`${label} preview`}
                onClick={() => setPreviewMode(id)}
                className={`flex size-8 items-center justify-center transition ${previewMode === id ? "bg-[#d9c2a5] text-neutral-950" : "text-neutral-400 hover:bg-[#353535] hover:text-white"}`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPreviewOnly((current) => !current)}
            aria-label={previewOnly ? "Exit preview" : "Preview website"}
            title={previewOnly ? "Exit preview" : "Preview website"}
            className="inline-flex size-9 shrink-0 items-center justify-center border border-[#484848] text-xs font-medium text-neutral-200 transition hover:bg-[#303030] md:size-auto md:min-h-9 md:gap-2 md:px-3"
          >
            {previewOnly ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            <span className="hidden md:inline">{previewOnly ? "Exit preview" : "Preview website"}</span>
          </button>

          <button
            type="button"
            disabled
            title="Publishing is not available yet."
            className="min-h-9 shrink-0 bg-[#d9c2a5] px-3 text-xs font-semibold text-neutral-900 opacity-50 sm:px-4"
          >
            Publish
          </button>
        </div>
      </header>

      <div className={previewOnly
        ? "grid min-h-0 min-w-0 flex-1 grid-cols-1"
        : "grid min-h-0 min-w-0 flex-1 grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[224px_minmax(0,1fr)_312px]"}
      >
        {!previewOnly ? (
          <aside className="order-1 flex min-h-0 min-w-0 flex-col border-b border-[#383838] bg-[#222222] md:col-start-1 md:row-span-2 md:row-start-1 md:border-r md:border-b-0 lg:order-none lg:row-span-1">
            <div className="shrink-0 border-b border-[#383838] px-3 py-3 md:px-4 md:py-4">
              <h1 className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Website sections</h1>
            </div>
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto p-2 md:min-h-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto">
              {sections.map(({ id, label, icon: Icon }) => {
                const isSelected = selectedSection === id;
                const hasContent = isContentSection(id);
                const enabled = hasContent ? data.content.sections[id].enabled : true;
                const sectionIndex = hasContent ? data.content.sectionOrder.indexOf(id) : -1;

                return (
                  <div
                    key={id}
                    className={`mb-1 flex min-h-10 min-w-fit shrink-0 items-center gap-1 border transition md:w-full md:min-w-0 ${isSelected ? "border-[#514a40] bg-[#34312d]" : "border-transparent hover:bg-[#2d2d2d]"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSection(id)}
                      aria-pressed={isSelected}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm text-neutral-200"
                    >
                      <Icon className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
                      <span className={`size-1.5 shrink-0 rounded-full ${enabled ? "bg-[#a9b79b]" : "bg-neutral-600"}`} aria-label={enabled ? "Enabled" : "Disabled"} />
                    </button>
                    {hasContent ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSectionEnabled(id, !enabled)}
                          aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
                          title={`${enabled ? "Disable" : "Enable"} ${label}`}
                          className="flex size-7 shrink-0 items-center justify-center text-neutral-400 hover:text-white"
                        >
                          {enabled ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                        </button>
                        <div className="mr-1 flex shrink-0 flex-col">
                          <button
                            type="button"
                            disabled={sectionIndex <= 0}
                            onClick={() => moveSection(id, -1)}
                            aria-label={`Move ${label} up`}
                            className="flex size-4 items-center justify-center text-neutral-500 hover:text-white disabled:opacity-30"
                          >
                            <ChevronUp className="size-3" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={sectionIndex < 0 || sectionIndex >= data.content.sectionOrder.length - 1}
                            onClick={() => moveSection(id, 1)}
                            aria-label={`Move ${label} down`}
                            className="flex size-4 items-center justify-center text-neutral-500 hover:text-white disabled:opacity-30"
                          >
                            <ChevronDown className="size-3" aria-hidden="true" />
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="hidden border-t border-[#383838] p-3 md:block">
              <Link href="/dashboard/website/templates" className="flex min-h-9 items-center gap-2 px-2 text-xs font-medium text-neutral-400 hover:text-white">
                <LayoutTemplate className="size-4" aria-hidden="true" />
                Change template
              </Link>
            </div>
          </aside>
        ) : null}

        <main className="order-3 flex min-h-[65vh] min-w-0 flex-col bg-[#191919] md:col-start-2 md:row-start-1 md:order-none md:min-h-0 lg:overflow-hidden">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#383838] bg-[#242424] px-3 text-xs text-neutral-400 sm:px-4">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2 rounded-full bg-[#a9b79b]" />
              <span className="truncate">{data.photographer.name}&apos;s website</span>
            </span>
            {previewOnly ? (
              <button type="button" onClick={() => setPreviewOnly(false)} className="ml-2 inline-flex items-center gap-1 font-medium text-neutral-200 md:hidden">
                <EyeOff className="size-3.5" aria-hidden="true" />
                Edit
              </button>
            ) : (
              <span className="ml-2 inline-flex items-center gap-1">
                {previewMode === "desktop" ? "Desktop" : previewMode === "tablet" ? "Tablet" : "Mobile"}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
            <div
              className="mx-auto min-h-full overflow-hidden bg-[#f8f7f4] shadow-[0_8px_32px_rgba(0,0,0,0.28)] ring-1 ring-white/10 transition-[width] duration-300"
              style={{ width: previewWidth, maxWidth: "100%" }}
            >
              <WebsiteRenderer template="editorial" data={data} />
            </div>
          </div>
        </main>

        {!previewOnly ? (
          <aside className="order-2 min-h-0 min-w-0 border-b border-[#383838] bg-[#222222] md:col-start-2 md:row-start-2 md:order-none md:border-l md:border-b-0 lg:col-auto lg:row-auto">
            <div className="flex min-h-14 items-center justify-between border-b border-[#383838] px-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Section settings</p>
                <h2 className="mt-0.5 text-sm font-semibold text-neutral-100">{sectionName}</h2>
              </div>
              {isContentSection(selectedSection) ? (
                <button
                  type="button"
                  onClick={() => setSectionEnabled(selectedSection, !data.content.sections[selectedSection].enabled)}
                  className={`min-h-8 border px-2.5 text-xs font-medium ${data.content.sections[selectedSection].enabled ? "border-[#484848] text-neutral-300 hover:bg-[#303030]" : "border-[#d9c2a5] bg-[#d9c2a5] text-neutral-950"}`}
                >
                  {data.content.sections[selectedSection].enabled ? "Enabled" : "Enable section"}
                </button>
              ) : null}
            </div>
            <div className="overflow-visible p-4 sm:p-5 lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto">
              <SectionSettings
                section={selectedSection}
                data={data}
                updateHero={updateHero}
                updateAbout={updateAbout}
                updatePortfolio={updatePortfolio}
                updateContact={updateContact}
              />
            </div>
            <div className="border-t border-[#383838] px-4 py-3">
              <p className="text-xs leading-5 text-neutral-400">Your edits update this preview immediately. They are not saved yet.</p>
            </div>
          </aside>
        ) : null}
      </div>

      <div className="sr-only" aria-live="polite">
        {hasChanges ? "Website draft has unsaved local changes" : "Website preview is not saved"}
      </div>
    </div>
  );
}