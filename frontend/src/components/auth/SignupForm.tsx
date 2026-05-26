import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ShieldAlert, ShieldCheck, RefreshCw, UserPlus } from "lucide-react";
import { useAuth } from "../../services/auth";

export default function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();

  // Signup fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password strength states
  const [strength, setStrength] = useState(0); // 0 to 4 score
  const [strengthLabel, setStrengthLabel] = useState("Idle");

  // UI Status
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate password strength dynamically
  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthLabel("Idle");
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);

    const labels = ["Weak Grid", "Low Safeguard", "Medium Guard", "Secured Node", "Optimal Encryption"];
    setStrengthLabel(labels[score]);
  }, [password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setErrorMessage("Operator full name is required.");
      setStatus("error");
      return;
    }
    if (!email) {
      setErrorMessage("Registry email address is required.");
      setStatus("error");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Invalid email format registry.");
      setStatus("error");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Access password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords keys mismatch.");
      setStatus("error");
      return;
    }
    if (strength < 3) {
      setErrorMessage("Please increase password strength to at least Secured Node (Score 3).");
      setStatus("error");
      return;
    }
    if (!acceptTerms) {
      setErrorMessage("You must accept Grid Security and Operations protocols.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const success = await signup(email, password);
      if (success) {
        setStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setErrorMessage("Registration failed. The email might already be registered or network error.");
        setStatus("error");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create security account.");
      setStatus("error");
    }
  };

  const getStrengthColor = () => {
    if (strength === 0) return "bg-slate-800";
    if (strength === 1) return "bg-rose-500 shadow-[0_0_8px_#f43f5e]";
    if (strength === 2) return "bg-amber-500 shadow-[0_0_8px_#fbbf24]";
    if (strength === 3) return "bg-cyan-500 shadow-[0_0_8px_#06b6d4]";
    return "bg-emerald-500 shadow-[0_0_8px_#10b981]";
  };

  const getStrengthTextColor = () => {
    if (strength <= 1) return "text-rose-400";
    if (strength === 2) return "text-amber-400";
    if (strength === 3) return "text-cyan-400";
    return "text-emerald-400 text-glow-green";
  };

  return (
    <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-glass-border relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-emerald-500/5 filter blur-xl pointer-events-none" />

      {/* Header Info */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold tracking-wider font-mono text-slate-100 uppercase">
          REGISTER TERMINAL
        </h2>
        <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase -mt-0.5 block">
          Establish New Security Identity
        </span>
      </div>

      {/* Warning/Success alerts */}
      <AnimatePresence mode="wait">
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2.5"
          >
            <ShieldAlert size={15} className="shrink-0 mt-0.5" />
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
            <span>Registration verified. Initiating telemetry session...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
        {/* Name Input */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            OPERATOR FULL NAME
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User size={16} />
            </div>
            <input
              type="text"
              disabled={status === "loading" || status === "success"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-glass-border focus:border-cyan-500/50 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-1 relative">
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
              placeholder="e.g. operator@windcast.ai"
              className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-glass-border focus:border-cyan-500/50 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            ACCESS PASSWORD
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              type="password"
              disabled={status === "loading" || status === "success"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, numbers, caps"
              className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-glass-border focus:border-cyan-500/50 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all"
            />
          </div>
        </div>

        {/* Password Strength Meter Grid */}
        {password && (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-500 uppercase">ENCRYPTION GRADE:</span>
              <span className={`font-bold ${getStrengthTextColor()}`}>{strengthLabel.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((index) => {
                const isLit = strength >= index;
                return (
                  <div
                    key={`strength-block-${index}`}
                    className={`h-1.5 rounded-sm transition-all duration-300 ${isLit ? getStrengthColor() : "bg-slate-900 border border-glass-border"
                      }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Confirm Password Input */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            CONFIRM ACCESS PASSWORD
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              type="password"
              disabled={status === "loading" || status === "success"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type password"
              className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-glass-border focus:border-cyan-500/50 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:shadow-[0_0_12px_rgba(6,182,212,0.15)] transition-all"
            />
          </div>
        </div>

        {/* Terms acceptance */}
        <div className="flex items-start gap-2 select-none py-1 cursor-pointer">
          <input
            type="checkbox"
            id="accept-terms"
            disabled={status === "loading" || status === "success"}
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="h-3.5 w-3.5 rounded bg-slate-950/80 border-glass-border text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500 mt-0.5 shrink-0"
          />
          <label htmlFor="accept-terms" className="text-[9px] font-mono text-slate-500 uppercase cursor-pointer hover:text-slate-400 leading-normal">
            I accept Grid Security, telemetry encryption, and operations dispatch protocols.
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={`w-full py-2.5 rounded-lg font-mono font-bold text-sm tracking-widest text-slate-950 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] ${(status === "loading" || status === "success") && "opacity-50 cursor-wait hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            }`}
        >
          {status === "loading" ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>ESTABLISHING LOGS...</span>
            </>
          ) : (
            <>
              <UserPlus size={15} />
              <span>CREATE ACCOUNT</span>
            </>
          )}
        </button>
      </form>

      {/* SignUp Routing trigger */}
      <div className="text-center mt-6 text-[10px] font-mono text-slate-500 uppercase">
        <span>Already have registry? </span>
        <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold select-none cursor-pointer">
          SIGN IN TERMINAL
        </Link>
      </div>
    </div>
  );
}
