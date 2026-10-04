"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import styles from "./page.module.css";

const specialties = [
  { label: "Weddings", value: "Weddings" },
  { label: "Portraits", value: "Portraits" },
  { label: "Events", value: "Events" },
  { label: "Fashion", value: "Fashion" },
  { label: "Commercial", value: "Commercial" },
  { label: "Lifestyle", value: "Lifestyle" },
];

const categories = [
  {
    label: "Weddings",
    value: "Weddings",
    image: "/wedding-event-photography.png",
    imageAlt: "Illustrative wedding reception photography for this category",
    className: "col-span-2 row-span-2 md:col-span-3",
    subtitle: "For the day you’ll remember",
  },
  {
    label: "Portraits",
    value: "Portraits",
    image: "/professional-portrait.png",
    imageAlt: "Illustrative portrait photography for this category",
    className: "col-span-1 md:col-span-3",
  },
  {
    label: "Commercial",
    value: "Commercial",
    image: "/product-photography-studio.png",
    imageAlt: "Illustrative product photography for this category",
    className: "col-span-1 md:col-span-3",
  },
];

const processSteps = [
  {
    title: "Search by specialty and location",
    description: "Narrow the directory by the kind of photography you need, where you need it, and hourly rate.",
  },
  {
    title: "Compare portfolios and profile details",
    description: "Review selected work, specialties, experience, location, and listed hourly rate where available.",
  },
  {
    title: "Send a message or booking request",
    description: "Contact a photographer with your date, location, shoot type, and project notes.",
  },
];

