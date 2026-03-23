"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4">
      <main className="w-full max-w-[420px] flex flex-col items-center gap-8">

        {/* CARD */}
        <section className="w-full bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 sm:p-12 shadow-2xl">

          {/* HEADER */}
          <header className="flex flex-col items-center mb-10 text-center">
            <div className="w-12 h-12 bg-[#DC2626] rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-[#DC2626] font-bold text-2xl tracking-tight mb-2">
              LibraFlow
            </h1>

            <h2 className="text-white font-bold text-[28px] leading-tight mb-2">
              Welcome back
            </h2>

            <p className="text-[#6B7280] text-base">
              Sign in to access your library dashboard
            </p>
          </header>

          {/* ERROR */}
          {error && (
            <div className="bg-[#DC2626]/10 border border-[#DC2626]/50 text-[#DC2626] px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-[#9CA3AF] text-sm font-medium">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@libraflow.com"
                className="w-full h-[44px] bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 placeholder:text-[#374151] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
              />
              {errors.email && (
                <p className="text-[#DC2626] text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[#9CA3AF] text-sm font-medium">
                  Password
                </label>
                <Link href="#" className="text-[#DC2626] text-sm hover:text-[#EF4444]">
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-[44px] bg-[#0D0D0D] border border-[#1F1F1F] text-white rounded-lg px-4 pr-12 placeholder:text-[#374151] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-[#DC2626] text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[44px] bg-[#DC2626] text-white font-bold rounded-lg hover:bg-[#B91C1C] active:bg-[#991B1B] transition-all flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1F1F1F]" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-[#111111] px-4 text-[#4B5563]">
                or continue with
              </span>
            </div>
          </div>

          {/* GOOGLE */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-[44px] bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg flex items-center justify-center gap-3 hover:bg-[#262626]"
          >
            <span className="font-medium">Google</span>
          </button>

          {/* FOOTER */}
          <div className="mt-8 text-center text-sm">
            <span className="text-[#6B7280]">
              Don't have an account?
            </span>
            <Link href="#" className="text-[#DC2626] ml-1 hover:underline">
              Register
            </Link>
          </div>
        </section>

        <p className="text-[#4B5563] text-xs font-mono text-center">
          Demo credentials: admin@libraflow.com / Admin@123
        </p>
      </main>
    </div>
  );
}