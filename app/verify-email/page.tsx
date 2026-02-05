"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // 🔹 Get pending email from signup
    const storedEmail = localStorage.getItem("pendingEmail");
    setPendingEmail(storedEmail);

    // 🔹 Poll every 5 seconds to see if email is verified
    const interval = setInterval(async () => {
      setIsChecking(true);
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user?.email_confirmed_at) {
        // Check user metadata for their role
        const role = user.user_metadata?.role || "client";
        localStorage.removeItem("pendingEmail");

        if (role === "photographer") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard/client");
        }
      }

      setIsChecking(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  // 🔹 Resend verification email
  const handleResend = async () => {
    if (!pendingEmail) return;
    setResendMessage(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
    });

    if (error) {
      setResendMessage("Failed to resend verification email. Try again.");
    } else {
      setResendMessage("Verification email sent again. Check your inbox!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex justify-center items-center gap-2">
            <Mail className="w-6 h-6 text-primary" /> Verify your email
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            We’ve sent a verification link to{" "}
            <strong>{pendingEmail || "your email"}</strong>. <br />
            Please check your inbox and click the link to activate your account.
          </p>

          <div className="flex justify-center">
            {isChecking ? (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Checking verification status...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Once verified, you’ll be redirected automatically.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={handleResend} className="w-full">
              Resend verification email
            </Button>
            {resendMessage && (
              <p className="text-sm text-green-600">{resendMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
