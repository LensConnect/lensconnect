"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Search,
} from "lucide-react";
import next from "next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface UserProfile {
  email: string;
  full_name: string;
  profile_image_url: string;
  role?: string;
}


export function Header() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    router.push("/login");
  };

  const fetchProfileImage = async () => {
    try {
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("profile_image_url, email, full_name, role")
        .eq("id", authUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      console.log("Fetched profile data:", profileData);

      if (profileData) {
        setUser({
          email: profileData.email,
          full_name: profileData.full_name,
          profile_image_url: profileData.profile_image_url,
          role: profileData.role,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileImage();
  }, []);


  const navLinks = [
    { href: "/search", label: "Find Photographers", roles: ["guest", "client", "photographer", "admin"], icon: Search },
    { href: "/how-it-works", label: "How It Works", roles: ["guest", "client", "photographer"], icon: Camera }, // Placeholder icon
    { href: "/client-dashboard", label: "Dashboard", roles: ["client"], icon: LayoutDashboard },
    { href: "/dashboard", label: "Dashboard", roles: ["photographer"], icon: LayoutDashboard },
    { href: "/admin", label: "Admin", roles: ["admin"], icon: Shield },
  ];

  const currentRole = user?.role || "guest";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">LensConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            if (!link.roles.includes(currentRole)) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.profile_image_url || "/placeholder.svg"}
                      alt={user.full_name}
                    />
                    <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === "photographer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-left flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  LensConnect
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => {
                  if (!link.roles.includes(currentRole)) return null;
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="text-base p-4 font-medium hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                {!user && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        Log in
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/signup"
                        className="flex items-center gap-2 text-base font-medium text-primary"
                      >
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
