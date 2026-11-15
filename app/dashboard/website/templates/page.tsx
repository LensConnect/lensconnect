import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LayoutTemplate } from "lucide-react";

import { Header } from "@/components/header";

const availableTemplates = [
  {
    name: "Editorial",
    description:
      "A warm, minimal portfolio for photographers who want their images and stories to take center stage.",
    style: "Elegant · Cinematic · Photography-focused",
    href: "/dashboard/website/preview",
  },
];

export default function WebsiteTemplatesPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main className="mx-auto max-w-[1120px] px-5 pb-16 pt-9 sm:px-8 sm:pt-12">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Photographer dashboard
        </Link>

        <section className="mt-7 border-b border-line pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-forest">
            Website builder
          </p>
          <h1 className="mt-3 font-serif text-[38px] leading-tight tracking-[-0.04em] sm:text-5xl">
            Choose a website template
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            Select a design to preview your photographer website with your profile
            and portfolio. You can explore more template styles as they become
            available.
          </p>
        </section>

        <section aria-label="Available website templates" className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl">Available templates</h2>
            <span className="text-sm text-muted-foreground">
              {availableTemplates.length} available
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {availableTemplates.map((template) => (
              <article
                key={template.name}
                className="overflow-hidden border border-line-strong bg-white"
              >
                <div
                  aria-hidden="true"
                  className="relative min-h-[280px] overflow-hidden bg-[#f7f3eb] p-6 sm:p-8"
                >
                  <div className="absolute inset-x-6 top-5 flex items-center justify-between border-b border-[#d8d0c3] pb-3 text-[8px] uppercase tracking-[0.2em] text-[#61594f] sm:inset-x-8">
                    <span>Studio name</span>
                    <span>Portfolio&nbsp;&nbsp; About&nbsp;&nbsp; Contact</span>
                  </div>
                  <div className="mx-auto mt-12 grid max-w-[420px] grid-cols-[1fr_0.85fr] items-center gap-4 sm:gap-6">
                    <div className="py-4">
                      <p className="text-[7px] uppercase tracking-[0.22em] text-[#7a7064] sm:text-[8px]">
                        Photography &amp; Stories
                      </p>
                      <div className="mt-3 font-serif text-[25px] leading-[1.05] text-[#29251f] sm:text-[34px]">
                        Made to be
                        <br />
                        remembered.
                      </div>
                      <div className="mt-4 h-px w-12 bg-[#b79c72]" />
                      <div className="mt-4 h-2 w-4/5 bg-[#e2dbcf]" />
                      <div className="mt-2 h-2 w-3/5 bg-[#e2dbcf]" />
                      <div className="mt-5 h-6 w-20 border border-[#78664c] sm:w-24" />
                    </div>
                    <div className="aspect-[3/4] bg-[linear-gradient(145deg,#c7b9a2_0%,#8d806e_48%,#544d42_100%)] shadow-[0_12px_30px_rgba(54,44,32,0.12)]">
                      <div className="m-2 h-[calc(100%-1rem)] border border-white/40" />
                    </div>
                  </div>
                  <span className="absolute bottom-5 left-6 flex items-center gap-1.5 bg-white/90 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-[#50483e] sm:left-8">
                    <Check className="size-3" aria-hidden="true" />
                    Available now
                  </span>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <LayoutTemplate
                          className="size-4 text-forest"
                          aria-hidden="true"
                        />
                        <h3 className="font-serif text-2xl">{template.name}</h3>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {template.style}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-wash px-3 py-1 text-xs font-medium text-forest">
                      Available
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {template.description}
                  </p>

                  <Link
                    href={template.href}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                  >
                    Preview and use template
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
