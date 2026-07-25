import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Loader2 } from "lucide-react";

import { authService } from "@/services/auth.service";

import { PublicLayout } from "@/components/layouts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    try {
      setIsLoading(true);

      await authService.login(
        data.email,
        data.password
      );

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });

      // Always send the user to /dashboard. ProtectedRoute/OnboardingRoute
      // in App.tsx checks profile.onboarding_completed and redirects to
      // /onboarding automatically when it's not true yet, so this single
      // redirect is correct for both new and returning users.
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setIsGoogleLoading(true);
      await authService.loginWithGoogle();
      // Supabase performs a full-page redirect to Google from here, so
      // there is no further code to run in this component.
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  }

  return (
    <PublicLayout showNav={false}>
      <div className="flex min-h-screen">
        {/* Left Side */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-card relative overflow-hidden border-r border-border/50">
          <div className="absolute inset-0 bg-aurora opacity-30"></div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-16">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              <span className="font-bold text-2xl">
                CareerOS
              </span>
            </Link>

            <h1 className="text-4xl font-bold leading-tight mb-6 max-w-md">
              Welcome back to your unfair advantage.
            </h1>

            <ul className="space-y-5 text-muted-foreground">
              <li>✅ AI Resume Optimization</li>
              <li>✅ Personalized Learning Roadmap</li>
              <li>✅ Smart Application Tracking</li>
              <li>✅ GitHub Skill Analysis</li>
              <li>✅ AI Career Mentor</li>
            </ul>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h2 className="text-3xl font-bold">
                Sign In
              </h2>

              <p className="text-muted-foreground mt-2">
                Log in to continue building your career brain.
              </p>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-11 rounded-lg border border-border bg-card font-semibold hover:bg-muted transition flex items-center justify-center gap-2 mb-6"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">OR</span></div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="john@gmail.com"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link href="/forgot-password">
                            <span className="text-xs text-primary cursor-pointer hover:underline">
                              Forgot password?
                            </span>
                          </Link>
                        </div>

                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="********"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Sign In"
                    )}
                  </button>

                </form>
              </Form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup">
                  <span className="text-primary cursor-pointer hover:underline">
                    Sign Up
                  </span>
                </Link>
              </p>

            </motion.div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
});

export function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  async function onSubmit(data: z.infer<typeof signupSchema>) {
    try {
      setIsLoading(true);

      await authService.signup(
        data.email,
        data.password,
        data.name
      );

      toast({
        title: "Account Created 🎉",
        description:
          "Please check your email to verify your account before logging in.",
      });

      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setIsGoogleLoading(true);
      await authService.loginWithGoogle();
      // Supabase performs a full-page redirect to Google from here, so
      // there is no further code to run in this component.
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  }

  return (
    <PublicLayout showNav={false}>
      <div className="flex min-h-screen">
        {/* Left Side */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-card relative overflow-hidden border-r border-border/50">
          <div className="absolute inset-0 bg-aurora opacity-30"></div>

          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-16">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              <span className="font-bold text-2xl">
                CareerOS
              </span>
            </Link>

            <h1 className="text-4xl font-bold leading-tight mb-6 max-w-md">
              Start building your unfair advantage.
            </h1>

            <ul className="space-y-5 text-muted-foreground">
              <li>✅ AI Resume Optimization</li>
              <li>✅ Personalized Learning Roadmap</li>
              <li>✅ Smart Application Tracking</li>
              <li>✅ GitHub Skill Analysis</li>
              <li>✅ AI Career Mentor</li>
            </ul>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h2 className="text-3xl font-bold">
                Create Account
              </h2>

              <p className="text-muted-foreground mt-2">
                Join CareerOS and build your future.
              </p>
            </div>

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-11 rounded-lg border border-border bg-card font-semibold hover:bg-muted transition flex items-center justify-center gap-2 mb-6"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">OR</span></div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Full Name
                        </FormLabel>

                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="john@gmail.com"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>

                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex gap-3 items-start">

                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />

                        <FormLabel className="text-xs leading-5 text-muted-foreground">
                          I agree to the Terms &
                          Conditions and Privacy Policy.
                        </FormLabel>

                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Create Account"
                    )}
                  </button>

                </form>
              </Form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-primary cursor-pointer hover:underline">
                    Sign In
                  </span>
                </Link>
              </p>

            </motion.div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
export function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email("Invalid email"),
      })
    ),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: { email: string }) {
    try {
      setIsLoading(true);

      await authService.forgotPassword(values.email);

      setIsSubmitted(true);

      toast({
        title: "Reset Email Sent",
        description:
          "Please check your inbox to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PublicLayout showNav={false}>
      <div className="flex min-h-screen items-center justify-center p-8 bg-background relative overflow-hidden">

        <div className="absolute inset-0 bg-mesh opacity-40"></div>

        <div className="relative z-10 w-full max-w-md glass rounded-3xl p-8 border border-border">

          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center">
            Reset Password
          </h2>

          <p className="text-sm text-muted-foreground text-center mt-2 mb-8">
            {isSubmitted
              ? "A password reset link has been sent to your email."
              : "Enter your email address and we'll send you a reset link."}
          </p>

          {!isSubmitted ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>

                      <FormLabel>Email</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="john@gmail.com"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </Form>
          ) : (
            <button
              onClick={() => setLocation("/login")}
              className="w-full h-11 rounded-lg bg-card border border-border hover:bg-muted transition"
            >
              Return to Login
            </button>
          )}

          {!isSubmitted && (
            <div className="mt-6 text-center">
              <Link href="/login">
                <span className="text-primary cursor-pointer hover:underline">
                  ← Back to Login
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}