"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { StudentQAChat } from "./StudentQAChat";
import { QuizBattleArena } from "./QuizBattleArena";
import {
  AIProviderCredential,
  SUPPORTED_BYOK_PROVIDERS,
  PROVIDER_DISCLOSURES,
  apiFetch
} from "@/lib/api";
import { 
  MessageSquare, 
  Swords, 
  UserCircle, 
  LogOut, 
  Wifi, 
  Battery, 
  GraduationCap, 
  ShieldCheck,
  CheckCircle2,
  Key,
  Plus,
  Trash2,
  Sparkles,
  Star,
  X,
  AlertCircle
} from "lucide-react";

export const StudentMobileApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "quiz" | "profile">("chat");

  // BYOK Multi-Provider State (SRS Section 4.7)
  const [credentials, setCredentials] = useState<AIProviderCredential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [acknowledgedDisclosure, setAcknowledgedDisclosure] = useState(false);
  const [submittingCred, setSubmittingCred] = useState(false);

  const fetchCredentials = async () => {
    try {
      setLoadingCreds(true);
      const data = await apiFetch<AIProviderCredential[]>("/api/students/credentials");
      setCredentials(data);
    } catch (err) {
      console.error("Failed to load BYOK credentials:", err);
    } finally {
      setLoadingCreds(false);
    }
  };

  useEffect(() => {
    if (activeTab === "profile") {
      fetchCredentials();
    }
  }, [activeTab]);

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !acknowledgedDisclosure) return;

    setSubmittingCred(true);
    try {
      const created = await apiFetch<AIProviderCredential>("/api/students/credentials", {
        method: "POST",
        body: JSON.stringify({
          provider: selectedProvider,
          api_key: apiKey.trim(),
          is_default: isDefault,
        }),
      });

      // Update credentials state
      setCredentials((prev) => {
        const filtered = prev.filter((c) => c.provider !== created.provider);
        if (created.is_default) {
          return [...filtered.map((c) => ({ ...c, is_default: false })), created];
        }
        return [...filtered, created];
      });

      setIsAddModalOpen(false);
      setApiKey("");
      setAcknowledgedDisclosure(false);
      setSelectedProvider("gemini");
    } catch (err: any) {
      alert(err.message || "Failed to configure provider credential");
    } finally {
      setSubmittingCred(false);
    }
  };

  const handleRevokeCredential = async (credId: number, providerName: string) => {
    if (!confirm(`Are you sure you want to revoke your ${providerName} credential? Further requests using this provider will be blocked.`)) {
      return;
    }
    try {
      await apiFetch(`/api/students/credentials/${credId}`, { method: "DELETE" });
      setCredentials((prev) => prev.filter((c) => c.id !== credId));
    } catch (err: any) {
      alert(err.message || "Failed to revoke credential");
    }
  };

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
            <div className="p-5 bg-slate-950 text-white h-full overflow-y-auto space-y-5">
              {/* Profile Header */}
              <div className="text-center py-4 border-b border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-sky-500 mx-auto flex items-center justify-center mb-2.5 text-sky-400">
                  <UserCircle className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-white">{user?.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                <span className="inline-block px-2.5 py-0.5 bg-sky-950 text-sky-400 rounded-full text-[10px] font-semibold mt-1.5 border border-sky-800">
                  Enrolled Student
                </span>
              </div>

              {/* AI Providers & BYOK Keys Section (SRS Section 4.7) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      AI Providers (BYOK)
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Multi-provider encrypted keys (SRS FR-7).
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Provider</span>
                  </button>
                </div>

                {/* Configured Credentials Cards */}
                {loadingCreds ? (
                  <p className="text-[11px] text-slate-500 italic text-center py-3">Loading credentials...</p>
                ) : credentials.length === 0 ? (
                  <div className="p-3.5 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center">
                    <Sparkles className="w-5 h-5 text-amber-400/80 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-300">No BYOK Providers Configured</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                      Gemini is recommended as your initial provider (SRS FR-7.2). Add an API key to enable customized AI routing.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedProvider("gemini");
                        setIsAddModalOpen(true);
                      }}
                      className="mt-2.5 px-3 py-1 bg-amber-950/80 border border-amber-800/60 hover:bg-amber-900/80 text-amber-300 rounded-lg text-[10px] font-semibold transition-colors"
                    >
                      Configure Gemini Key
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {credentials.map((cred) => {
                      const providerMeta = SUPPORTED_BYOK_PROVIDERS.find((p) => p.id === cred.provider);
                      return (
                        <div
                          key={cred.id}
                          className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-semibold text-xs text-white">
                                {providerMeta?.name || cred.provider.toUpperCase()}
                              </span>
                              {cred.is_default && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[9px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                                  Default
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[9px] font-semibold capitalize">
                                {cred.status}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <Key className="w-3 h-3 text-slate-500" />
                              <span>{cred.masked_key}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleRevokeCredential(cred.id, providerMeta?.name || cred.provider)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/70 text-red-400 hover:text-red-200 border border-red-800/40 transition-colors"
                            title="Revoke / Delete Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Subject Memberships */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Subject Memberships (SBAC):
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
                className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 font-medium text-xs flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal: Add AI Provider Credential (SRS Section 4.7) */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <Key className="w-4 h-4 text-amber-400" />
                  Configure AI Provider (BYOK)
                </h4>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCredential} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Select AI Provider (SRS FR-7.1)
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    {SUPPORTED_BYOK_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.recommended ? "★ (Recommended)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      SUPPORTED_BYOK_PROVIDERS.find((p) => p.id === selectedProvider)?.placeholder ||
                      "Paste your API key..."
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Stored encrypted at rest (AES-256). Decrypted in memory only (SRS FR-7.3).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefaultCred"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="isDefaultCred" className="text-xs text-slate-300 cursor-pointer">
                    Set as default provider for Q&A and Quizzes
                  </label>
                </div>

                {/* Provider Disclosure & Acknowledgment (SRS FR-7.8) */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Provider Disclosure
                  </p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {PROVIDER_DISCLOSURES[selectedProvider]}
                  </p>
                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={acknowledgedDisclosure}
                      onChange={(e) => setAcknowledgedDisclosure(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    <span className="text-[10px] text-slate-400">
                      I have read and acknowledge this provider's terms and privacy disclosure (SRS FR-7.8).
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCred || !apiKey.trim() || !acknowledgedDisclosure}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400 disabled:opacity-40"
                  >
                    {submittingCred ? "Saving..." : "Save Credential"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex justify-around items-center shrink-0">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "chat" ? "text-sky-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Academic Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "quiz" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Quiz Battle</span>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              activeTab === "profile" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
