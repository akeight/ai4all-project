# AI4ALL Healthcare Project

React (client) + FastAPI (server) + conda (local) +  Docker (container)

This repo has **two** parts:

- `/client` → React/Vite (frontend)
- `/server` → FastAPI (backend, ML placeholder for now)

We develop **locally with conda** first. We only use **Docker** later when we want to demo/deploy.

---

## 1. Repo structure

```
project/
├── client/              ← All frontend code + assets
│   ├── public/
│   │   ├── metrics/     ← Frontend metrics generated from backend scripts
│   │   └── samples/
│   └── src/
├── server/              ← All backend code + data
│   ├── data/            ← Training/validation images
│   ├── docs/            ← Server documentation
│   └── app/
└── docker-compose.yml             ← Generated at root (can stay or move to server)
```
---

## 🐳 Docker Deployment (Local)

Docker packages your application and its dependencies into containers, making it easy to run the same way on any computer.

### Step 1: Install Docker

**For macOS:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install the `.dmg` file
3. Open Docker Desktop from Applications
4. Wait for Docker to start (whale icon in menu bar should be steady)

**For Windows:**
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install and follow the setup wizard
3. Restart your computer if prompted
4. Open Docker Desktop

**Verify installation:**
```bash
docker --version
docker-compose --version
```

### Step 2: Prepare Your Project

Make sure you've generated the required data files:
```bash
conda activate all-ml && python server/app/model/generate_validation_predictions.py
```
# Run sample grad-cam script with:
```bash
conda activate all-ml && python server/app/model/generate_sample_gradcam.py
```

### Step 3: Build and Start Docker Containers

From the project root directory (`/ai4all-project`):

```bash
# Build and start both services (backend + frontend)
docker-compose up --build
```

**What this does:**
- `--build` builds the Docker images (first time or after changes)
- Creates two containers: one for backend (FastAPI) and one for frontend (React)
- Starts both services and connects them

**First time will take 5-10 minutes** (downloading base images, installing dependencies)

### Step 4: Access Your Application

Once you see both containers running:
- **Frontend (React app):** http://localhost
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs


---

### Common Commands

```bash
# Start containers (in background)
docker-compose up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs
docker-compose logs backend    # Just backend logs
docker-compose logs frontend   # Just frontend logs

# Stop containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build
```

### Troubleshooting

**Port already in use:**
- If port 80 or 8000 is already in use, stop the conflicting service or change ports in `docker-compose.yml`

**Container won't start:**
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs frontend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**"Cannot connect to Docker daemon":**
- Make sure Docker Desktop is running
- Check the whale icon in your menu bar (macOS) or system tray (Windows)

**Frontend can't reach backend:**
- Make sure both containers are running: `docker-compose ps`
- Check nginx is proxying correctly: `docker-compose logs frontend`


---

## 📌 Team Workflow (Quick Start)
1. **Create a branch** off `main`.
2. **Commit small, often** with clear messages.
3. **Push** your branch to the remote.
4. **Open a Pull Request (PR)** and ask for review.
5. **Address feedback**, keep PRs small.
6. **Merge** with **Commit & Merge** into `main`.
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

```bash
# create & switch to a new branch
git switch -c feat/add-model
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
git push
```
**5) Open a PR**
- Title: clear & concise
- Description: what/why/how
- Link any related issues

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
- Use **Commit & Merge** to keep `main` tidy
- Delete the branch after merge
