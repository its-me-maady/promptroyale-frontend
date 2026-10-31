"use client";

import React, { useState, useEffect, useRef } from "react";
import { Subject, Citation, ChatQueryResponse, apiFetch } from "@/lib/api";
import { Send, Sparkles, BookOpen, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { CitationDrawer } from "./CitationDrawer";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  citations?: Citation[];
  isInsufficient?: boolean;
}

export const StudentQAChat: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello Adhithiyan! I am your Vaigai College Academic AI assistant. Ask any question regarding your enrolled subjects, and I will provide answers strictly grounded in your syllabus notes with verifiable source citations.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<Subject[]>("/api/subjects")
      .then((data) => {
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectId(data[0].id);
        }
      })
      .catch((err) => console.error("Failed to load subjects", err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery("");

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
    };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await apiFetch<ChatQueryResponse>("/api/chat/query", {
        method: "POST",
        body: JSON.stringify({
          subject_id: selectedSubjectId,
          question: userText,
        }),
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: res.answer,
        citations: res.citations,
        isInsufficient: res.is_insufficient_evidence,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `Error: ${err.message}`,
        isInsufficient: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Subject Selector Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Subject:</span>
        </div>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
          className="bg-slate-800 text-sky-300 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-400 max-w-[200px] truncate"
        >
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.code}: {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-tr-xs"
                  : msg.isInsufficient
                  ? "bg-amber-950/40 border border-amber-600/40 text-amber-200 rounded-tl-xs"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-md"
              }`}
            >
              {msg.isInsufficient && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Academic Boundary Notice
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Verified Citations List */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Supporting Source Citations:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.citations.map((cite, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveCitation(cite)}
                        className="text-[11px] bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800/60 rounded-md px-2 py-0.5 transition-colors flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3 text-sky-400" />
                        [Ref: {cite.section_title}]
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
            <span>Consulting {currentSubject?.code || "Subject"} lecture notes & verifying citations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Quick Chips */}
      <div className="px-4 py-1.5 bg-slate-900/40 border-t border-slate-800/50 flex gap-1.5 overflow-x-auto text-[11px] text-slate-400">
        <span className="shrink-0 text-slate-500 font-medium">Try:</span>
        <button
          onClick={() => setInputQuery("How does BFS traversal work in a binary tree?")}
          className="bg-slate-800/70 hover:bg-slate-800 text-sky-300 rounded px-2 py-0.5 truncate shrink-0 transition-colors"
        >
          BFS traversal?
        </button>
        <button
          onClick={() => setInputQuery("What is Inorder traversal in a Binary Search Tree?")}
          className="bg-slate-800/70 hover:bg-slate-800 text-sky-300 rounded px-2 py-0.5 truncate shrink-0 transition-colors"
        >
          BST Inorder?
        </button>
        <button
          onClick={() => setInputQuery("Who won the 2024 FIFA World Cup?")}
          className="bg-slate-800/70 hover:bg-slate-800 text-amber-300 rounded px-2 py-0.5 truncate shrink-0 transition-colors"
        >
          Off-topic test
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask about ${currentSubject?.code || "Syllabus"}...`}
          className="flex-1 bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-sky-500/20 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Citation Inspector Modal */}
      <CitationDrawer citation={activeCitation} onClose={() => setActiveCitation(null)} />
    </div>
  );
};
