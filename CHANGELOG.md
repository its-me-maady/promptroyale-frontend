# Changelog

All notable changes to the Prompt Royale Frontend Applications will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- [#1] Implemented authentic institutional login for Vaigai College with JWT session state management in `components/LoginForm.tsx` and `components/AuthContext.tsx` (closes #1).
- [#1] Implemented Prompt Royale Student Mobile App shell in `components/StudentMobileApp.tsx` featuring mobile device frame, status bar, and bottom navigation.
- [#1] Implemented Grounded Academic Q&A chat with subject picker and interactive citation drawer in `components/StudentQAChat.tsx` and `components/CitationDrawer.tsx`.
- [#1] Implemented 10-Question Solo Quiz Battle arena in `components/QuizBattleArena.tsx` with 60-second timer, option selection, and final scorecard review.
- [#1] Implemented Faculty & Administrator Desktop Management Portal in `components/FacultyPortal.tsx` with subject oversight, Gemini document ingestion status, and student roster.
- [#1] Added automated unit test suite in `tests/api.test.ts` verifying SBAC constraints and platform specifications.
