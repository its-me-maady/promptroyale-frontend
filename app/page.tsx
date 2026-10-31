"use client";

import React from "react";
import { useAuth } from "@/components/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { StudentMobileApp } from "@/components/StudentMobileApp";
import { FacultyPortal } from "@/components/FacultyPortal";
import { GraduationCap } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mb-3 animate-pulse shadow-lg shadow-sky-500/20">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <p className="text-xs font-semibold text-slate-400">Loading Vaigai Academic Platform...</p>
      </div>
    );
  }

  // 1. Unauthenticated -> Show Login Page
  if (!user) {
    return <LoginForm />;
  }

  // 2. Student Role -> Render Authentic Mobile App Experience
  if (user.role === "student") {
    return <StudentMobileApp />;
  }

  // 3. Faculty / Admin -> Render Desktop Web Portal
  return <FacultyPortal />;
}
