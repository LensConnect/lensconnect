"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, MapPin, DollarSign, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

interface JobPosts {
  title: string;
  location: string;
  duration_hours: number;
  date: string;
  totalPrice: number;
  category: string;
  description: string;
  clientId: string;
  status: "open" | "filled" | "completed" | "cancelled";
}

const jobFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  location: z.string().min(3, { message: "Location is required." }),
  category: z.string({ message: "Please select a category." }),
  date: z.date({ message: "A date is required." }),
  duration_hours: z.coerce.number().min(1, { message: "Duration must be at least 1 hour." }),
  totalPrice: z.coerce.number().min(1, { message: "Budget must be at least $1." }),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export function JobPostForm() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.input<typeof jobFormSchema>, JobPosts, JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      duration_hours: 2,
      totalPrice: 150,
    },
  });

  const createMutations = useMutation({
    mutationFn: async (data: JobFormValues) => {
      if (!user?.id) throw new Error("User not authenticated");

      setLoading(true);
      try {
        const response = await fetch("/api/jobpost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, clientId: user.id }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          throw new Error(errorPayload.error || "An unexpected error occurred");
        }
      } catch (err: any) {
        console.error("Error inserting job:", err);
        throw err;
      }
    },
    onSuccess: () => {
      toast.success("Job posted successfully!");
      form.reset();
      setLoading(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post job!");
      setLoading(false);
    },
  });

  async function onSubmit(data: JobFormValues) {
    createMutations.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Job Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Summer Wedding Photoshoot in Central Park"
                  className="h-10 rounded-xl bg-background border-border/80 text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 text-xs">
                    <SelectValue placeholder="Select a photography category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Weddings" className="text-xs">Weddings</SelectItem>
                  <SelectItem value="Portraits" className="text-xs">Portraits</SelectItem>
                  <SelectItem value="Events" className="text-xs">Events</SelectItem>
                  <SelectItem value="Commercial" className="text-xs">Commercial</SelectItem>
                  <SelectItem value="Real Estate" className="text-xs">Real Estate</SelectItem>
                  <SelectItem value="Fashion" className="text-xs">Fashion</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-semibold text-foreground">
                Project Description & Deliverables <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your creative vision, expectations, number of photos needed, and timeline..."
                  className="min-h-[110px] rounded-xl bg-background border-border/80 text-xs resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {/* Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Location <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Lagos, Nigeria"
                      className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="space-y-1.5 flex flex-col">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Session Date <span className="text-destructive">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 pl-3 text-left font-normal rounded-xl bg-background border-border/80 text-xs",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-60" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Duration & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration_hours"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Estimated Duration (Hours) <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs"
                      {...field}
                      value={field.value as string | number | undefined}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-foreground">
                  Estimated Budget ($ USD) <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      className="pl-9 h-10 rounded-xl bg-background border-border/80 text-xs font-mono"
                      {...field}
                      value={field.value as string | number | undefined}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs mt-3"
          disabled={createMutations.isPending || loading}
        >
          {createMutations.isPending || loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Publishing Job Listing...</span>
            </>
          ) : (
            "Publish Job Listing"
          )}
        </Button>
      </form>
    </Form>
  );
}
