# AI4ALL Healthcare Project

Next.js (client) + FastAPI (server) + conda (local) + optional Docker (later)

This repo has **two** parts:

- `/client` → Next.js (frontend)
- `/server` → FastAPI (backend, ML placeholder for now)

We develop **locally with conda** first. We only use **Docker** later when we want to demo/deploy.

---

## 1. Repo structure

```
.
├── README.md               ← project notes, collab config
├── client/                 ← Next.js app (Node)
└── server/                 ← FastAPI app (Python)
```
---


## 1. Quick Start (copy/paste)

```bash
# --- BACKEND ---
cd server
conda create -n all-ml python=3.11 -y
conda activate all-ml
pip install -r requirements.txt
uvicorn main:app --reload
# FastAPI now: http://127.0.0.1:8000/docs

# --- FRONTEND (new terminal) ---
cd client
npm install
npm run dev
# Next.js now: http://localhost:3000

---

## 📌 Team Workflow (Quick Start)
1. **Create a branch** off `main`.
2. **Commit small, often** with clear messages.
3. **Push** your branch to the remote.
4. **Open a Pull Request (PR)** and ask for review.
5. **Address feedback**, keep PRs small.
6. **Merge** with **Squash & Merge** into `main`.
7. **Delete** the feature branch you worked on after merge.

> Default branches: `main` (protected) → feature branches → PR → review → merge.

---

## ✅ Prerequisites
- Python 3.10+
- Git 2.30+

---

## 🧭 Repository Setup
```bash
# clone the repo
git clone https://github.com/akeight/ai4all-project.git
cd ai4all-project

# verify remotes
git remote -v

# sync to remote, if needed
git remote add origin https://github.com/akeight/ai4all-project.git

```
---

## 🌿 Branching Rules
- Name branches by type:
  - `feat/<short-name>` – new feature
  - `fix/<short-name>` – bug fix
  - `docs/<short-name>` – docs only
  - `chore/<short-name>` – tooling/cleanup

```bash
# create & switch to a new branch
git switch -c feat/add-model
# or 
git checkout -b feat/add-model
```

---

## 🔁 Daily Git Flow (Step‑by‑Step)
**1) Sync local `main`**
```bash
git switch main
git pull origin main
```
**2) Branch from `main`**
```bash
git switch -c feat/some-task
```
**3) Work & commit**
```bash
# stage specific files
git add path/to/file.ts
# commit with a clear message
git commit -m "feat(task): brief description"
```
**4) Push your branch**
```bash
git push -u origin feat/some-task
```
**5) Open a PR**
- Title: clear & concise
- Description: what/why/how
- Link any related issues
- Request everyone as reviewer

**6) Update branch if `main` changed**
```bash
# from your feature branch
git fetch origin
# Option A (beginner-friendly): merge
git merge origin/main
# Option B (clean history): rebase
# git rebase origin/main
```
**7) Address feedback & push updates**
```bash
git add .
git commit -m "fix:"
git push
```
**8) Merge**
- Use **Squash & Merge** to keep `main` tidy
- Delete the branch after merge

---

<!-- ## 🔧 Run the Project (example)
_Adapt these for your stack_
```bash
# install deps
npm install
# run dev server
npm run dev
# run tests
npm test
``` -->

<!-- ---

## 🧪 Pull Request Checklist
- [ ] Builds locally & tests pass
- [ ] Linting/formatting applied (e.g., Prettier/ESLint)
- [ ] Small, focused PR (≤ ~300 lines if possible)
- [ ] Clear screenshots or GIFs for UI changes
- [ ] Backwards compatible (no breaking API changes without plan)

--- -->