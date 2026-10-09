"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Camera,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PlusSquare,
  Search,
  Shield,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { link } from "fs/promises";

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const displayName = user?.fullname?.trim() || "LensConnect user";
  const { data: profileImageUrl } = useQuery({
    queryKey: ["profile-image", user?.id],
    enabled: Boolean(user?.id) && !isLoading,
    staleTime: 1000 * 60,
    queryFn: async () => {
      const response = await fetch(`/api/profiles?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error("Could not load the profile photo.");
      }

      const data: { result?: { profile_image_url?: string | null } } =
        await response.json();
      return data.result?.profile_image_url || null;
    },
  });

  const dashboardHref = user?.role === "client"
    ? "/dashboard/client"
    : user?.role === "admin"
      ? "/admin"
      : "/dashboard";
  const navLinks = !user
    ? [
        { href: "/photographers", label: "Find Photographers", icon: Search },
        { href: "/#categories", label: "Explore Categories", icon: Camera },
        { href: "/#process-heading", label: "How It Works", icon: BriefcaseBusiness },
      ]
    : user.role === "client"
      ? [
          { href: "/photographers", label: "Find Photographers", icon: Search },
          { href: "/dashboard/client/post-job", label: "Post a Job", icon: PlusSquare },
          { href: "/dashboard/client/jobs", label: "Jobs", icon: BriefcaseBusiness },
          { href: "/messages", label: "Messages", icon: MessageSquare },
          { href: "/profile", label: "Profile", icon: UserRound },
          {href:"/discover", label:"Discover", icon:Search}
        ]
      : user.role === "photographer"
        ? [
            { href: "/photographers", label: "Find Photographers", icon: Search },
            { href: "/photographer/find-jobs", label: "Find Jobs", icon: BriefcaseBusiness },
            { href: "/applications", label: "Applications", icon: BriefcaseBusiness },
            { href: "/messages", label: "Messages", icon: MessageSquare },
            { href: "/profile", label: "Profile", icon: UserRound },
            {href:"/discover", label:"Discover", icon:Search}
          ]
        : [
            { href: "/admin", label: "Admin", icon: Shield },
            { href: "/profile", label: "Profile", icon: UserRound },
          ];

  const isActiveLink = (href: string) =>
    href.startsWith("/#")
      ? pathname === "/"
      : pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    router.push("/login");
  };

  const renderNavLink = (link: (typeof navLinks)[number], mobile = false) => {
    const Icon = link.icon;
    const active = isActiveLink(link.href);

    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={
          mobile
            ? `flex min-h-11 items-center  gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-secondary"
              }`
            : `inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-2 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                active
                  ? "text-forest"
                  : "text-muted-foreground hover:text-forest"
              }`
        }
      >
        {mobile && <Icon aria-hidden="true" className="size-4 shrink-0" />}
        {link.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          aria-label="LensConnect home"
          className="shrink-0 text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
        >
          <span className="font-sans text-[19px] font-extrabold tracking-[-0.06em]">
            lensconnect<span className="text-forest">.</span>
          </span>
        </Link>
    <nav
  aria-label="Main navigation"
  className="sm:hidden md:hidden lg:flex flex-1 items-center justify-center gap-1"
>
  {navLinks.map((link) => renderNavLink(link))}
</nav>




        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user && !isLoading ? (
            <>
              <Button
                asChild
                className="min-h-11 rounded-[7px] bg-forest px-5 text-[13px] font-semibold text-white hover:bg-forest-dark focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
              >
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    aria-label={`Open ${displayName}'s profile menu`}
                    className="size-11 overflow-hidden rounded-full border-line-strong bg-white p-0 text-sm font-semibold text-forest hover:bg-accent"
                  >
                    <Avatar className="size-full">
                      <AvatarImage
                        src={profileImageUrl || undefined}
                        alt={`${displayName} profile photo`}
                      />
                      <AvatarFallback className="bg-accent text-forest">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserRound aria-hidden="true" className="mr-2 size-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref}>
                      {user.role === "admin" ? (
                        <Shield aria-hidden="true" className="mr-2 size-4" />
                      ) : (
                        <LayoutDashboard aria-hidden="true" className="mr-2 size-4" />
                      )}
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut aria-hidden="true" className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden min-h-11 items-center px-2 text-sm font-medium text-ink-soft transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest sm:inline-flex"
              >
                Sign in
              </Link>
              <Button
                asChild
                className="min-h-11 rounded-[7px] bg-forest px-4 text-[13px] font-semibold text-white hover:bg-forest-dark focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 sm:px-5"
              >
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation menu"
                className="size-11 border-line text-ink lg:hidden"
              >
                <Menu aria-hidden="true" className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-paper">
              <SheetHeader>
                <SheetTitle className="text-left font-sans text-[19px] font-extrabold tracking-[-0.06em] text-ink">
                  lensconnect<span className="text-forest">.</span>
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    {renderNavLink(link, true)}
                  </SheetClose>
                ))}
                {user && (
                  <SheetClose asChild>
                    <Link
                      href={dashboardHref}
                      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-forest hover:bg-accent"
                    >
                      <LayoutDashboard aria-hidden="true" className="size-4 shrink-0" />
                      Dashboard
                    </Link>
                  </SheetClose>
                )}
                {!user && (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-ink hover:bg-secondary"
                      >
                        Sign in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/signup"
                        className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-forest hover:bg-accent"
                      >
                        Create an account
                      </Link>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
