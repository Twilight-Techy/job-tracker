"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { EnvelopeSimple, LockKey, User, UserPlus, Briefcase, GoogleLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        setError(authError.message || "Failed to register. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      setError("");
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      if (error) {
        setError(error.message || "Failed to sign up with Google");
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-row-reverse bg-background">
      {/* Right side - Decorative (Reversed for signup) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_left,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }}></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center text-center p-12"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 backdrop-blur-sm">
            <UserPlus weight="duotone" className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Join the new standard<br />of job tracking.
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Stop losing track of your applications. Let our AI handle the heavy lifting while you focus on interviews.
          </p>
        </motion.div>
      </div>

      {/* Left side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-10 lg:hidden justify-center">
            <Briefcase weight="fill" className="w-8 h-8 text-primary" />
            <span className="font-bold text-2xl tracking-tight">JobTracker</span>
          </div>

          <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-background/95">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Sign up with Google or enter your details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                <Button 
                  variant="outline" 
                  className="w-full h-11 text-base font-medium" 
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <GoogleLogo weight="bold" className="mr-2 w-5 h-5" />
                      Continue with Google
                    </>
                  )}
                </Button>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md text-center"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="John Doe"
                      className="pl-10 h-11"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <EnvelopeSimple className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="m@example.com"
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKey className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10 h-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Must be at least 6 characters long.</p>
                </div>

                <Button type="submit" className="w-full h-11 text-base group mt-2" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Create Account
                      <UserPlus className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col border-t border-border/50 pt-6 mt-2">
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
