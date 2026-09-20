"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { CheckCircle, Camera, Briefcase, User } from "lucide-react"

interface FormData {
  fullname: string
  bio: string
  location: string
  phoneNumber: string
  experience: number | string
  portfolio_url: string
  hourly_rate: number | string
  specialties: string[]
  availability: boolean
  email: string
  profile_image_url: string
  role: string
}

interface FormErrors {
  fullname?: string
  bio?: string
  location?: string
  phoneNumber?: string
  experience?: string
  email?: string
  portfolio_url?: string
  hourly_rate?: string
  role?: string
}

const availableSpecialties = [
  "Wedding",
  "Portrait",
  "Event",
  "Nature",
  "Fashion",
  "Sports",
  "Travel",
  "Product",
]

export default function SetupPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<FormData>({
    fullname: "",
    bio: "",
    location: "",
    email: "",
    phoneNumber: "",
    experience: "",
    portfolio_url: "",
    hourly_rate: "",
    specialties: [],
    availability: true,
    profile_image_url: "",
    role: '',

  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Prefill from auth session first, then fall back to localStorage
  useEffect(() => {
    if (user) {
      // Primary source: session cookie via useAuth
      setFormData((prev) => ({
        ...prev,
        fullname: user.fullname || prev.fullname,
        email: user.email || prev.email,
        role: user.role || prev.role,
      }))
    } else {
      // Fallback: localStorage saved during signup
      const storedUser = localStorage.getItem("userData")
      if (storedUser) {
        try {
          const localUser = JSON.parse(storedUser)
          setFormData((prev) => ({
            ...prev,
            fullname: localUser.fullname || "",
            email: localUser.email || "",
            role: localUser.role || "",
          }))
        } catch {
          console.error("Failed to parse stored user data")
        }
      }
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" || name === "hourly_rate" ? Number(value) : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const validateStep = (): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      if (!formData.fullname) newErrors.fullname = "Full name is required"
      if (!formData.email) newErrors.email = "Email is required"
      if (!formData.bio) newErrors.bio = "Bio is required"
      if (!formData.location) newErrors.location = "Location is required"
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required"
    } else if (step === 2) {
      if (!formData.experience) newErrors.experience = "Experience is required"
      if (!formData.portfolio_url) newErrors.portfolio_url = "Portfolio URL is required"
      if (!formData.hourly_rate) newErrors.hourly_rate = "Hourly rate is required"
      if (!formData.role) newErrors.role = "Please select a role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep((prev) => prev + 1)
  }

  const handleBack = () => setStep((prev) => prev - 1)


  const handleUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image first.")
      return
    }

    if (!user) {
      toast.error("You must be logged in to upload.")
      return
    }

    setUploading(true)

    // Each user’s files go into a personal folder
    const filePath = `${user.id}/${Date.now()}_${imageFile.name}`

    const { data, error } = await supabase.storage
      .from("profile_image")
      .upload(filePath, imageFile)

    if (error) {
      toast.error("Upload failed: " + error.message)
    } else {
      const { data: publicData } = supabase.storage
        .from("profile_image")
        .getPublicUrl(filePath)

      setFormData((prev) => ({
        ...prev,
        profile_image_url: publicData.publicUrl,
      }))
      toast.success("Image uploaded successfully!")
    }

    setUploading(false)
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const isValid = validateStep()
    if (!isValid) return

    if (!user) {
      toast.error("You must be logged in to save setup.")
      return
    }

    try {
      const response = await fetch('/api/profiles', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Number(user.id),
          email: formData.email || user.email,
          fullname: formData.fullname,
          role: formData.role,
          phoneNumber: formData.phoneNumber,
          bio: formData.bio,
          location: formData.location,
          experience: Number(formData.experience),
          hourlyRate: Number(formData.hourly_rate),
          specialties: formData.specialties,
          portfolio_url: formData.portfolio_url,
          availability: formData.availability,
          profile_image_url: formData.profile_image_url,
          updatedAt: new Date(),
        }),
      })

      if (!response.ok) {
        // Replace line 229 with this to see the real error:
const errorData = await response.json().catch(() => ({}));
console.error("Server Response Error:", response.status, errorData);
throw new Error(errorData.error || `Profile setup failed with status ${response.status}`);

      }

      toast.success("Profile setup completed!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Profile setup error:", error)
      toast.error(error instanceof Error ? error.message : "Profile setup failed. Please try again.")
    }
  }

  const steps = [
    { id: 1, label: "Basic Info", icon: User },
    { id: 2, label: "Professional Details", icon: Briefcase },
    { id: 3, label: "Profile Image", icon: Camera },
  ]

  return (
    <div className="min-h-screen bg-white  text-foreground">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-7 sm:mb-9">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Creator onboarding
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Complete Your Profile</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Let’s set up your photographer profile for bookings
          </p>
        </div>

        <Card className="overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-xl shadow-orange-900/5">
          <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-white to-orange-50/70 px-5 py-5 sm:px-8 sm:py-6">
            <CardTitle className="flex items-center justify-between gap-4 text-lg font-bold text-foreground sm:text-2xl">
              Photographer Setup
              <span className="whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary sm:text-xs">Step {step} of {steps.length}</span>
            </CardTitle>
          </CardHeader>

          {/* Stepper */}
          <div className="flex items-start justify-between gap-2 border-b border-orange-100 px-5 py-6 sm:px-8 sm:py-7">
            {steps.map((s, index) => (
              <div key={s.id} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white transition-all duration-300 sm:h-11 sm:w-11 ${step === s.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : step > s.id
                      ? "bg-orange-200 text-primary"
                      : "bg-orange-50 text-orange-300"
                    }`}
                >
                  {step > s.id ? <CheckCircle size={20} /> : <s.icon size={20} />}
                </div>
                <p className={`mt-2 text-[10px] font-bold sm:text-xs ${step >= s.id ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-1/2 top-5 h-0.5 w-full ${step > s.id ? "bg-primary" : "bg-orange-100"
                      }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <CardContent className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step 1 */}
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-bold text-foreground">Full Name</Label>
                        <Input
                          name="fullname"
                          className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                          value={formData.fullname}
                          onChange={handleChange}
                        />
                        {errors.fullname && <p className="text-red-500 mt-2 text-sm">{errors.fullname}</p>}
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-foreground">Email</Label>
                        <Input
                          name="email"
                          className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && <p className="text-red-500 mt-2 text-sm">{errors.email}</p>}
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-foreground">Phone</Label>
                        <Input
                          name="phoneNumber"
                          className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                 
                        />
                        {errors.phoneNumber && <p className="text-red-500 mt-2 text-sm">{errors.phoneNumber}</p>}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-foreground">Location</Label>
                      <Input
                        name="location"
                        className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                        value={formData.location}
                        onChange={handleChange}
                      />
                      {errors.location && <p className="text-red-500 mt-2 text-sm">{errors.location}</p>}
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-foreground">Bio</Label>
                      <Textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="mt-2 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20" />
                      {errors.bio && <p className="text-red-500 mt-2 text-sm">{errors.bio}</p>}
                    </div>
                  </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-bold text-foreground">Experience (Years)</Label>
                        <Input
                          name="experience"
                          className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                          value={formData.experience}
                          onChange={handleChange}
                        />
                        {errors.experience && <p className="text-red-500 mt-2 text-sm">{errors.experience}</p>}
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-foreground">Hourly Rate ($)</Label>
                        <Input
                          name="hourly_rate"
                          className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                          value={formData.hourly_rate}
                          onChange={handleChange}
                        />
                        {errors.hourly_rate && <p className="text-red-500 mt-2 text-sm">{errors.hourly_rate}</p>}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-foreground">Portfolio URL</Label>
                      <Input
                        name="portfolio_url"
                        className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                        value={formData.portfolio_url}
                        onChange={handleChange}
                      />
                      {errors.portfolio_url && <p className="text-red-500 mt-2 text-sm">{errors.portfolio_url}</p>}
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-foreground">Role</Label>
                      <Input
                        name="role"
                        className="mt-2 h-11 rounded-xl border-orange-200 bg-white focus-visible:border-primary focus-visible:ring-primary/20"
                        value={formData.role}
                        onChange={handleChange}
                      />
                      {errors.role && <p className="text-red-500 mt-2 text-sm">{errors.role}</p>}
                    </div>


                    <div>
                      <Label className="text-xs font-bold text-foreground">Specialties</Label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {availableSpecialties.map((s) => (
                          <Button
                            key={s}
                            type="button"
                            size="sm"
                            variant={formData.specialties.includes(s) ? "default" : "outline"}
                            onClick={() => toggleSpecialty(s)}
                            className={`rounded-full border px-3 transition-all ${formData.specialties.includes(s)
                              ? "border-primary bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary/90"
                              : "border-orange-200 bg-white text-foreground hover:border-primary hover:bg-orange-50"
                              }`}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 mt-5">
                      <div>
                        <Label className="text-sm font-bold text-foreground">Available for Bookings</Label>
                        <p className="mt-1 text-xs text-muted-foreground">Let clients know when you are accepting new work.</p>
                      </div>
                      <Switch
                        checked={formData.availability}
                        onCheckedChange={(checked) =>
                          setFormData((p) => ({ ...p, availability: checked }))
                        }
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <>
                    <div className="rounded-2xl border border-dashed border-primary/30 bg-orange-50/50 p-4 sm:p-6">
                      <Label className="text-sm font-bold text-foreground">Upload Profile Image</Label>
                      <p className="mt-1 text-xs text-muted-foreground">Use a clear photo clients can recognize.</p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="h-11 rounded-xl border-orange-200 bg-white file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-primary/90"
                        />
                        <Button onClick={handleUpload} disabled={uploading} className="h-11 rounded-xl bg-primary px-5 font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90">
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>

                    {formData.profile_image_url && (
                      <div className="flex justify-center">
                        <img
                          src={formData.profile_image_url}
                          alt="Profile Preview"
                          className="mt-4 h-36 w-36 rounded-full border-4 border-white object-cover shadow-lg shadow-orange-900/10 ring-2 ring-primary/25"
                        />
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-orange-100 pt-5">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="h-11 rounded-xl border-orange-200 px-5 font-bold hover:border-primary hover:bg-orange-50">
                  Back
                </Button>
              ) : <span />}
              {step < 3 && <Button type="button" onClick={handleNext} className="h-11 rounded-xl bg-primary px-6 font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90">Next</Button>}
              {step === 3 && <Button type="button" onClick={handleSubmit} className="h-11 rounded-xl bg-primary px-6 font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90">Finish Setup</Button>}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
