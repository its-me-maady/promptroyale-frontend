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
  assigned_staff_ids?: number[];
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
  department_id?: number | null;
  department_name?: string | null;
  created_at: string;
}

// Student BYOK AI Provider Credential Interfaces (SRS Section 4.7)
export interface AIProviderCredential {
  id: number;
  student_id: number;
  provider: "gemini" | "openai" | "anthropic" | "deepseek" | "openrouter" | string;
  masked_key: string;
  status: "active" | "revoked" | string;
  is_default: boolean;
  created_at: string;
}

export interface BYOKProviderInfo {
  id: string;
  name: string;
  badge: string;
  recommended?: boolean;
  placeholder: string;
}

export const SUPPORTED_BYOK_PROVIDERS: BYOKProviderInfo[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Recommended (SRS FR-7.2)",
    recommended: true,
    placeholder: "AIzaSy...",
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "GPT-4o & Mini",
    placeholder: "sk-proj-...",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "Claude 3.5 Sonnet",
    placeholder: "sk-ant-...",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "DeepSeek-V3 & R1",
    placeholder: "sk-...",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "Multi-Model Router",
    placeholder: "sk-or-...",
  },
];

export const PROVIDER_DISCLOSURES: Record<string, string> = {
  gemini:
    "Google Gemini API calls adhere to Google Cloud enterprise privacy standards. Academic queries and vetted syllabus excerpts are processed in memory and are not retained to train foundational AI models.",
  openai:
    "OpenAI API endpoints do not utilize data submitted via API calls to train or improve models. Your institutional queries remain confidential per OpenAI commercial API terms.",
  anthropic:
    "Anthropic Claude API guarantees zero data retention for training foundational models. Queries are routed securely under strict commercial privacy protections.",
  deepseek:
    "DeepSeek API handles queries under commercial token processing terms with session isolation for academic retrieval tasks.",
  openrouter:
    "OpenRouter aggregates access to multiple frontier AI models with unified API keys and encrypted transit routing per OpenRouter security specifications.",
};

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
