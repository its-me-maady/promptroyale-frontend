// API client with JWT Bearer Token injection

export interface User {
  id: number;
  email: string;
  name: string;
  role: "student" | "department_user" | "college_admin";
  college_id: number;
  department_id?: number | null;
  enrolled_subjects: number[];
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  department_id: number;
  document_count: number;
  enrolled_student_count?: number;
}

export interface Document {
  id: number;
  title: string;
  subject_id: number;
  file_type: string;
  processing_status: string;
}

export interface Citation {
  document_title: string;
  section_title: string;
  snippet: string;
}

export interface ChatQueryResponse {
  answer: string;
  citations: Citation[];
  is_insufficient_evidence: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  source_citation: string;
}

export interface QuizStartResponse {
  battle_id: string;
  subject_code: string;
  subject_name: string;
  time_limit_seconds: number;
  questions: QuizQuestion[];
}

export interface QuizQuestionReview {
  question_id: number;
  question: string;
  selected_option: number;
  correct_option: number;
  explanation: string;
  source_citation: string;
  is_correct: boolean;
}

export interface QuizSubmitResponse {
  score: number;
  total: number;
  accuracy_percentage: number;
  time_taken_seconds: number;
  review: QuizQuestionReview[];
}

// Student Management Interfaces
export interface StudentEnrolledSubject {
  id: number;
  code: string;
  name: string;
}

export interface StudentDetail {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  enrolled_subjects: number[];
  enrolled_subject_details: StudentEnrolledSubject[];
}

export interface SubjectStudents {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  enrolled: StudentDetail[];
  available_students: StudentDetail[];
}

// Admin Governance Interfaces
export interface Department {
  id: number;
  college_id: number;
  name: string;
  code: string;
  subject_count: number;
  faculty_count: number;
  lead_faculty_email?: string | null;
}

export interface BillingSnapshot {
  snapshot_date: string;
  active_student_count: number;
  monthly_token_quota: number;
  tokens_consumed: number;
  tier: string;
}

export interface AdminOverview {
  college_id: number;
  college_name: string;
  college_domain: string;
  department_count: number;
  subject_count: number;
  student_count: number;
  faculty_count: number;
  billing_snapshot: BillingSnapshot;
  ai_status: string;
}

export interface UserAdmin {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  department_name?: string | null;
  created_at: string;
}

function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pr_access_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}
