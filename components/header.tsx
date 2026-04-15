"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

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
  PlusSquare,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'


interface UserProfile {
id?:string;
  email: string;
  full_name: string;
  profile_image_url: string;
  role?: string;
}




export function Header() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.refresh();
    router.push("/login");
  };




  const { data: profileData } = useQuery({
    queryKey: ['profile', authUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_image_url, email, full_name, role')
        .eq('id', authUser?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!authUser?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const queryClient = useQueryClient();

  const currentRole = profileData?.role || authUser?.role || "guest";

  const { data: applicationCount } = useQuery({
    queryKey: ['applications-count', authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return 0;
      const { count, error } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('photographer_id', authUser?.id)
        .eq('is_read', false);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!authUser?.id && currentRole === 'photographer',
  });

  const {data: messagesCount} = useQuery({
    queryKey:['messages-count', authUser?.id],
    queryFn: async() =>{
      if(!authUser?.id) return 0;
      console.log('[Header] Fetching unread count for:', authUser.id);
      const {count, error} = await supabase.from('messages').select('*', {count: 'exact', head: true}).eq('receiver_id', authUser?.id).eq('is_read', false)
      if(error) throw error;
      console.log('[Header] Unread count result:', count);
      return count || 0;
    },
    enabled: !!authUser?.id,
    refetchInterval: 30000,
    staleTime: 0,
  })

  // Real-time subscriptions for immediate badge updates
  useEffect(() => {
    if (!authUser?.id) return;

    const channel = supabase
      .channel('header-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${authUser.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages-count', authUser.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `photographer_id=eq.${authUser.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['applications-count', authUser.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser?.id, queryClient]);

  const navLinks = [
    { href: "/photographers", label: "Find Photographers", roles: ["client", "photographer", ], icon: Search },
    { href: "/photographer/find-jobs", label: "Find Jobs", roles: ["photographer"], icon: Search },
    { href: "/dashboard/client/post-job", label: "Post a Job", roles: ["client"], icon: PlusSquare },
    { href: "/how-it-works", label: "How It Works", roles: ["client", "photographer"], icon: Camera }, // Placeholder icon
    { href: "/dashboard/client", label: "Dashboard", roles: ["client"], icon: LayoutDashboard },
    {href:"/dashboard/client/jobs", label:"Jobs", roles:["client"], icon:Briefcase},
    { href: "/dashboard", label: "Dashboard", roles: ["photographer"], icon: LayoutDashboard },
    { href: "/admin", label: "Admin", roles: ["admin"], icon: Shield },
    {href:'/applications', label:'Applications', roles:["photographer"], icon:Briefcase},
    {href:"/messages", label:"Messages", roles:["client", "photographer"], icon:MessageSquare}
  ];



  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">LensConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 min-w-0 mx-4 items-center justify-end md:justify-center gap-1 lg:gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navLinks.map((link) => {
            if (!link.roles.includes(currentRole)) return null;
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap shrink-0 text-[13px] lg:text-sm font-medium transition-colors px-2 lg:px-3 py-2 rounded-md relative flex items-center gap-1.5 ${
                  active 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
                {link.href === '/applications' && applicationCount != null && applicationCount > 0 && (
                  <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                    {applicationCount}
                  </Badge>
                )}
                {link.href === '/messages' && messagesCount != null && messagesCount > 0 && (
                  <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                    {messagesCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {profileData ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={profileData.profile_image_url || "/placeholder.svg"}
                      alt={profileData.full_name}
                    />
                    <AvatarFallback>{profileData.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profileData.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profileData.email}
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
                {profileData.role === "photographer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {profileData.role === "client" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/client" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {profileData.role === "admin" && (
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
                        {link.href === '/applications' && applicationCount != null && applicationCount > 0 && (
                          <Badge className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                            {applicationCount}
                          </Badge>
                        )}
                        {link.href === '/messages' && messagesCount != null && messagesCount > 0 && (
                          <Badge className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                            {messagesCount}
                          </Badge>
                        )}
                      </Link>
                    </SheetClose>
                  );
                })}
                {!profileData && (
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
