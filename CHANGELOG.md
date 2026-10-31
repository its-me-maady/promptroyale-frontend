# Changelog

All notable changes to the Prompt Royale Frontend Applications will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- [#9] Implemented Student Profile BYOK AI Providers management section in `components/StudentMobileApp.tsx` with multi-provider credentials, masked keys, SRS FR-7.8 provider disclosures, Gemini-first recommendation, and revocation controls (closes #9).
- [#9] Added `SUPPORTED_BYOK_PROVIDERS` and `PROVIDER_DISCLOSURES` in `lib/api.ts` covering Gemini, OpenAI, Anthropic, DeepSeek, and OpenRouter.
- [#9] Added automated Vitest unit tests in `tests/byok_credentials.test.ts` verifying provider order and disclosure definitions.
- [#7] Added dedicated "Faculty & Staff" tab and management directory in `components/AdminDashboard.tsx` with search, creation modal, and deletion capability (closes #7).
- [#7] Added multi-select staff assignment checklist to department creation and department editing modals in `components/AdminDashboard.tsx`, displaying assigned staff pills on department cards.
- [#7] Added student deletion button with confirmation in `components/FacultyPortal.tsx` and user account deletion button in `components/AdminDashboard.tsx`.
- [#7] Updated `lib/api.ts` with `assigned_staff_ids` in `Department` and `department_id` in `UserAdmin`.
- [#7] Added unit test cases in `tests/admin_faculty.test.ts` verifying staff data models and multi-select toggle logic.
- [#5] Implemented Department Edit modal in `components/AdminDashboard.tsx` enabling administrators to update department code and name (closes #5).
- [#5] Enhanced Add Department modal with mandatory primary faculty credentials (name, institutional email, password) to atomically staff new departments.
- [#5] Displayed Lead Faculty email on department directory cards in `components/AdminDashboard.tsx`.
- [#5] Added unit test cases in `tests/admin_faculty.test.ts` verifying department editing and faculty provisioning schemas.
- [#3] Implemented dedicated College Administrator Dashboard (`components/AdminDashboard.tsx`) with institutional KPI metrics, billing snapshot & token quota meter (SRS 4.9), department provisioning, and user accounts lifecycle directory (closes #3).
- [#3] Differentiated role-based routing in `app/page.tsx` directing `college_admin` to `AdminDashboard` and `department_user` to `FacultyPortal`.
- [#3] Enhanced Faculty Portal (`components/FacultyPortal.tsx`) with search filters, "+ Add Subject" modal, "+ Add Student" modal, and row-level "Edit" modals to update details and manage Subject-Based Access Control (SBAC) student memberships.
- [#3] Removed institutional demo credentials helper box from `components/LoginForm.tsx` ensuring clean production login interface.
- [#3] Added Vitest unit test suite in `tests/admin_faculty.test.ts` verifying role routing, admin models, and SBAC search/membership logic.
- [#1] Implemented authentic institutional login for Vaigai College with JWT session state management in `components/LoginForm.tsx` and `components/AuthContext.tsx` (closes #1).
- [#1] Implemented Prompt Royale Student Mobile App shell in `components/StudentMobileApp.tsx` featuring mobile device frame, status bar, and bottom navigation.
- [#1] Implemented Grounded Academic Q&A chat with subject picker and interactive citation drawer in `components/StudentQAChat.tsx` and `components/CitationDrawer.tsx`.
- [#1] Implemented 10-Question Solo Quiz Battle arena in `components/QuizBattleArena.tsx` with 60-second timer, option selection, and final scorecard review.
- [#1] Implemented Faculty & Administrator Desktop Management Portal in `components/FacultyPortal.tsx` with subject oversight, Gemini document ingestion status, and student roster.
- [#1] Added automated unit test suite in `tests/api.test.ts` verifying SBAC constraints and platform specifications.
