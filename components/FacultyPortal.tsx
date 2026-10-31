"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Subject, Document, apiFetch } from "@/lib/api";
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Users, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  LogOut, 
  ShieldCheck,
  Building,
  Layers
} from "lucide-react";

export const FacultyPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeNav, setActiveNav] = useState<"syllabus" | "students" | "settings">("syllabus");

  useEffect(() => {
    apiFetch<Subject[]>("/api/subjects")
      .then((data) => {
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubjectId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      apiFetch<Document[]>(`/api/subjects/${selectedSubjectId}/documents`)
        .then((data) => setDocuments(data))
        .catch((err) => console.error(err));
    }
  }, [selectedSubjectId]);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;

    setUploading(true);
    setTimeout(() => {
      const newDoc: Document = {
        id: Date.now(),
        title: noteTitle,
        subject_id: selectedSubjectId,
        file_type: "markdown",
        processing_status: "available",
      };
      setDocuments((prev) => [...prev, newDoc]);
      setNoteTitle("");
      setNoteContent("");
      setUploading(false);
    }, 1200);
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Vaigai College</h1>
              <p className="text-[11px] text-sky-400 font-medium">Faculty & Admin Web Portal</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveNav("syllabus")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeNav === "syllabus"
                  ? "bg-sky-950/80 text-sky-300 border border-sky-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Subjects & Syllabus</span>
            </button>

            <button
              onClick={() => setActiveNav("students")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeNav === "students"
                  ? "bg-sky-950/80 text-sky-300 border border-sky-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Student Roster (SBAC)</span>
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user?.email}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/60 rounded text-[9px] text-emerald-300 font-semibold uppercase mt-1">
                {user?.role === "department_user" ? "CSE Department Faculty" : "College Administrator"}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-lg bg-slate-800/70 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-slate-700/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Dashboard */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>Department</span>
              <Building className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-lg font-bold text-white">Computer Science</p>
            <p className="text-xs text-sky-400 font-mono mt-0.5">Code: CSE</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>Managed Subjects</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-white">{subjects.length} Subjects Active</p>
            <p className="text-xs text-emerald-400 mt-0.5">CS101, CS202</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>Document Parser</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-white">Google Gemini API</p>
            <p className="text-xs text-indigo-400 mt-0.5">Auto-chunking & Citations</p>
          </div>
        </div>

        {activeNav === "syllabus" ? (
          <div className="space-y-6">
            {/* Subject Selector Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedSubjectId === sub.id
                      ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{sub.code}:</span>
                  <span>{sub.name}</span>
                </button>
              ))}
            </div>

            {/* Document Ingestion & Vetting List */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Vetted Academic Materials for {selectedSubject?.code}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedSubject?.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>RAG Knowledge Base Live</span>
                </div>
              </div>

              <div className="space-y-2.5 mb-6">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800/60 flex items-center justify-center text-sky-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{doc.title}</p>
                        <p className="text-[11px] text-slate-400">Format: {doc.file_type.toUpperCase()} • Grounded & Chunked</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Parsed with Gemini (Available)</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Document Form */}
              <form onSubmit={handleSimulateUpload} className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  Upload Additional Academic Notes
                </h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Lecture / Module Title (e.g., Module 4 — Dynamic Programming)"
                      className="w-full bg-slate-900 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={3}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Paste markdown content or lecture notes excerpt here..."
                      className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={uploading || !noteTitle}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-40"
                  >
                    {uploading ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing Document with Gemini API...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit for Academic Ingestion</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Student Roster Section */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-2">Subject-Based Access Control (SBAC) Roster</h3>
            <p className="text-xs text-slate-400 mb-6">
              Students can retrieve AI answers exclusively from subjects with active memberships.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Assigned Subjects</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-white">Adhithiyan</td>
                    <td className="p-3 text-sky-400">adhithiyan@vaigai.edu</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        CS101: Data Structures
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-medium">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
