"use client";
import React, { useEffect, useState } from "react";
import { Header } from "@/components/client-header";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface PhotographerProfile {
  id: string;
  full_name: string;
  profile_image_url?: string;
}

interface PhotographerPortfolio {
  id: string;
  photographer_id: string;
  image_url: string[];
  location: string;
  title: string;
  description: string;
  category: string[];
  created_at: string;
  photographer_profiles?: PhotographerProfile;
}

const Page = () => {
  const [activeIndex, setActiveIndex] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<PhotographerPortfolio[]>([]);
  const [session, setSession] = useState<any>(null);

  const handleNext = (id: string, total: number) => {
    setActiveIndex((prev) => ({
      [id]: ((prev[id] ?? 0) + 1) % total,
    }));
  };

  const handlePrev = (id: string, total: number) => {
    setActiveIndex((prev) => ({
      [id]: ((prev[id] ?? 0) - 1 + total) % total,
    }));
  };

  const fetchPortfolios = async () => {
    setLoading(true);

    // Fetch portfolios
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("photographer_portfolio")
      .select(
        "id, photographer_id, image_url, category, title, description, location, created_at"
      )
      .order("created_at", { ascending: false });

    if (portfolioError) {
      console.error("❌ Portfolio fetch error:", portfolioError);
      setLoading(false);
      return;
    }

    if (!portfolioData || portfolioData.length === 0) {
      setPortfolios([]);
      setLoading(false);
      return;
    }

    // Get unique photographer IDs
    const photographerIds = [
      ...new Set(portfolioData.map((p) => p.photographer_id)),
    ];

    // Fetch all photographer profiles that match
    const { data: profileData, error: profileError } = await supabase
      .from("photographer_profiles")
      .select("id, full_name, profile_image_url")
      .in("id", photographerIds);

    if (profileError) {
      console.error("❌ Profile fetch error:", profileError);
    }

    // Merge portfolios and profiles
    const merged = portfolioData.map((p) => ({
      ...p,
      photographer_profiles: profileData?.find(
        (profile) => profile.id === p.photographer_id
      ),
    }));

    setPortfolios(merged);
    setLoading(false);
  };

  // 🟢 Load user session first
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();
  }, []);

  // Fetch portfolios after login
  useEffect(() => {
    if (session) fetchPortfolios();
  }, [session]);

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen">
      <Header />

      <div className="px-4">
        <div className="space-y-2 mt-6">
          <h1 className="text-4xl font-bold">Explore Gallery</h1>
          <p className="text-muted-foreground text-lg">
            Discover stunning photography work from talented photographers
          </p>
        </div>

        <div className="mt-12">
          {!session ? (
            <div className="text-center text-gray-500 py-20">
              Please <span className="text-blue-600 font-medium">sign in</span>{" "}
              to view portfolios.
            </div>
          ) : loading ? (
            // Skeleton loader
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <p>No works uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {portfolios.map((item) => {
                const currentIndex = activeIndex[item.id] || 0;
                const totalImages = item.image_url.length;

                return (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white"
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={item.image_url[currentIndex]}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0"
                          >
                            <Image
                              src={item.image_url[currentIndex]}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </motion.div>
                        </AnimatePresence>

                        {totalImages > 1 && (
                          <>
                            <button
                              onClick={() => handlePrev(item.id, totalImages)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleNext(item.id, totalImages)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-400">
                            📍 {item.location}
                          </span>
                          <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                            {Array.isArray(item.category)
                              ? item.category.join(", ")
                              : item.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2 px-4 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                            {item.photographer_profiles?.profile_image_url ? (
                              <Image
                                src={
                                  item.photographer_profiles.profile_image_url
                                }
                                alt={item.photographer_profiles.full_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-gray-400 text-xs">
                                ?
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {item.photographer_profiles?.full_name ||
                              "Unknown Photographer"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
