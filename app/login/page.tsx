"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

type FormErrors = { email?: string; password?: string };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (field: keyof FormErrors, value: string) => {
    if (field === "email") setEmail(value);
    else setPassword(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const normalizedEmail = email.trim();
    if (!normalizedEmail) nextErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsLoading(true);
    try {
      const signedInUser = await login(normalizedEmail, password);
      toast.success("You’re signed in.");
      router.replace(signedInUser.role === "client" ? "/dashboard/client" : "/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "We couldn’t log you in. Try again.";
      setErrors({ email: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex min-h-[72px] max-w-[1320px] items-center justify-between gap-5 px-5 sm:px-8">
          <Link href="/" aria-label="LensConnect home" className="inline-flex min-h-11 items-center gap-2.5 text-[18px] font-semibold tracking-[-0.055em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-white"><Image src="/logo.png" alt="" width={40} height={40} className="size-full object-cover" /></span>
            <span>LensConnect</span>
          </Link>
          <Link href="/photographers" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline-offset-4 hover:text-forest hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest">
            Browse photographers<ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-145px)] max-w-[1320px] grid-cols-1 items-center gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(360px,0.86fr)_minmax(0,1.14fr)] lg:gap-14 lg:py-12">
        <section aria-labelledby="sign-in-title" className="order-1 mx-auto w-full max-w-[470px] py-3 lg:mx-0 lg:py-12">
          <div className="mb-9">
            <p className="mb-4 text-sm font-medium text-forest">Your LensConnect account</p>
            <h1 id="sign-in-title" className="font-serif text-[44px] leading-[1.03] tracking-[-0.045em] sm:text-[52px]">Welcome back.</h1>
            <p className="mt-3 max-w-[390px] text-[15px] leading-6 text-muted-foreground">Log in to continue to your bookings and photography work.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-label="Log in to LensConnect" className="space-y-5">
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm font-semibold">Email address</Label>
              <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={email} onChange={(event) => handleChange("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={`email-hint${errors.email ? " sign-in-error" : ""}`} className="h-[52px] rounded-[6px] border-line-strong bg-white px-4 text-[15px] focus-visible:border-forest focus-visible:ring-forest/25" />
              <p id="email-hint" className="mt-2 text-[13px] text-muted-foreground">Use the email address on your account.</p>
              {errors.email && <p id="sign-in-error" className="mt-2 border-l-2 border-[#8c352b] bg-[#f7ece9] px-3 py-2 text-[13px] leading-5 text-[#752a22]" role="alert">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => handleChange("password", event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} className="h-[52px] rounded-[6px] border-line-strong bg-white px-4 text-[15px] focus-visible:border-forest focus-visible:ring-forest/25" />
              {errors.password && <p id="password-error" className="mt-2 text-[13px] text-destructive" role="alert">{errors.password}</p>}
            </div>
            <Button type="submit" disabled={isLoading} className="min-h-[52px] w-full rounded-[6px] text-[15px] font-semibold">
              {isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}
              {isLoading ? "Logging in…" : "Log in"}
            </Button>
            <p className="-mt-2 inline-flex min-h-5 items-center gap-2 text-xs text-muted-foreground" aria-live="polite" role="status">
              {isLoading && <LoaderCircle className="size-3.5 animate-spin text-forest" aria-hidden="true" />}
              {isLoading ? "Signing in to your account…" : "Sign in with your LensConnect email and password."}
            </p>
          </form>

          <p className="mt-7 text-sm text-muted-foreground">New to LensConnect? <Link href="/signup" className="font-semibold text-forest underline underline-offset-4 hover:text-forest-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">Create an account</Link></p>
          <div className="mt-8 border-t border-line pt-4 text-xs leading-5 text-muted-foreground">Clients and photographers continue to their respective dashboards after signing in.</div>
        </section>

        <figure className="order-2 relative mx-auto m-0 w-full max-w-[680px] lg:max-w-none">
          <div className="relative aspect-[1.18/0.94] overflow-hidden bg-wash sm:aspect-[1.25/0.9] lg:aspect-[0.94/1.05]">
            <Image src="/professional-portrait.png" alt="Illustrative studio portrait photography; not a LensConnect photographer portfolio" fill sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover object-[50%_39%]" priority />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#121714]/75 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
              <span className="text-[13px] leading-5">Illustrative portrait photography</span>
              <span className="max-w-[190px] text-right text-xs leading-[1.45]">Contextual photography, not a client portfolio.</span>
            </figcaption>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">A marketplace for people who make photographs and the people who need them.</p>
        </figure>
      </main>

      <footer className="mx-auto flex max-w-[1320px] flex-col gap-2 border-t border-line px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© 2026 LensConnect</span>
        <Link href="/" className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:text-forest hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">Return to home</Link>
      </footer>
    </div>
  );
}
