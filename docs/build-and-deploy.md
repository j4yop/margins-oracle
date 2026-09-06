# Build & deploy — manual steps for the founder

Everything below assumes you have your `GEMINI_API_KEY` and Firebase config ready.

## First time

```bash
cd ~/code/margins

# 1. install
npm install

# 2. env
cp .env.example web/.env.local
# → edit web/.env.local: paste GEMINI_API_KEY + Firebase web config

# 3. dev server
cd web && npm run dev
# → open http://localhost:3000 in Safari on your iPhone 16 Pro
# → if iPhone and Mac on same wifi, use http://<mac-ip>:3000
```

## Deploy to free hosting (Firebase Spark)

```bash
# one-time: install firebase CLI
npm i -g firebase-tools
firebase login

# build web → static export → deploy hosting
cd web
npm run build
firebase deploy --only hosting

# → you get a free https://<project-id>.web.app URL
```

## Smoke test the API key

```bash
# quick CLI check that Pro + Flash + Embeddings all respond
cd web
npx tsx -e "import('./lib/gemini.ts').then(m => m.smokeTest().then(console.log))"
```

## Manual accounts checklist

- [ ] AI Studio key created — https://aistudio.google.com/
- [ ] Firebase project created — https://console.firebase.google.com/
- [ ] Firebase web app registered, config pasted into `web/.env.local`
- [ ] Firestore enabled (test mode, asia-south1)
- [ ] GitHub repo created — https://github.com/new
- [ ] GS1 India developer signup — https://www.gs1india.org/ (1-2 day approval)
- [ ] (optional) Bhashini API key — https://bhashini.ai/

## What's free vs paid

| Service | Free tier | Where it lives |
|---|---|---|
| Gemini 2.5 Pro | 5 RPM, 50 RPD | AI Studio |
| Gemini 2.5 Flash | 15 RPM, 1500 RPD | AI Studio |
| Gemini Live API | preview = free | AI Studio |
| Gemini Embeddings | 1500 RPD | AI Studio |
| Firebase Hosting | 10 GB | Spark plan |
| Firebase Firestore | 1 GB, 50k reads/day | Spark plan |
| Firebase Cloud Functions | 2M invocations/month | Spark plan |
| Firebase Auth | 50k MAUs | Spark plan |
| ONDC Beckn | open protocol, free | local |
| GS1 India dev sandbox | free for hackathon | gs1india.org |
| Agmarknet | public RSS | agmarknet.gov.in |
| Bhashini | free for hackathon | bhashini.ai |
| OpenCity | public datasets | data.opencity.in |

Total infra: **$0**.