const categoryMotion = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function HomePage() {
  const { user } = useAuth();
  const dashboardHref = user?.role === "photographer"
    ? "/dashboard"
    : user?.role === "client"
      ? "/dashboard/client"
      : "/admin";
  const joinHref = user ? dashboardHref : "/signup?role=photographer";
  const joinLabel = user?.role === "photographer"
    ? "Open photographer dashboard"
    : user?.role === "client"
      ? "Open client dashboard"
      : "Create a photographer profile";

  return (
    <div className={`${styles.landing} min-h-screen`}>
      <Header />
      <main>
        <section className="mx-auto max-w-[1320px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-[72px]" aria-labelledby="home-heading">
          <div className="grid items-center gap-9 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="order-1 max-w-[510px]">
              <p className="mb-4 text-sm font-medium text-(--lc-forest)">Photography, found with intention.</p>
              <h1 id="home-heading" className={`${styles.displayHeading} mb-5 max-w-[540px] text-[42px] font-semibold leading-[1.08] tracking-[-0.055em] text-(--lc-ink) sm:text-[52px] lg:text-[58px]`}>
                Find the right photographer for the moment.
              </h1>
              <p className="mb-8 max-w-[410px] text-base leading-[1.7] text-(--lc-muted)">
                Search portfolios by specialty and place. Compare a photographer’s work, then send an inquiry or booking request directly.
              </p>

              <form action="/photographers" method="get" aria-label="Find a photographer" className="border border-(--lc-field-line) bg-white p-4 shadow-[0_8px_28px_rgba(23,23,23,0.045)] sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label htmlFor="home-specialty" className="block min-w-0">
                    <span className="mb-1.5 block text-[13px] font-semibold text-(--lc-ink-soft)">Photography specialty</span>
                    <select id="home-specialty" name="specialty" defaultValue="" className="h-11 w-full border-0 border-b border-(--lc-field-line) bg-white px-0 text-sm text-(--lc-ink-soft) outline-none transition-colors focus-visible:border-(--lc-forest) focus-visible:ring-2 focus-visible:ring-(--lc-forest)/20">
                      <option value="">Choose a specialty</option>
                      {specialties.map((specialty) => <option key={specialty.value} value={specialty.value}>{specialty.label}</option>)}
                    </select>
                  </label>

                  <label htmlFor="home-location" className="block min-w-0">
                    <span className="mb-1.5 block text-[13px] font-semibold text-(--lc-ink-soft)">Location</span>
                    <span className="flex h-11 items-center gap-2 border-b border-(--lc-field-line) transition-colors focus-within:border-(--lc-forest) focus-within:ring-2 focus-within:ring-(--lc-forest)/20">
                      <MapPin aria-hidden="true" className="size-4 shrink-0 text-(--lc-muted)" />
                      <Input id="home-location" name="location" type="search" placeholder="City or region" className="h-11 rounded-none border-0 bg-transparent px-0 text-sm text-(--lc-ink) shadow-none outline-none placeholder:text-(--lc-muted) focus-visible:border-0 focus-visible:ring-2 focus-visible:ring-(--lc-forest)/35 focus-visible:ring-offset-2" />
                    </span>
                  </label>

                  <Button type="submit" className="h-11 min-h-11 w-full gap-2 rounded-[7px] bg-(--lc-forest) px-5 text-sm font-semibold text-white hover:bg-(--lc-forest-dark) focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--lc-forest) sm:col-span-2">
                    Find photographers
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
                <div className="mt-4 flex flex-col gap-2 border-t border-(--lc-line-soft) pt-3 text-[13px] text-(--lc-muted) sm:flex-row sm:items-center sm:justify-between">
                  <span>Start with a specialty and location. Refine results on the next page.</span>
                  <Link href="/photographers#smart-search" className="w-fit shrink-0 font-semibold text-(--lc-forest) underline underline-offset-4 hover:text-(--lc-forest-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--lc-forest)">
                    Describe your search
                  </Link>
                </div>
              </form>
            </motion.div>

            <motion.figure initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }} className="order-2 m-0 min-w-0">
              <div className="relative aspect-[1.17/1] overflow-hidden bg-(--lc-sand) sm:aspect-[1.28/1]">
                <Image src="/wedding-event-photography.png" alt="Illustrative wedding-event category photography, not a LensConnect photographer portfolio" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-[center_58%]" />
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-4 text-[13px] text-(--lc-muted)">
                <span>Wedding photography</span>
                <span className="hidden sm:inline">An example of the work you can discover</span>
              </figcaption>
            </motion.figure>
          </div>
        </section>

        <section id="categories" className="border-y border-(--lc-line) bg-(--lc-sand)" aria-labelledby="categories-heading">
          <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16 lg:py-[72px]">
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="categories-heading" className="text-[29px] font-semibold leading-tight tracking-[-0.045em] text-(--lc-ink) sm:text-[35px]">Start with the kind of work.</h2>
                <p className="mt-2 max-w-[520px] text-[15px] leading-6 text-(--lc-muted)">Browse by specialty, then compare photographers’ portfolios and details.</p>
              </div>
              <Link href="/photographers" className="inline-flex min-h-11 w-fit items-center gap-2 font-semibold text-(--lc-forest) hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--lc-forest)">
                Explore all photographers <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid auto-rows-[148px] grid-cols-2 gap-3 sm:auto-rows-[175px] sm:gap-4 md:grid-cols-6">
              {categories.map((category) => (
                <motion.div key={category.value} variants={categoryMotion} className={category.className}>
                  <Link href={`/photographers?specialty=${encodeURIComponent(category.value)}`} aria-label={`Explore ${category.label.toLowerCase()} photographers`} className="group relative block h-full min-h-full overflow-hidden bg-[#DADBD6] text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-(--lc-forest)">
                    <Image src={category.image} alt={category.imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#101510]/75 via-[#101510]/10 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
                      <span>
                        {category.subtitle && <span className="mb-1 block text-[13px] text-white">{category.subtitle}</span>}
                        <span className="block text-[22px] font-medium tracking-[-0.035em] sm:text-[28px]">{category.label}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" className="mb-1 size-[18px] shrink-0" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-(--lc-line) pt-5 text-sm">
              {specialties.slice(2, 4).concat(specialties.slice(5)).map((category) => (
                <Link key={category.value} href={`/photographers?specialty=${encodeURIComponent(category.value)}`} className="inline-flex min-h-11 items-center text-(--lc-ink-soft) hover:text-(--lc-forest) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--lc-forest)">
                  {category.label}<span aria-hidden="true" className="ml-1 text-(--lc-muted)">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-[76px]" aria-labelledby="process-heading">
          <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
            <div className="max-w-[360px]">
              <h2 id="process-heading" className="text-[30px] font-semibold leading-[1.15] tracking-[-0.045em] text-(--lc-ink) sm:text-[36px]">From a first search to a booking request.</h2>
              <p className="mt-4 text-[15px] leading-7 text-(--lc-muted)">Each photographer’s profile brings their work and available details together, so you can decide who to contact.</p>
            </div>
            <ol className="m-0 list-none divide-y divide-(--lc-line) p-0">
              {processSteps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[44px_1fr] gap-4 py-5 first:pt-0 last:pb-0">
                  <span aria-hidden="true" className="pt-0.5 text-sm font-semibold text-(--lc-forest)">0{index + 1}</span>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-(--lc-ink)">{step.title}</h3>
                    <p className="mt-1.5 max-w-[560px] text-sm leading-6 text-(--lc-muted)">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-(--lc-forest) text-(--lc-paper)" aria-labelledby="join-heading">
          <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:py-[68px]">
            <div className="max-w-[690px]">
              <h2 id="join-heading" className="text-[30px] font-semibold leading-[1.13] tracking-[-0.045em] sm:text-[39px]">
                {user?.role === "photographer" ? "Your portfolio, profile, and bookings in one place." : user?.role === "client" ? "Keep your photography projects moving." : "Make your next project easier to find."}
              </h2>
              <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-white/85">
                {user?.role === "photographer" ? "Update your portfolio and profile, or respond to client requests from your dashboard." : user?.role === "client" ? "Return to your dashboard to review requests, upcoming shoots, and job posts." : "Create a photographer profile with your specialties, location, experience, rates, and portfolio collections."}
              </p>
            </div>
            <Button asChild className="min-h-12 w-fit rounded-[7px] bg-(--lc-paper) px-5 text-sm font-semibold text-(--lc-forest) hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-(--lc-forest) focus-visible:ring-white">
              <Link href={joinHref}>{joinLabel}<ArrowUpRight aria-hidden="true" className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-(--lc-line) bg-(--lc-paper)">
        <div className="mx-auto max-w-[1320px] px-5 pb-7 pt-10 sm:px-8 lg:pt-12">
          <div className="grid gap-9 border-b border-(--lc-line) pb-9 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" aria-label="LensConnect home" className="font-sans text-[19px] font-extrabold tracking-[-0.06em] text-(--lc-ink)">lensconnect<span className="text-(--lc-forest)">.</span></Link>
              <p className="mt-3 max-w-[255px] text-sm leading-6 text-(--lc-muted-strong)">A place to find photography professionals and share your work.</p>
            </div>
            <nav aria-label="Discover links">
              <h3 className="text-[13px] font-semibold text-(--lc-ink)">Discover</h3>
              <ul className="mt-3 space-y-2.5 p-0 text-[13px]">
                <li><Link href="/photographers" className="text-(--lc-muted-strong) hover:text-(--lc-forest)">Photographers</Link></li>
                <li><Link href="#categories" className="text-(--lc-muted-strong) hover:text-(--lc-forest)">Categories</Link></li>
              </ul>
            </nav>
            <nav aria-label="Photographer links">
              <h3 className="text-[13px] font-semibold text-(--lc-ink)">For photographers</h3>
              <ul className="mt-3 space-y-2.5 p-0 text-[13px]">
                <li><Link href="/signup?role=photographer" className="text-(--lc-muted-strong) hover:text-(--lc-forest)">Create a profile</Link></li>
                <li><Link href="/login" className="text-(--lc-muted-strong) hover:text-(--lc-forest)">Sign in</Link></li>
              </ul>
            </nav>
            <nav aria-label="Account links">
              <h3 className="text-[13px] font-semibold text-(--lc-ink)">Your account</h3>
              <ul className="mt-3 space-y-2.5 p-0 text-[13px]">
                <li><Link href="/signup" className="text-(--lc-muted-strong) hover:text-(--lc-forest)">Create an account</Link></li>
                <li><Link href="/dashboard/client" className="text-(--lc-muted-strong) hover:text-(--lc-forest)">Client dashboard</Link></li>
              </ul>
            </nav>
          </div>
          <div className="flex flex-col gap-2 pt-5 text-[13px] text-(--lc-muted-strong) sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 LensConnect</span>
            <span>Built around the work, and the people behind it.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
