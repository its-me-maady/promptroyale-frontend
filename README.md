# Prompt Royale — Frontend Applications

Web Portals (Admin & Department Faculty) and Mobile client foundation for **Prompt Royale (College Academic AI Platform)**.

## Architecture

- **Web Framework:** Next.js 14+ (App Router, React 18, Tailwind CSS)
- **Portals:**
  - **College Administrator Portal:** College-wide settings, user rosters, department provisioning, billing tiers.
  - **Department User Portal:** Syllabus management, document upload/vetting, subject access lists.
  - **Student Experience:** Web & Mobile interfaces for Grounded Q&A, Citation Inspection, and Squad Quiz Battles.

## Development & Testing

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run development server
npm run dev
```

## Contributing & SDLC

This repository is governed by the autonomous SDLC agent workflow described in the root `AGENTS.md`. All issues are worked on within isolated `git worktrees`, verified with tests, tracked in `CHANGELOG.md`, and merged through peer review pull requests.
