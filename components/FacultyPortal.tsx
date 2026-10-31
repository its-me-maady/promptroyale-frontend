"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  Subject,
  Document,
  StudentDetail,
  SubjectStudents,
  apiFetch
} from "@/lib/api";
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
  Layers,
  Search,
  Plus,
  Edit2,
  X,
  UserCheck,
  UserMinus,
  Trash2
} from "lucide-react";

export const FacultyPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(1);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [activeNav, setActiveNav] = useState<"subjects" | "syllabus" | "students">("subjects");

  // Search States
  const [subjectSearch, setSubjectSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  // Syllabus Upload State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [uploading, setUploading] = useState(false);

  // Modal: Add Subject
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [submittingSub, setSubmittingSub] = useState(false);

  // Modal: Edit Subject & Manage Students
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectStudentsData, setSubjectStudentsData] = useState<SubjectStudents | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubDesc, setEditSubDesc] = useState("");
  const [updatingSubject, setUpdatingSubject] = useState(false);

  // Modal: Add Student
  const [isAddStuModalOpen, setIsAddStuModalOpen] = useState(false);
  const [newStuName, setNewStuName] = useState("");
  const [newStuEmail, setNewStuEmail] = useState("");
  const [newStuPassword, setNewStuPassword] = useState("Vaigai@123");
  const [newStuSubjects, setNewStuSubjects] = useState<number[]>([]);
  const [submittingStu, setSubmittingStu] = useState(false);

  // Modal: Edit Student
  const [editingStudent, setEditingStudent] = useState<StudentDetail | null>(null);
  const [editStuName, setEditStuName] = useState("");
  const [updatingStudent, setUpdatingStudent] = useState(false);

  const loadSubjects = async () => {
    try {
      const data = await apiFetch<Subject[]>("/api/subjects");
      setSubjects(data);
      if (data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await apiFetch<StudentDetail[]>("/api/students");
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      apiFetch<Document[]>(`/api/subjects/${selectedSubjectId}/documents`)
        .then((data) => setDocuments(data))
        .catch((err) => console.error(err));
    }
  }, [selectedSubjectId]);

  // Open Edit Subject Modal
  const handleOpenEditSubject = async (sub: Subject) => {
    setEditingSubject(sub);
    setEditSubName(sub.name);
    setEditSubDesc(sub.description || "");
    try {
      const data = await apiFetch<SubjectStudents>(`/api/subjects/${sub.id}/students`);
      setSubjectStudentsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    setUpdatingSubject(true);
    try {
      const updated = await apiFetch<Subject>(`/api/subjects/${editingSubject.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editSubName, description: editSubDesc }),
      });
      setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSubject(null);
    } catch (err: any) {
      alert(err.message || "Failed to update subject");
    } finally {
      setUpdatingSubject(false);
    }
  };

  const handleToggleStudentInSubject = async (studentId: number, currentlyEnrolled: boolean) => {
    if (!editingSubject) return;
    try {
      if (currentlyEnrolled) {
        await apiFetch(`/api/subjects/${editingSubject.id}/students/${studentId}`, {
          method: "DELETE",
        });
      } else {
        await apiFetch(`/api/subjects/${editingSubject.id}/students`, {
          method: "POST",
          body: JSON.stringify({ student_id: studentId }),
        });
      }
      // Refresh students in this subject and global student roster
      const data = await apiFetch<SubjectStudents>(`/api/subjects/${editingSubject.id}/students`);
      setSubjectStudentsData(data);
      loadSubjects();
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to toggle student enrollment");
    }
  };

  // Create Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode || !newSubName) return;
    setSubmittingSub(true);
    try {
      const created = await apiFetch<Subject>("/api/subjects", {
        method: "POST",
        body: JSON.stringify({ code: newSubCode, name: newSubName, description: newSubDesc }),
      });
      setSubjects((prev) => [...prev, created]);
      setIsAddSubModalOpen(false);
      setNewSubCode("");
      setNewSubName("");
      setNewSubDesc("");
    } catch (err: any) {
      alert(err.message || "Failed to create subject");
    } finally {
      setSubmittingSub(false);
    }
  };

  // Create Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuName || !newStuEmail) return;
    setSubmittingStu(true);
    try {
      const created = await apiFetch<StudentDetail>("/api/students", {
        method: "POST",
        body: JSON.stringify({
          name: newStuName,
          email: newStuEmail,
          password: newStuPassword,
          initial_subject_ids: newStuSubjects,
        }),
      });
      setStudents((prev) => [...prev, created]);
      setIsAddStuModalOpen(false);
      setNewStuName("");
      setNewStuEmail("");
      setNewStuSubjects([]);
      loadSubjects();
    } catch (err: any) {
      alert(err.message || "Failed to create student");
    } finally {
      setSubmittingStu(false);
    }
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (stu: StudentDetail) => {
    setEditingStudent(stu);
    setEditStuName(stu.name);
  };

  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setUpdatingStudent(true);
    try {
      const updated = await apiFetch<StudentDetail>(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editStuName }),
      });
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingStudent(null);
    } catch (err: any) {
      alert(err.message || "Failed to update student");
    } finally {
      setUpdatingStudent(false);
    }
  };

  const handleToggleSubjectForStudent = async (subjectId: number, currentlyAssigned: boolean) => {
    if (!editingStudent) return;
    try {
      if (currentlyAssigned) {
        await apiFetch(`/api/students/${editingStudent.id}/subjects/${subjectId}`, {
          method: "DELETE",
        });
      } else {
        await apiFetch(`/api/students/${editingStudent.id}/subjects`, {
          method: "POST",
          body: JSON.stringify({ subject_id: subjectId }),
        });
      }
      // Refresh students
      const updatedList = await apiFetch<StudentDetail[]>("/api/students");
      setStudents(updatedList);
      const updatedSelf = updatedList.find((s) => s.id === editingStudent.id);
      if (updatedSelf) setEditingStudent(updatedSelf);
      loadSubjects();
    } catch (err: any) {
      alert(err.message || "Failed to update subject membership");
    }
  };

  const handleDeleteStudent = async (studentId: number, studentName: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete student "${studentName}"? All their course enrollments and records will be deleted.`
      )
    ) {
      return;
    }
    try {
      await apiFetch(`/api/students/${studentId}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      loadSubjects();
    } catch (err: any) {
      alert(err.message || "Failed to delete student");
    }
  };

  // Ingestion simulation
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

  const filteredSubjects = subjects.filter(
    (s) =>
      s.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Vaigai College</h1>
              <p className="text-[11px] text-sky-400 font-medium">CSE Faculty Portal</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveNav("subjects")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeNav === "subjects"
                  ? "bg-sky-950/80 text-sky-300 border border-sky-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Subjects & Curriculum</span>
            </button>

            <button
              onClick={() => setActiveNav("syllabus")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeNav === "syllabus"
                  ? "bg-sky-950/80 text-sky-300 border border-sky-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Vetted Notes (RAG)</span>
            </button>

            <button
              onClick={() => setActiveNav("students")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeNav === "students"
                  ? "bg-sky-950/80 text-sky-300 border border-sky-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Student Roster (SBAC)</span>
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="pt-6 border-t border-slate-800">
          <div className="mb-3">
            <p className="text-xs font-bold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{user?.email}</p>
            <span className="inline-block px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/60 rounded text-[9px] text-emerald-300 font-semibold uppercase mt-1">
              CSE Department Faculty
            </span>
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
            <p className="text-lg font-bold text-white">Computer Science & Engineering</p>
            <p className="text-xs text-sky-400 font-mono mt-0.5">Code: CSE</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>Department Subjects</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-white">{subjects.length} Active Courses</p>
            <p className="text-xs text-emerald-400 mt-0.5">SBAC Scoped</p>
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

        {/* Tab 1: Subjects & Curriculum Management */}
        {activeNav === "subjects" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Department Subjects & Curriculum</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage syllabus courses and configure student enrollment rosters (SBAC).
                </p>
              </div>
              <button
                onClick={() => setIsAddSubModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
                placeholder="Search subjects by code (e.g., CS101) or name..."
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder:text-slate-500"
              />
            </div>

            {/* Subject Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 bg-sky-950/80 border border-sky-800/60 rounded-lg text-sky-300 font-mono text-xs font-bold">
                        {sub.code}
                      </span>
                      <button
                        onClick={() => handleOpenEditSubject(sub)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{sub.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {sub.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      {sub.document_count} Vetted Notes
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Users className="w-3.5 h-3.5" />
                      {sub.enrolled_student_count ?? 0} Students Enrolled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Vetted Syllabus & Documents */}
        {activeNav === "syllabus" && (
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
                        <p className="text-[11px] text-slate-400">
                          Format: {doc.file_type.toUpperCase()} • Grounded & Chunked
                        </p>
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
        )}

        {/* Tab 3: Student Roster (SBAC) Management */}
        {activeNav === "students" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Student Roster & SBAC Access Control</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Students can only access AI Q&A and Quizzes for subjects with active memberships.
                </p>
              </div>
              <button
                onClick={() => setIsAddStuModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search students by name or email..."
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder:text-slate-500"
              />
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Assigned Subjects (SBAC)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{stu.name}</td>
                      <td className="p-3 font-mono text-sky-400">{stu.email}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {stu.enrolled_subject_details.length > 0 ? (
                            stu.enrolled_subject_details.map((sub) => (
                              <span
                                key={sub.id}
                                className="inline-block px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60 font-mono text-[10px]"
                              >
                                {sub.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">No subjects assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 capitalize">
                          {stu.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditStudent(stu)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3 text-sky-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(stu.id, stu.name)}
                            className="p-1.5 bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-200 border border-red-800/50 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Subject */}
        {isAddSubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Add Department Subject
                </h4>
                <button onClick={() => setIsAddSubModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="e.g. Design & Analysis of Algorithms"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newSubDesc}
                    onChange={(e) => setNewSubDesc(e.target.value)}
                    placeholder="Curriculum overview and objectives..."
                    className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddSubModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSub}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs"
                  >
                    {submittingSub ? "Creating..." : "Save Subject"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Subject & Student Enrollment */}
        {editingSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-sky-400" />
                  Edit Subject & Student Enrollment ({editingSubject.code})
                </h4>
                <button onClick={() => setEditingSubject(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Subject Info Form */}
              <form onSubmit={handleSaveEditSubject} className="space-y-3 mb-6 pb-6 border-b border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={editSubName}
                    onChange={(e) => setEditSubName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editSubDesc}
                    onChange={(e) => setEditSubDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white p-3 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingSubject}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
                  >
                    {updatingSubject ? "Saving..." : "Update Subject Info"}
                  </button>
                </div>
              </form>

              {/* Enrolled Students Management */}
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Student Enrollment Roster</span>
                  <span className="text-sky-400 font-mono text-[11px]">
                    {subjectStudentsData?.enrolled.length ?? 0} Enrolled
                  </span>
                </h5>
                <p className="text-[11px] text-slate-400 mb-4">
                  Add or remove students from {editingSubject.code}.
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {/* Currently Enrolled Students */}
                  {subjectStudentsData?.enrolled.map((stu) => (
                    <div
                      key={stu.id}
                      className="p-2.5 bg-slate-950 border border-emerald-800/40 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">{stu.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{stu.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleStudentInSubject(stu.id, true)}
                        className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[10px] flex items-center gap-1"
                      >
                        <UserMinus className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}

                  {/* Available Department Students to Enroll */}
                  {subjectStudentsData?.available_students.map((stu) => (
                    <div
                      key={stu.id}
                      className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-300">{stu.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{stu.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleStudentInSubject(stu.id, false)}
                        className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[10px] flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Enroll</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Student */}
        {isAddStuModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  Add Student to CSE Department
                </h4>
                <button onClick={() => setIsAddStuModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStuName}
                    onChange={(e) => setNewStuName(e.target.value)}
                    placeholder="e.g. Priya Raman"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">College Email ID</label>
                  <input
                    type="email"
                    required
                    value={newStuEmail}
                    onChange={(e) => setNewStuEmail(e.target.value)}
                    placeholder="priya@vaigai.edu"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Subject Memberships</label>
                  <div className="space-y-2 mt-1">
                    {subjects.map((sub) => (
                      <label key={sub.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newStuSubjects.includes(sub.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewStuSubjects((prev) => [...prev, sub.id]);
                            } else {
                              setNewStuSubjects((prev) => prev.filter((id) => id !== sub.id));
                            }
                          }}
                          className="rounded border-slate-700 text-sky-500 focus:ring-sky-400"
                        />
                        <span>{sub.code}: {sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStuModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStu}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs"
                  >
                    {submittingStu ? "Creating..." : "Save Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Student & Manage Assigned Subjects */}
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-sky-400" />
                  Edit Student & SBAC Memberships
                </h4>
                <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Info Form */}
              <form onSubmit={handleSaveEditStudent} className="space-y-3 mb-6 pb-6 border-b border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={editStuName}
                    onChange={(e) => setEditStuName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email (Read-only)</label>
                  <input
                    type="text"
                    disabled
                    value={editingStudent.email}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-500 px-3.5 py-2 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingStudent}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
                  >
                    {updatingStudent ? "Saving..." : "Update Name"}
                  </button>
                </div>
              </form>

              {/* Subject Memberships Checklist */}
              <div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Assigned Subject Memberships (SBAC)
                </h5>
                <p className="text-[11px] text-slate-400 mb-3">
                  Toggle subjects to permit or revoke AI retrieval access.
                </p>

                <div className="space-y-2">
                  {subjects.map((sub) => {
                    const isEnrolled = editingStudent.enrolled_subjects.includes(sub.id);
                    return (
                      <div
                        key={sub.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{sub.code}</p>
                          <p className="text-[10px] text-slate-400">{sub.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleSubjectForStudent(sub.id, isEnrolled)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            isEnrolled
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {isEnrolled ? "Enrolled (Click to Revoke)" : "Not Enrolled (Click to Add)"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
