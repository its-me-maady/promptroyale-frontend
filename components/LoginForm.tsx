"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { GraduationCap, ShieldCheck, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        {/* College Crest & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 mb-4 shadow-lg shadow-sky-500/20">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vaigai College of Engineering</h1>
          <p className="text-sm text-sky-400 font-medium mt-1">Prompt Royale Academic AI Platform</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/60 rounded-full text-xs text-slate-300 mt-3 border border-slate-600/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Subject-Based Access Control (SBAC) Protected
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              College Email ID
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@vaigai.edu"
                className="w-full bg-slate-950/70 border border-slate-700 text-white pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/70 border border-slate-700 text-white pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {submitting ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Sign In to Academic Portal</span>
                <Sparkles className="w-4 h-4 text-sky-200" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Reference Card */}
        <div className="mt-8 pt-6 border-t border-slate-700/80">
          <p className="text-xs font-medium text-slate-400 mb-2">Institutional Demo Credentials:</p>
          <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono">
            <div><span className="text-sky-400">Student:</span> adhithiyan@vaigai.edu (Vaigai@123)</div>
            <div><span className="text-emerald-400">Faculty:</span> faculty.cse@vaigai.edu (Vaigai@123)</div>
            <div><span className="text-amber-400">Admin:</span> admin@vaigai.edu (Vaigai@123)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
