// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import { authClient } from "@/lib/auth";
// import { useAuth } from "@/contexts/AuthContext";
// import { ROUTES, ERROR_MESSAGES, EMAIL_REGEX } from "@/config/constants";
// import { PasswordInput } from "@/components/common/PasswordInput";
// import { ConfettiAnimation } from "@/components/ConfettiAnimation";

// const loginSchema = z.object({
//   email: z.string().email("Invalid email address").regex(EMAIL_REGEX, "Invalid email format"),
//   password: z.string().min(1, "Password is required"),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// export default function LoginPage() {
//   const router = useRouter();
//   const { user, isLoading: authLoading, refreshSession } = useAuth();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [showConfetti, setShowConfetti] = useState(false);

//   const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     mode: "onChange",
//   });

//   /**
//    * Redirect authenticated users to dashboard
//    * Show loading screen while checking authentication status
//    */
//   useEffect(() => {
//     if (!authLoading && user) {
//       router.push(ROUTES.DASHBOARD);
//     }
//   }, [authLoading, user, router]);

//   /**
//    * Show loading screen while checking if user is authenticated
//    */
//   if (authLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#030712]">
//         <div className="relative">
//           <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
//           <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse"></div>
//         </div>
//       </div>
//     );
//   }

//   async function onSubmit(data: LoginFormData) {
//     try {
//       setSubmitError(null);
//       setIsSubmitting(true);
//       const result = await authClient.signIn.email({
//         email: data.email,
//         password: data.password,
//       });

//       if (result && result.data) {
//         await refreshSession();
//         setShowConfetti(true);
//       } else {
//         setSubmitError(ERROR_MESSAGES.INVALID_CREDENTIALS);
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.INVALID_CREDENTIALS;
//       setSubmitError(errorMessage.includes("Failed to fetch") ? "Connection error" : errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <>
//       {showConfetti && (
//         <ConfettiAnimation
//           isActive={showConfetti}
//           onComplete={() => router.push(ROUTES.DASHBOARD)}
//           duration={2000}
//         />
//       )}

//       <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4 pt-16">
//         {/* Background Glows */}
//         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
//           <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
//           <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-600/5 blur-[100px] rounded-full" />
//         </div>

//         <motion.div
//           className="w-full max-w-[380px] relative z-10" // Reduced width here
//           initial={{ opacity: 0, y: 15 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="p-6 sm:p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl">
//             <div className="text-center mb-6">
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white italic mx-auto mb-3 shadow-lg">
//                 F
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-white to-cyan-400 bg-clip-text text-transparent">
//                 Welcome Back
//               </h1>
//             </div>

//             <AnimatePresence>
//               {submitError && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center font-medium"
//                 >
//                   {submitError}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//               <div>
//                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
//                 <input
//                   {...register("email")}
//                   type="email"
//                   placeholder="Email"
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
//                   disabled={isSubmitting}
//                 />
//                 {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email.message}</p>}
//               </div>

//               <div>
//                 <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
//                 <PasswordInput
//                   id="password"
//                   {...register("password")}
//                   placeholder="Password"
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 transition-all"
//                   disabled={isSubmitting}
//                 />
//                 {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password.message}</p>}
//               </div>

//               <motion.button
//                 type="submit"
//                 disabled={!isValid || isSubmitting}
//                 whileHover={{ scale: 1.01 }}
//                 whileTap={{ scale: 0.99 }}
//                 className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-bold shadow-lg mt-2 disabled:opacity-40 transition-all"
//               >
//                 {isSubmitting ? "Signing in..." : "Sign In"}
//               </motion.button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-xs text-gray-500">
//                 New here?{" "}
//                 <Link href={ROUTES.REGISTER} className="text-cyan-400 font-bold hover:underline">
//                   Create Account
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </>
//   );
// }










"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES, ERROR_MESSAGES, EMAIL_REGEX } from "@/config/constants";
import { PasswordInput } from "@/components/common/PasswordInput";
import { ConfettiAnimation } from "@/components/ConfettiAnimation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").regex(EMAIL_REGEX, "Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, refreshSession } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  /**
   * Redirect authenticated users to dashboard
   */
  useEffect(() => {
    if (!authLoading && user) {
      console.log("[Login] User detected, redirecting to dashboard...");
      router.push(ROUTES.DASHBOARD);
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 blur-xl bg-cyan-500/20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  async function onSubmit(data: LoginFormData) {
    try {
      setSubmitError(null);
      setIsSubmitting(true);
      console.log("[Login] Attempting sign in for:", data.email);

      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      console.log("[Login] Sign in response:", result);

      // Check if sign-in was successful (result.data exists)
      if (result && result.data) {
        console.log("[Login] Auth successful, token received:", result.token ? "yes" : "no");

        // Store token in sessionStorage as fallback if cookies don't work
        if (result.token) {
          sessionStorage.setItem('auth_token', result.token);
          console.log("[Login] Token stored in sessionStorage");
        }

        // Small delay to ensure cookies are processed by browser
        await new Promise(resolve => setTimeout(resolve, 500));

        // Session refresh to load user from cookies or backend
        console.log("[Login] Calling refreshSession to populate context...");
        await refreshSession();

        // Add another delay to ensure session is refreshed
        await new Promise(resolve => setTimeout(resolve, 300));

        // Confetti animation
        setShowConfetti(true);

        // Redirect to dashboard after confetti or after timeout
        setTimeout(() => {
          console.log("[Login] Redirecting to dashboard");
          router.push(ROUTES.DASHBOARD);
        }, 2000);

      } else {
        console.warn("[Login] Sign in failed: No data in response");
        console.log("[Login] Response structure:", JSON.stringify(result, null, 2));
        setSubmitError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error) {
      console.error("[Login] Exception during sign in:", error);
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.INVALID_CREDENTIALS;
      setSubmitError(errorMessage.includes("Failed to fetch") ? "Connection error to backend" : errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {showConfetti && (
        <ConfettiAnimation
          isActive={showConfetti}
          onComplete={() => {
            console.log("[Login] Confetti complete, pushing dashboard route");
            router.push(ROUTES.DASHBOARD);
          }}
          duration={2000}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4 pt-16">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-600/5 blur-[100px] rounded-full" />
        </div>

        <motion.div
          className="w-full max-w-[380px] relative z-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-black text-white italic mx-auto mb-3 shadow-lg">
                F
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-white to-cyan-400 bg-clip-text text-transparent">
                Welcome Back
              </h1>
            </div>

            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] text-center font-medium"
                >
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <PasswordInput
                  id="password"
                  {...register("password")}
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 transition-all"
                  disabled={isSubmitting}
                />
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password.message}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={!isValid || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl text-white text-sm font-bold shadow-lg mt-2 disabled:opacity-40 transition-all"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                New here?{" "}
                <Link href={ROUTES.REGISTER} className="text-cyan-400 font-bold hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}