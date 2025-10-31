# Docker notes (FastAPI)

This project is developed locally with **conda** first, and only containerized when we’re ready to demo/deploy.

## 1. Prereqs

- Docker installed (Docker Desktop is fine)
- App code lives in `server/`
- `server/requirements.txt` exists and has at least:

Add ML deps here later (e.g. torch, torchvision, pillow).
  ```text
  fastapi
  uvicorn[standard]
  python-multipart
  ```

## 2. Dockerfile

FROM python:3.11-slim

#### where the app will live in the container
WORKDIR /app

#### install deps first (better layer caching)
```
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
```

#### copy the rest of the app
COPY . .

#### run the app
```
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Notes:
we are not using conda inside Docker
we bind on 0.0.0.0 so the container can be reached from outside

## 3. Build the image
```
cd server
docker build -t blood-ml-api .
```

Notes:
-t blood-ml-api names the image

## 4. Run the container
```
docker run -p 8000:8000 blood-ml-api
```

left 8000 = your local machine port
right 8000 = container port (from uvicorn ... --port 8000)
Open in browser: 👉 http://127.0.0.1:8000/docs
You should see FastAPI’s Swagger docs.

## 5. Connecting Next.js to the container
In your Next.js app (the /client folder), set an env:
```
FASTAPI_URL=http://127.0.0.1:8000/predict

```
Then your Next route (e.g. src/app/api/predict/route.ts) just fetches process.env.FASTAPI_URL.
When you deploy Next (Vercel, etc.), change that env to your hosted API URL.

## 6. Adding ML later
When you start adding model files / weights:
1. Put them in server/models/ or server/artifacts/
2. Update the Dockerfile to copy them:
```
COPY models ./models

```
3. Rebuild:
```
docker build -t blood-ml-api .

```

## 7. Common problems
“Module not found” inside Docker → you installed it locally in conda but forgot to add it to requirements.txt. Add it, rebuild.
“Can’t reach 127.0.0.1” from Next inside Docker → use the container’s URL or expose the port (the -p 8000:8000 part).
Image too big → switch base image to something like python:3.11-bookworm-slim (already did) or put big model files on cloud storage and download at startup.