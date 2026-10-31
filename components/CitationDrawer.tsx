"use client";

import React from "react";
import { Citation } from "@/lib/api";
import { X, BookOpen, FileText, CheckCircle2 } from "lucide-react";

interface CitationDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 relative animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-sky-400 mb-2 font-medium text-xs tracking-wider uppercase">
          <BookOpen className="w-4 h-4" />
          Verified Academic Citation
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          {citation.document_title}
        </h3>
        <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          Section: <span className="text-slate-200 font-medium">{citation.section_title}</span>
        </p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Vetted Source Excerpt:
          </p>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            "{citation.snippet}"
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-2 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Grounded directly in Vaigai College Department syllabus repository.
        </div>
      </div>
    </div>
  );
};
