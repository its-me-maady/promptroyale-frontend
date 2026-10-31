"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { AdminOverview, Department, UserAdmin, apiFetch } from "@/lib/api";
import {
  GraduationCap,
  Building,
  Layers,
  Users,
  Sparkles,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Edit2,
  Mail,
  Trash2,
  UserCheck,
  UserPlus
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [usersList, setUsersList] = useState<UserAdmin[]>([]);
  const [staffList, setStaffList] = useState<UserAdmin[]>([]);
  const [activeTab, setActiveTab] = useState<"departments" | "staff" | "users">("departments");
  const [loading, setLoading] = useState(true);

  // Add Department State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptStaffIds, setDeptStaffIds] = useState<number[]>([]);
  const [facultyName, setFacultyName] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("Vaigai@123");
  const [submittingDept, setSubmittingDept] = useState(false);

  // Edit Department State
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptCode, setEditDeptCode] = useState("");
  const [editStaffIds, setEditStaffIds] = useState<number[]>([]);
  const [submittingEditDept, setSubmittingEditDept] = useState(false);

  // Add Staff State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("Vaigai@123");
  const [staffDeptId, setStaffDeptId] = useState<number | null>(null);
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Search & Filter State
  const [deptSearch, setDeptSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovData, deptData, uData, sData] = await Promise.all([
        apiFetch<AdminOverview>("/api/admin/overview"),
        apiFetch<Department[]>("/api/admin/departments"),
        apiFetch<UserAdmin[]>("/api/admin/users"),
        apiFetch<UserAdmin[]>("/api/admin/staff"),
      ]);
      setOverview(ovData);
      setDepartments(deptData);
      setUsersList(uData);
      setStaffList(sData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;
    setSubmittingDept(true);
    try {
      const payload: any = {
        name: deptName,
        code: deptCode,
        staff_ids: deptStaffIds,
      };
      if (facultyEmail && facultyPassword) {
        payload.faculty_name = facultyName;
        payload.faculty_email = facultyEmail;
        payload.faculty_password = facultyPassword;
      }
      const created = await apiFetch<Department>("/api/admin/departments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setDepartments((prev) => [...prev, created]);
      setIsDeptModalOpen(false);
      setDeptName("");
      setDeptCode("");
      setDeptStaffIds([]);
      setFacultyName("");
      setFacultyEmail("");
      setFacultyPassword("Vaigai@123");

      // Refresh overview, staff and users list
      const [ov, uData, sData] = await Promise.all([
        apiFetch<AdminOverview>("/api/admin/overview"),
        apiFetch<UserAdmin[]>("/api/admin/users"),
        apiFetch<UserAdmin[]>("/api/admin/staff"),
      ]);
      setOverview(ov);
      setUsersList(uData);
      setStaffList(sData);
    } catch (err: any) {
      alert(err.message || "Failed to create department");
    } finally {
      setSubmittingDept(false);
    }
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setEditDeptName(dept.name);
    setEditDeptCode(dept.code);
    setEditStaffIds(dept.assigned_staff_ids || []);
  };

  const handleSaveEditDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept || !editDeptName || !editDeptCode) return;
    setSubmittingEditDept(true);
    try {
      const updated = await apiFetch<Department>(`/api/admin/departments/${editingDept.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editDeptName,
          code: editDeptCode,
          staff_ids: editStaffIds,
        }),
      });
      setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingDept(null);

      // Refresh staff list to update their department assignments
      const [sData, uData] = await Promise.all([
        apiFetch<UserAdmin[]>("/api/admin/staff"),
        apiFetch<UserAdmin[]>("/api/admin/users"),
      ]);
      setStaffList(sData);
      setUsersList(uData);
    } catch (err: any) {
      alert(err.message || "Failed to update department");
    } finally {
      setSubmittingEditDept(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) return;
    setSubmittingStaff(true);
    try {
      const newStaff = await apiFetch<UserAdmin>("/api/admin/staff", {
        method: "POST",
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          password: staffPassword,
          department_id: staffDeptId,
        }),
      });
      setStaffList((prev) => [...prev, newStaff]);
      setUsersList((prev) => [...prev, newStaff]);
      setIsStaffModalOpen(false);
      setStaffName("");
      setStaffEmail("");
      setStaffPassword("Vaigai@123");
      setStaffDeptId(null);

      // Refresh overview and departments
      const [ov, deptData] = await Promise.all([
        apiFetch<AdminOverview>("/api/admin/overview"),
        apiFetch<Department[]>("/api/admin/departments"),
      ]);
      setOverview(ov);
      setDepartments(deptData);
    } catch (err: any) {
      alert(err.message || "Failed to create staff member");
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete staff member "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await apiFetch(`/api/admin/staff/${staffId}`, { method: "DELETE" });
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      setUsersList((prev) => prev.filter((u) => u.id !== staffId));

      // Refresh overview and departments
      const [ov, deptData] = await Promise.all([
        apiFetch<AdminOverview>("/api/admin/overview"),
        apiFetch<Department[]>("/api/admin/departments"),
      ]);
      setOverview(ov);
      setDepartments(deptData);
    } catch (err: any) {
      alert(err.message || "Failed to delete staff member");
    }
  };

  const handleDeleteUser = async (userId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete account "${name}"? All associated data will be removed.`)) {
      return;
    }
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      setStaffList((prev) => prev.filter((s) => s.id !== userId));

      const [ov, deptData] = await Promise.all([
        apiFetch<AdminOverview>("/api/admin/overview"),
        apiFetch<Department[]>("/api/admin/departments"),
      ]);
      setOverview(ov);
      setDepartments(deptData);
    } catch (err: any) {
      alert(err.message || "Failed to delete user account");
    }
  };

  const handleUpdateUserStatus = async (userId: number, newStatus: string) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      setStaffList((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, status: newStatus } : s))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
    d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(staffSearch.toLowerCase()) ||
    (s.department_name && s.department_name.toLowerCase().includes(staffSearch.toLowerCase()))
  );

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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
              <p className="text-[11px] text-amber-400 font-medium">Administrator Portal</p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("departments")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "departments"
                  ? "bg-amber-950/70 text-amber-300 border border-amber-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Building className="w-4 h-4 text-amber-400" />
              <span>Academic Departments</span>
            </button>

            <button
              onClick={() => setActiveTab("staff")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "staff"
                  ? "bg-amber-950/70 text-amber-300 border border-amber-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Faculty & Staff</span>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "users"
                  ? "bg-amber-950/70 text-amber-300 border border-amber-800/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Institutional Accounts</span>
            </button>
          </div>
        </div>

        {/* Administrator Profile Card */}
        <div className="pt-6 border-t border-slate-800">
          <div className="mb-3">
            <p className="text-xs font-bold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{user?.email}</p>
            <span className="inline-block px-2 py-0.5 bg-amber-950/80 border border-amber-800/60 rounded text-[9px] text-amber-300 font-semibold uppercase mt-1">
              College Administrator
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

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>Departments</span>
              <Building className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview?.department_count ?? 1}</p>
            <p className="text-xs text-amber-400 mt-0.5">Academic Units</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>Faculty & Staff</span>
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview?.faculty_count ?? 1}</p>
            <p className="text-xs text-amber-400 mt-0.5">Department Educators</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>Enrolled Students</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overview?.student_count ?? 1}</p>
            <p className="text-xs text-sky-400 mt-0.5">SBAC Protected</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
              <span>AI Token Quota (SRS 4.9)</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-white">
              {overview?.billing_snapshot
                ? `${(overview.billing_snapshot.tokens_consumed / 1000).toFixed(0)}k / ${(overview.billing_snapshot.monthly_token_quota / 1000).toFixed(0)}k`
                : "142k / 1M"}
            </p>
            <p className="text-xs text-indigo-400 mt-0.5">Gemini 1.5 Flash Connected</p>
          </div>
        </div>

        {activeTab === "departments" && (
          /* Departments View */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Academic Departments Directory</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Institutional branches established at Vaigai College of Engineering.
                </p>
              </div>
              <button
                onClick={() => setIsDeptModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                placeholder="Search departments by code or name..."
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500"
              />
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-5 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-800/50 rounded-lg text-amber-300 font-mono text-xs font-bold">
                        {dept.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditDept(dept)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          Active
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1.5">{dept.name}</h4>
                    {dept.lead_faculty_email && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2 font-mono">
                        <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{dept.lead_faculty_email}</span>
                      </p>
                    )}
                    {/* Assigned staff members pills */}
                    {dept.assigned_staff_ids && dept.assigned_staff_ids.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dept.assigned_staff_ids.map((sid) => {
                          const s = staffList.find((st) => st.id === sid);
                          return (
                            <span
                              key={sid}
                              className="px-2 py-0.5 bg-slate-900 border border-slate-700/80 rounded text-[10px] text-slate-300 font-medium"
                            >
                              {s ? s.name : `Staff #${sid}`}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Subjects: <strong className="text-white">{dept.subject_count}</strong></span>
                    <span>Staff Assigned: <strong className="text-white">{dept.faculty_count}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          /* Faculty & Staff Directory */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Faculty & Academic Staff Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Department faculty and academic instructors with departmental access.
                </p>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative mb-6">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder="Search staff by name, email, or department..."
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500"
              />
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Institutional Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                        No staff members found.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="p-3 font-semibold text-white">{s.name}</td>
                        <td className="p-3 font-mono text-amber-400">{s.email}</td>
                        <td className="p-3">
                          {s.department_name ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300 font-medium text-[11px]">
                              {s.department_name}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 capitalize">
                            <CheckCircle2 className="w-3 h-3" />
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteStaff(s.id, s.name)}
                            className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-200 border border-red-800/50 transition-colors inline-flex items-center gap-1"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-medium">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          /* Institutional Accounts Governance View */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white">Institutional Accounts & Access Governance</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage account lifecycle states: Active, Suspended, or Deactivated (SRS FR-2.4).
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter users by name or email..."
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 placeholder:text-slate-500"
                />
              </div>

              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="department_user">Faculty (Department Staff)</option>
                  <option value="college_admin">College Administrator</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value="all">All Account Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Institutional Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Status (FR-2.4)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{u.name}</td>
                      <td className="p-3 font-mono text-sky-400">{u.email}</td>
                      <td className="p-3">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{u.department_name || "Institutional"}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.status === "active"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                              : u.status === "suspended"
                              ? "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                              : "bg-red-950/80 text-red-400 border border-red-800/60"
                          }`}
                        >
                          {u.status === "active" && <CheckCircle2 className="w-3 h-3" />}
                          {u.status === "suspended" && <AlertTriangle className="w-3 h-3" />}
                          {u.status === "deactivated" && <XCircle className="w-3 h-3" />}
                          <span className="capitalize">{u.status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {u.status !== "active" && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, "active")}
                              className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-[10px]"
                            >
                              Activate
                            </button>
                          )}
                          {u.status !== "suspended" && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, "suspended")}
                              className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded text-[10px]"
                            >
                              Suspend
                            </button>
                          )}
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1 rounded bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-red-200 border border-red-800/50 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Department with Staff Multi-Select */}
        {isDeptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-400" />
                  Add Department & Assign Staff
                </h4>
                <button
                  onClick={() => setIsDeptModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. MECH, IT, ECE"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Department Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Mechanical Engineering"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {/* Staff Multi-Select Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Select Staff Members to Assign (Multi-Select)
                  </label>
                  {staffList.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      No staff accounts found. You can provision a new faculty lead below.
                    </p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 p-2.5 bg-slate-950 border border-slate-700 rounded-xl">
                      {staffList.map((s) => {
                        const isChecked = deptStaffIds.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs text-slate-300"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setDeptStaffIds((prev) =>
                                  prev.includes(s.id)
                                    ? prev.filter((id) => id !== s.id)
                                    : [...prev, s.id]
                                );
                              }}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="font-medium text-white">{s.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{s.email}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <p className="text-[11px] font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    Or Provision New Faculty Lead Account
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Faculty Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      placeholder="e.g. Dr. S. Kumar (HOD)"
                      className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Faculty Institutional Email ID (Optional if selecting existing staff)
                    </label>
                    <input
                      type="email"
                      value={facultyEmail}
                      onChange={(e) => setFacultyEmail(e.target.value)}
                      placeholder="faculty.mech@vaigai.edu"
                      className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Faculty Initial Password
                    </label>
                    <input
                      type="password"
                      value={facultyPassword}
                      onChange={(e) => setFacultyPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDept}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400"
                  >
                    {submittingDept ? "Saving..." : "Save Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Department with Multi-Select Staff */}
        {editingDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  Edit Department ({editingDept.code})
                </h4>
                <button
                  onClick={() => setEditingDept(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditDept} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editDeptCode}
                    onChange={(e) => setEditDeptCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Department Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editDeptName}
                    onChange={(e) => setEditDeptName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                {/* Staff Multi-Select Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Assigned Staff Members (Multi-Select)
                  </label>
                  {staffList.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      No staff members created yet.
                    </p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-2.5 bg-slate-950 border border-slate-700 rounded-xl">
                      {staffList.map((s) => {
                        const isChecked = editStaffIds.includes(s.id);
                        const assignedElsewhere = s.department_id && s.department_id !== editingDept.id;
                        return (
                          <label
                            key={s.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer text-xs text-slate-300"
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setEditStaffIds((prev) =>
                                    prev.includes(s.id)
                                      ? prev.filter((id) => id !== s.id)
                                      : [...prev, s.id]
                                  );
                                }}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                              />
                              <div>
                                <span className="font-medium text-white">{s.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono ml-2">({s.email})</span>
                              </div>
                            </div>
                            {assignedElsewhere && (
                              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300">
                                {s.department_name}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDept(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEditDept}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400"
                  >
                    {submittingEditDept ? "Saving..." : "Update Department"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Staff Member */}
        {isStaffModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  Create Faculty / Staff Account
                </h4>
                <button
                  onClick={() => setIsStaffModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g. Dr. K. Meenakshi"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="e.g. meenakshi@vaigai.edu"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Department Assignment (Optional)
                  </label>
                  <select
                    value={staffDeptId ?? ""}
                    onChange={(e) => setStaffDeptId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="">Unassigned (Assign later)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStaff}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400"
                  >
                    {submittingStaff ? "Creating..." : "Create Staff Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
