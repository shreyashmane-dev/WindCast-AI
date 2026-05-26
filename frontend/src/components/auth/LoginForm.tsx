import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuth } from "../../services/auth";

export default function LoginForm() {
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
  
  // Auth Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI Status State
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Field validations
    if (!email) {
      setErrorMessage("Please enter your operator email.");
      setStatus("error");
      return;
    }
    if (!password) {
      setErrorMessage("Secure access password is required.");
      setStatus("error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Invalid email format registry.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const success = await login(email, password);
      if (success) {
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMessage("Authentication failed. Invalid credentials or connection problem.");
        setStatus("error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to establish operator authorization.");
      setStatus("error");
    }
  };

  const handleGoogleLogin = async () => {
    setStatus("loading");
    setErrorMessage("");
    
    try {
      const success = await signInWithGoogle();
      if (success) {
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMessage("Google SSO auth handshake failed.");
        setStatus("error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authorize session.");
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-glass-border relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      {/* Decorative backdrop light */}
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-cyan-500/5 filter blur-xl pointer-events-none" />

      {/* Header Branding info */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-wider font-mono text-slate-100 uppercase">
          LOG IN ADMINISTRATOR
        </h2>
        <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5 block">
          Secure Grid Console Authentication
        </span>
      </div>

      {/* Dynamic Status Banner Alerts */}
      <AnimatePresence mode="wait">
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2.5"
          >
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-start gap-2.5 animate-pulse"
          >
            <ShieldCheck size={15} className="shrink-0 mt-0.5" />
            <span>Keys decrypted. Directing to telemetry core...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        {/* Email Address */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            OPERATOR EMAIL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail size={16} />
            </div>
            <input
              type="email"
              disabled={status === "loading" || status === "success"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@windcast.ai"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-all ${
                status === "loading"
                  ? "border-glass-border opacity-50 cursor-not-allowed"
                  : "border-glass-border focus:border-cyan-500/50 focus:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              }`}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5 relative">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              DECRYPTION PASS
            </label>
            <span className="text-[9px] font-mono text-slate-600 hover:text-cyan-400 cursor-pointer select-none">
              FORGOT PASSWORD?
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              type="password"
              disabled={status === "loading" || status === "success"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-all ${
                status === "loading"
                  ? "border-glass-border opacity-50 cursor-not-allowed"
                  : "border-glass-border focus:border-cyan-500/50 focus:shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              }`}
            />
          </div>
        </div>

        {/* Remember me trigger */}
        <div className="flex items-center gap-2 select-none py-1">
          <input
            type="checkbox"
            id="remember-me"
            disabled={status === "loading" || status === "success"}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-3.5 w-3.5 rounded bg-slate-950/80 border-glass-border text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
          />
          <label htmlFor="remember-me" className="text-[10px] font-mono text-slate-500 uppercase cursor-pointer hover:text-slate-400">
            Remember this edge terminal session
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={`w-full py-2.5 rounded-lg font-mono font-bold text-sm tracking-widest text-slate-950 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] ${
            (status === "loading" || status === "success") && "opacity-50 cursor-wait hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          }`}
        >
          {status === "loading" ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>DECRYPTING KEYS...</span>
            </>
          ) : (
            <>
              <LogIn size={15} />
              <span>AUTHORIZE SESSION</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-glass-border/30"></div>
        <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-600">OR PROVIDE THIRD-PARTY KEY</span>
        <div className="flex-grow border-t border-glass-border/30"></div>
      </div>

      {/* Google Login button */}
      <button
        onClick={handleGoogleLogin}
        disabled={status === "loading" || status === "success"}
        className="w-full py-2.5 rounded-lg border border-glass-border bg-slate-950/40 hover:bg-slate-950/80 text-slate-300 hover:text-slate-100 font-mono text-xs font-semibold flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:border-slate-700"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3A11.966 11.966 0 0 0 12 .909a11.97 11.97 0 0 0-8.99 4.027l2.256 4.829z"
          />
          <path
            fill="#FBBC05"
            d="M3.01 12c0-.79.08-1.56.246-2.291H.266l2.256 4.83A7.054 7.054 0 0 1 3.01 12"
          />
          <path
            fill="#4285F4"
            d="M23.754 12.273A11.956 11.956 0 0 0 24 12c0-.79-.082-1.573-.245-2.336H12v4.636h6.75A5.856 5.856 0 0 1 16.227 18.2l3.491 2.664a11.93 11.93 0 0 0 4.036-8.591"
          />
          <path
            fill="#34A853"
            d="M12 23.091c3.24 0 5.97-1.077 7.96-2.927l-3.49-2.664a7.073 7.073 0 0 1-4.47 1.409c-3.418 0-6.314-2.3-7.345-5.391L2.39 18.136A11.97 11.97 0 0 0 12 23.091"
          />
        </svg>
        <span>INTEGRATE VIA GOOGLE PROTOCOL</span>
      </button>

      {/* SignUp Routing trigger */}
      <div className="text-center mt-6 text-[10px] font-mono text-slate-500 uppercase">
        <span>No credentials? </span>
        <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold select-none cursor-pointer">
          REGISTER NEW TERMINAL
        </Link>
      </div>

      {/* Demo Credentials Alert helper */}
      <div className="mt-6 p-2.5 bg-cyan-950/20 border border-cyan-800/30 rounded-lg text-[9px] font-mono text-slate-400 leading-normal">
        🔑 Demo Auth Credentials:
        <br />
        <span className="text-slate-300">Email:</span> admin@windcast.ai | <span className="text-slate-300">Pass:</span> admin123
      </div>
    </div>
  );
}
