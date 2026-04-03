"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";


interface FormData {
  image_url: string[];
  title: string;
  location: string;
  description: string;
  category: string[];
}

interface FormErrors {
  image_url?: string[];
  title?: string;
  location?: string;
  description?: string;
}

interface Portfolio {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string[];
  image_url: string[];
  created_at: string;
}

const categories = [
  "Weddings",
  "Portraits",
  "Events",
  "Landscapes",
  "Wildlife",
  "Fashion",
  "Sports",
  "Travel",
  "Macro",
  "Street",
];


export default function PortfolioPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    image_url: [],
    title: "",
    location: "",
    description: "",
    category: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activeIndex, setActiveIndex] = useState<{ [key: string]: number }>({});

  // ─────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) =>
      prev.category.includes(cat)
        ? { ...prev, category: prev.category.filter((c) => c !== cat) }
        : { ...prev, category: [...prev.category, cat] }
    );
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      image_url: prev.image_url.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.image_url.length === 0)
      newErrors.image_url = ["Please upload at least one image."];
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";
    if (!formData.description.trim())
      newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      alert("You must be logged in to upload images.");
      router.push("/login");
      return;
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${authData.user.id}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio_image")
        .upload(fileName, file);

      if (uploadError) {
        alert(`Upload failed: ${uploadError.message}`);
        continue;
      }

      const { data } = supabase.storage
        .from("portfolio_image")
        .getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
    }

    setFormData((prev) => ({
      ...prev,
      image_url: [...prev.image_url, ...uploadedUrls],
    }));

    setUploading(false);
    alert("Image(s) uploaded successfully!");
  };


  // Submit portfolio

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      alert("You must be logged in to submit a portfolio.");
      return;
    }

    const { error } = await supabase.from("photographer_portfolio").insert([
      {
        photographer_id: authData.user.id,
        title: formData.title,
        location: formData.location,
        description: formData.description,
        category: formData.category,
        image_url: formData.image_url,
      },
    ]);

    if (error) {
      alert(`Error saving portfolio: ${error.message}`);
    } else {
      alert("Portfolio uploaded successfully!");
      fetchPortfolios(); // refresh list
      setFormData({
        image_url: [],
        title: "",
        location: "",
        description: "",
        category: [],
      });
    }
  };

  // ─────────────────────────────────────────────
  // Fetch portfolios
  // ─────────────────────────────────────────────
  const fetchPortfolios = async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("photographer_portfolio")
      .select(
        "id, title, description, category, location, image_url, created_at"
      )
      .eq("photographer_id", authData.user.id)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setPortfolios(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  // Image Slider Controls

  const handleNext = (id: string, total: number) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + 1) % total,
    }));
  };

  const handlePrev = (id: string, total: number) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) - 1 < 0 ? total - 1 : (prev[id] ?? 0) - 1,
    }));
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <Header />

      <div className="mx-auto w-full max-w-[1300px] px-4 py-10">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Upload Your Work</h1>
          <Button asChild variant="outline">
            <Link href="/photographer/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Upload Form */}
        <Card className="shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle>Portfolio Upload Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label>Title</Label>
                <Input
                  name="title"
                  placeholder="E.g., Wedding Shoot"
                  value={formData.title}
                  onChange={handleChange}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <Label>Location</Label>
                <Input
                  name="location"
                  placeholder="E.g., Lagos, Nigeria"
                  value={formData.location}
                  onChange={handleChange}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  placeholder="Describe your photoshoot..."
                  value={formData.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Categories */}
              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={
                        formData.category.includes(cat)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => toggleCategory(cat)}
                      className="rounded-full"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Upload Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {uploading
                      ? "Uploading..."
                      : "Upload high-quality images of your work"}
                  </p>
                </div>

                {/* Preview */}
                {formData.image_url.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {formData.image_url.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-lg overflow-hidden border"
                      >
                        <img
                          src={img}
                          alt={`Preview ${idx}`}
                          className="object-cover w-full h-40"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full">
                Submit Portfolio
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Uploaded Works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">
            Your Uploaded Works
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <p>No works uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {portfolios.map((item) => {
                const currentIndex = activeIndex[item.id] || 0;
                const total = item.image_url.length;

                return (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden border rounded-2xl hover:shadow-lg transition-all"
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

                        {total > 1 && (
                          <>
                            <button
                              onClick={() => handlePrev(item.id, total)}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleNext(item.id, total)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>📍 {item.location}</span>
                          <span>
                            {Array.isArray(item.category)
                              ? item.category.join(", ")
                              : item.category}
                          </span>
                        </div>
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
}

