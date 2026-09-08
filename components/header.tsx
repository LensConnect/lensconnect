"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Camera,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Search,
  PlusSquare,
  MessageSquare,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const isActiveLink = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    router.push("/login");
  };

  const currentRole = user?.role || "guest";
  const displayName = user?.fullname || "User";

  const navLinks = [
    { href: "/photographers", label: "Find Photographers", roles: ["client", "photographer"], icon: Search },
    { href: "/photographer/find-jobs", label: "Find Jobs", roles: ["photographer"], icon: Search },
    { href: "/dashboard/client/post-job", label: "Post a Job", roles: ["client"], icon: PlusSquare },
    { href: "/how-it-works", label: "How It Works", roles: ["client", "photographer"], icon: Camera },
    { href: "/dashboard/client", label: "Dashboard", roles: ["client"], icon: LayoutDashboard },
    { href: "/dashboard/client/jobs", label: "Jobs", roles: ["client"], icon: Briefcase },
    { href: "/dashboard", label: "Dashboard", roles: ["photographer"], icon: LayoutDashboard },
    { href: "/admin", label: "Admin", roles: ["admin"], icon: Shield },
    { href: "/applications", label: "Applications", roles: ["photographer"], icon: Briefcase },
    { href: "/messages", label: "Messages", roles: ["client", "photographer"], icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border py-2">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 transition-transform hover:scale-105">
          <Image
            src="/logo.png"
            alt="LensConnect Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-xl sm:text-2xl font-black tracking-tight uppercase">LensConnect</span>
        </Link>

        <nav className=" md:hidden  lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center max-w-2xl overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navLinks.map((link) => {
            if (!link.roles.includes(currentRole)) return null;
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap shrink-0 text-sm font-bold tracking-tight transition-all px-3 xl:px-4 py-2 rounded-full ${
                  active
                    ? "text-primary bg-primary/5"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button className="hidden xl:flex p-2 hover:bg-muted rounded-full transition-colors">
            <Search className="h-5 w-5 text-foreground/60" />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-xl border-border/50">
                <div className="flex items-center justify-start gap-2 p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg m-1">
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === "photographer" && (
                  <DropdownMenuItem asChild className="rounded-lg m-1">
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "client" && (
                  <DropdownMenuItem asChild className="rounded-lg m-1">
                    <Link href="/dashboard/client" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild className="rounded-lg m-1">
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive rounded-lg m-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex font-bold rounded-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4 sm:px-8 h-11 sm:h-12 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                <Link href="/signup">
                  Sign up <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt="LensConnect Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                  LensConnect
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => {
                  if (!link.roles.includes(currentRole)) return null;
                  const active = isActiveLink(link.href);
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={`text-base p-3 font-medium transition-colors flex items-center gap-3 rounded-lg ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground/80 hover:text-foreground"
                        }`}
                      >
                        <link.icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                {!user && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <SheetClose asChild>
                      <Link href="/login" className="flex items-center gap-2 text-base font-medium">
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/signup" className="flex items-center gap-2 text-base font-medium text-primary">
                        Sign up
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
