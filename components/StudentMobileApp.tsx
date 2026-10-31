"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { StudentQAChat } from "./StudentQAChat";
import { QuizBattleArena } from "./QuizBattleArena";
import { 
  MessageSquare, 
  Swords, 
  UserCircle, 
  LogOut, 
  Wifi, 
  Battery, 
  GraduationCap, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export const StudentMobileApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "quiz" | "profile">("chat");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-6 overflow-hidden">
      {/* Authentic Mobile Device Frame */}
      <div className="mobile-device-frame border border-slate-700/80">
        {/* Status Bar */}
        <div className="bg-slate-900 text-slate-400 px-6 pt-2 pb-1 flex justify-between items-center text-[11px] shrink-0 font-medium">
          <span>9:41 AM</span>
          <div className="mobile-notch" />
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Top App Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">Prompt Royale</h2>
              <p className="text-[10px] text-sky-400 font-medium">Vaigai College Student App</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full text-[10px] text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>SBAC Active</span>
          </div>
        </div>

        {/* Main Content Area based on Tab */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "chat" && <StudentQAChat />}
          {activeTab === "quiz" && <QuizBattleArena />}
          {activeTab === "profile" && (
            <div className="p-6 bg-slate-950 text-white h-full overflow-y-auto">
              <div className="text-center py-6 border-b border-slate-800">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-sky-500 mx-auto flex items-center justify-center mb-3 text-sky-400">
                  <UserCircle className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-bold">{user?.name}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <span className="inline-block px-2.5 py-0.5 bg-sky-950 text-sky-400 rounded-full text-[10px] font-semibold mt-2 border border-sky-800">
                  Enrolled Student
                </span>
              </div>

              <div className="py-6 space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Subject Memberships:
                </h4>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">CS101: Data Structures</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Department of Computer Science & Engineering
                  </p>
                </div>

                <div className="p-3 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">CS202: Database Management Systems</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No active membership (Cross-subject access blocked per SBAC)
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-3 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 font-medium text-xs flex items-center justify-center gap-2 transition-colors mt-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex justify-around items-center shrink-0">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "chat" ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "quiz" ? "text-rose-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Swords className="w-5 h-5" />
            <span>Quiz Battle</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "profile" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <UserCircle className="w-5 h-5" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
