"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Camera, LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth-context";

type Role = "client" | "photographer";
type FormData = { fullname: string; email: string; password: string; confirmPassword: string; role: Role };
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function SignupPage() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");
  const defaultRole: Role = requestedRole === "photographer" ? "photographer" : "client";
  const [formData, setFormData] = useState<FormData>({ fullname: "", email: "", password: "", confirmPassword: "", role: defaultRole });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const fullname = formData.fullname.trim();
    const email = formData.email.trim();
    if (!fullname) nextErrors.fullname = "Full name is required.";
    if (!email) nextErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!formData.password) nextErrors.password = "Password is required.";
    else if (formData.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (!formData.confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsLoading(true);
    try {
      await signup(email, formData.password, fullname, formData.role);
      toast.success("Your account is ready.");
      router.replace(formData.role === "client" ? "/dashboard/client" : "/dashboard/setup");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Account creation failed. Try again.";
      setErrors((current) => ({ ...current, email: message }));
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />

      <main className="mx-auto grid max-w-[1320px] items-center gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:min-h-[calc(100dvh-145px)] lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:gap-16 lg:py-12">
        <figure className="order-2 relative m-0 hidden min-w-0 lg:block">
          <div className="relative aspect-[0.94/1] max-h-[750px] overflow-hidden bg-wash">
            <Image src="/professional-portrait.png" alt="Illustrative portrait photograph, not a LensConnect photographer profile" fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover object-[50%_35%]" priority />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#111914]/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
              <p className="mb-3 text-[13px] font-medium text-white/90">For the people behind the camera,</p>
              <p className="m-0 max-w-[490px] font-serif text-[34px] leading-[1.08] tracking-[-0.035em] sm:text-[42px]">and the people who need their work.</p>
            </div>
          </div>
          <figcaption className="mt-3 text-[13px] leading-5 text-muted-foreground">Illustrative portrait. Photographers add and manage their own portfolio work.</figcaption>
        </figure>

        <section aria-labelledby="create-account-title" className="order-1 mx-auto w-full max-w-[560px] py-2 sm:py-4 lg:mx-0 lg:justify-self-end">
          <h1 id="create-account-title" className="font-serif text-[38px] leading-[1.04] tracking-[-0.045em] sm:text-[46px]">Create your account</h1>
          <p className="mt-3 max-w-[500px] text-[15px] leading-6 text-muted-foreground">Create an account to hire a photographer or share your work with clients.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4" aria-label="Create a LensConnect account">
            <div className="space-y-1.5">
              <Label htmlFor="fullname" className="text-sm font-semibold">Full name</Label>
              <Input id="fullname" name="fullname" type="text" autoComplete="name" placeholder="Your full name" value={formData.fullname} onChange={(event) => handleChange("fullname", event.target.value)} aria-invalid={Boolean(errors.fullname)} aria-describedby={errors.fullname ? "fullname-error" : undefined} className="h-12 rounded-[6px] border-line-strong bg-white px-3.5 text-[15px] focus-visible:border-forest focus-visible:ring-forest/25" />
              {errors.fullname && <p id="fullname-error" className="text-[13px] text-destructive" role="alert">{errors.fullname}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
              <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={formData.email} onChange={(event) => handleChange("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} className="h-12 rounded-[6px] border-line-strong bg-white px-3.5 text-[15px] focus-visible:border-forest focus-visible:ring-forest/25" />
              {errors.email && <p id="email-error" className="text-[13px] text-destructive" role="alert">{errors.email}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={formData.password} onChange={(event) => handleChange("password", event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={`password-hint${errors.password ? " password-error" : ""}`} className="h-12 rounded-[6px] border-line-strong bg-white px-3.5 text-[15px] focus-visible:border-forest focus-visible:ring-forest/25" />
                <p id="password-hint" className="text-[13px] leading-5 text-muted-foreground">Must be at least 8 characters.</p>
                {errors.password && <p id="password-error" className="text-[13px] text-destructive" role="alert">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={(event) => handleChange("confirmPassword", event.target.value)} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined} className="h-12 rounded-[6px] border-line-strong bg-white px-3.5 text-[15px] focus-visible:border-forest focus-visible:ring-forest/25" />
                {errors.confirmPassword && <p id="confirm-password-error" className="text-[13px] text-destructive" role="alert">{errors.confirmPassword}</p>}
              </div>
            </div>

            <fieldset className="min-w-0 border-0 p-0 pt-1" aria-describedby={errors.role ? "role-error" : "role-context"}>
              <legend className="mb-2.5 text-sm font-semibold">I want to</legend>
              <RadioGroup value={formData.role} onValueChange={(value) => {
                if (value === "client" || value === "photographer") handleChange("role", value);
              }} aria-label="Choose your account type" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Label htmlFor="role-client" className={`flex min-h-14 cursor-pointer items-center gap-2.5 rounded-[6px] border px-3 text-sm font-medium leading-5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-forest ${formData.role === "client" ? "border-forest bg-accent text-accent-foreground" : "border-line-strong bg-white text-ink hover:border-forest/60"}`}>
                  <RadioGroupItem id="role-client" value="client" className="border-line-strong text-forest" />
                  <Search className="size-4 shrink-0 text-forest" aria-hidden="true" />
                  <span>Hire a photographer</span>
                </Label>
                <Label htmlFor="role-photographer" className={`flex min-h-14 cursor-pointer items-center gap-2.5 rounded-[6px] border px-3 text-sm font-medium leading-5 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-forest ${formData.role === "photographer" ? "border-forest bg-accent text-accent-foreground" : "border-line-strong bg-white text-ink hover:border-forest/60"}`}>
                  <RadioGroupItem id="role-photographer" value="photographer" className="border-line-strong text-forest" />
                  <Camera className="size-4 shrink-0 text-forest" aria-hidden="true" />
                  <span>Offer photography services</span>
                </Label>
              </RadioGroup>
              {errors.role && <p id="role-error" className="mt-2 text-[13px] text-destructive" role="alert">{errors.role}</p>}
              <p id="role-context" className="mb-0 mt-2 text-[13px] leading-5 text-muted-foreground">{formData.role === "photographer" ? "Photographer account selected." : "Choose the account type that best matches what you need."}</p>
            </fieldset>

            <Button type="submit" disabled={isLoading} className="mt-1 min-h-[50px] w-full rounded-[6px] px-5 text-[15px] font-semibold">
              {isLoading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <ArrowUpRight className="size-4" aria-hidden="true" />}
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
            <p className="flex min-h-5 items-center gap-2 border-t border-line pt-3.5 text-[13px] leading-5 text-muted-foreground" aria-live="polite" role="status">
              {isLoading && <LoaderCircle className="size-3.5 animate-spin text-forest" aria-hidden="true" />}
              {isLoading ? "Creating your account…" : "Your account is created securely with your email and password."}
            </p>
          </form>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-5 py-5 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link href="/" className="w-fit font-semibold tracking-[-0.04em] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">lensconnect<span className="text-forest">.</span></Link>
          <span>© 2026 LensConnect</span>
        </div>
      </footer>
    </div>
  );
}
