# Contributing Guidelines

Thank you for your interest in contributing to **tactical-guardian**! This project is under active development, so keeping contributions structured helps ensure smooth code reviews and clean collaboration.

---

## How Can I Contribute?

### 1. Reporting Bugs & Requesting Features
* **Check Existing Issues:** Search open issues before creating a new one to avoid duplicates.
* **Use Clear Titles:** Format titles logically (e.g., `bug: Map fails to load on mobile Safari` or `feat: Add dark mode toggle`).
* **Provide Context:** Include step-by-step reproduction instructions, expected vs. actual behavior, and relevant screenshots or console logs.

### 2. Submitting Pull Requests (PRs)
* **Branching Strategy:** Create a new feature or fix branch off `main` using descriptive names:
  * `feat/feature-name`
  * `fix/bug-description`
  * `chore/task-name`
* **Commit Conventions:** Follow basic [Conventional Commits](https://www.conventionalcommits.org/):
  * `feat:` New user-facing feature
  * `fix:` Bug fix
  * `chore:` Build tasks, package updates, configuration changes
  * `docs:` Documentation updates
* **Keep PRs Scope-Focused:** Keep changes tight and single-purpose so they are fast and easy to review.
* **Reference Issues:** Link relevant issue numbers in your PR description (e.g., `Closes #12`).

---

## Local Setup

1. **Fork & Clone:**
   ```bash
   git clone git@github.com:JVCaballero/sari-sari-retail-inventory-and-payments-dashboard.git
   cd sari-sari-retail-inventory-and-payments-dashboard

2. **Environment Configuration:**
Copy `.env.example` to `.env.local` and populate necessary API keys or variables before running the app.




---

## Code Quality & Standards

* Run formatting/linting scripts prior to opening a PR.
* Ensure secret keys and credentials are never checked into version control.
* Include brief inline comments for complex logic or architecture workarounds.
