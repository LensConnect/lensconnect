"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import { WebsiteEditor } from "@/app/components/website-builder/WebsiteEditor";
import type {
  WebsitePortfolioItem,
  WebsiteTemplateProps,
} from "@/app/components/website-builder/templates/types";
import { useAuth } from "@/lib/auth-context";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
    return typeof parsed === "string" ? [parsed] : [];
  } catch {
    return [value];
  }
}

function portfolioFromResponse(value: unknown): WebsitePortfolioItem[] {
  if (!isRecord(value) || !Array.isArray(value.portfolios)) {
    throw new Error("The portfolio response was not in the expected format.");
  }

  return value.portfolios.flatMap((entry): WebsitePortfolioItem[] => {
    if (!isRecord(entry)) {
      return [];
    }

    const id = typeof entry.id === "string" || typeof entry.id === "number"
      ? String(entry.id)
      : undefined;
    const title = asString(entry.title);
    const imageUrls = asStringArray(entry.image_url);

    if (!id || !title) {
      return [];
    }

    return imageUrls.map((imageUrl, index) => ({
      id: imageUrls.length > 1 ? `${id}-${index}` : id,
      title,
      imageUrl,
      description: asString(entry.description),
      category: asStringArray(entry.category)[0],
      location: asString(entry.location),
    }));
  });
}

function errorMessage(value: unknown, fallback: string): string {
  if (isRecord(value)) {
    return asString(value.error) || asString(value.message) || fallback;
  }
  return fallback;
}

export default function WebsitePreviewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [websiteData, setWebsiteData] = useState<WebsiteTemplateProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "photographer") {
      setError("The website preview is available to photographer accounts.");
      setLoading(false);
      return;
    }

    const currentUser = user;
    let active = true;

    async function loadWebsite() {
      setLoading(true);
      setError(null);

      try {
        const profileResponse = await fetch(
          `/api/profiles?userId=${encodeURIComponent(currentUser.id)}`,
        );
        const profileResult: unknown = await profileResponse.json();
        const profile = isRecord(profileResult) && isRecord(profileResult.result)
          ? profileResult.result
          : null;
        const photographerProfileId = profile?.photographerProfileId;

        if (!profileResponse.ok || !profile || !photographerProfileId) {
          throw new Error(
            errorMessage(
              profileResult,
              "Complete your photographer profile before previewing your website.",
            ),
          );
        }

        const portfolioResponse = await fetch(
          `/api/portfolios?photographerId=${encodeURIComponent(String(photographerProfileId))}`,
        );
        const portfolioResult: unknown = await portfolioResponse.json();
        if (!portfolioResponse.ok) {
          throw new Error(
            errorMessage(portfolioResult, "Your portfolio could not be loaded."),
          );
        }

        const portfolio = portfolioFromResponse(portfolioResult);
        const name = asString(profile.fullname) || currentUser.fullname || "Photographer";
        const biography = asString(profile.bio) || "";
        const firstPortfolioId = portfolio[0]?.id ?? null;
        const profileId = String(photographerProfileId);
        const profilePath = `/photographer/${encodeURIComponent(name)}/${encodeURIComponent(profileId)}`;

        if (active) {
          setWebsiteData({
            photographer: {
              id: profileId,
              name,
              location: asString(profile.location),
              profileImage: asString(profile.profile_image_url) || null,
              biography,
              email: asString(profile.email) || currentUser.email,
              specialties: asStringArray(profile.specialties),
            },
            content: {
              theme: {
                backgroundColor: "#f8f7f4",
                textColor: "#191919",
                primaryColor: "#d9c2a5",
                accentColor: "#f3efe8",
                fontFamily: "serif",
              },
              sections: {
                hero: {
                  enabled: true,
                  heading: "Photography, with a personal point of view.",
                  description: biography || "Thoughtful photography for meaningful stories.",
                  ctaText: "Book a session",
                  imagePortfolioId: firstPortfolioId,
                },
                about: {
                  enabled: true,
                  biography,
                  imagePortfolioId: null,
                },
                portfolio: {
                  enabled: true,
                  title: "Selected work",
                  portfolioItemIds: portfolio.map((item) => item.id),
                },
                services: {
                  enabled: false,
                  serviceIds: [],
                },
                testimonials: {
                  enabled: false,
                },
                contact: {
                  enabled: true,
                  email: asString(profile.email) || currentUser.email,
                  phone: asString(profile.phoneNumber) || null,
                  instagram: null,
                },
              },
              sectionOrder: ["hero", "about", "portfolio", "services", "testimonials", "contact"],
            },
            portfolio,
            services: [],
            bookingUrl: profilePath,
          });
        }
      } catch (loadError) {
        console.error("Failed to load photographer website preview:", loadError);
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Your website preview could not be loaded.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWebsite();
    return () => {
      active = false;
    };
  }, [authLoading, router, user]);

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] text-neutral-700">
        <div className="flex items-center gap-3" role="status">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          <span>Loading your website preview…</span>
        </div>
      </main>
    );
  }

  if (error || !websiteData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 text-neutral-800">
        <div className="max-w-lg border border-neutral-200 bg-white p-8">
          <h1 className="font-serif text-3xl">Website preview unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {error || "Your website data could not be loaded."}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return <WebsiteEditor initialData={websiteData} />;
}
