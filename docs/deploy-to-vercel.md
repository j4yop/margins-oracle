# Deploy to Vercel — $0, 5 minutes

Two Vercel projects, two URLs. Both free.

**Current live deployments (team `main-ec61`, account `jay20gopal-5543`):**

| URL | Project | Purpose |
|---|---|---|
| `https://web-eight-theta-usai6pzu0g.vercel.app` | `main-ec61/web` | The iPhone demo — camera, haggle, oracle, ledger, all APIs |
| `https://landing-gold-omega.vercel.app` | `main-ec61/landing` | Public marketing page — judges click this first |

> ⚠️ Team `main-ec61` has Vercel Deployment Protection enabled. The per-deployment URLs (`*-main-ec61.vercel.app`) redirect to a Vercel login. Only the **aliased** URLs above are publicly reachable. If a redeploy changes the alias, update the landing's `NEXT_PUBLIC_DEMO_URL` and rebuild.

## One-time setup

```bash
# 1. install Vercel CLI
npm i -g vercel

# 2. login
vercel login
```

## Deploy the demo (`web/`)

```bash
cd ~/code/margins/web
vercel

# Answer the prompts:
#   Set up and deploy? Y
#   Which scope? <your account>
#   Link to existing project? N
#   What's your project's name? margins-demo
#   In which directory is your code located? ./
#   Want to modify these settings? N
```

Then add environment variables:

```bash
# All the keys from web/.env.local — but for Vercel
vercel env add GEMINI_API_KEY production
# paste: <your-GEMINI_API_KEY>

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# paste: <your-NEXT_PUBLIC_FIREBASE_API_KEY>

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# paste: <your-FIREBASE_PROJECT_ID>.firebaseapp.com

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# paste: <your-FIREBASE_PROJECT_ID>

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
# paste: <your-FIREBASE_PROJECT_ID>.firebasestorage.app

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
# paste: 680317009214

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
# paste: 1:680317009214:web:9dcfa3a60f235bc3d1c06f
```

Then deploy to production:

```bash
vercel --prod
```

You get `https://margins-demo.vercel.app`.

## Deploy the landing (`landing/`)

```bash
cd ~/code/margins/landing
vercel

# Project name: margins-landing
# Answer prompts same as above
```

Then:

```bash
vercel env add NEXT_PUBLIC_DEMO_URL production
# paste: https://margins-demo.vercel.app
vercel env add NEXT_PUBLIC_MCP_URL production
# paste: https://margins-demo.vercel.app
```

Deploy:

```bash
vercel --prod
```

You get `https://margins-landing.vercel.app`.

## Test on iPhone 16 Pro

Open the demo URL in Safari on your iPhone:
- Doesn't need to be on the same Wi-Fi as your Mac
- Camera works (Safari prompts for permission)
- BarcodeDetector works on iOS 16.4+

## After first deploy

1. **Firestore rules**: Your `firestore.rules` says open access for hackathon. In production, scope down.
2. **Custom domain** (optional, $12/yr): Buy `margins.in` or `margins.dev` and point to Vercel.
3. **MCP discovery**: `https://margins-demo.vercel.app/.well-known/mcp.json` is publicly discoverable.

## One-command deploy from project root

If you've already done the one-time setup, this rebuilds both:

```bash
cd ~/code/margins
(cd web && vercel --prod --yes) && (cd landing && vercel --prod --yes)
```

## What if Vercel asks for a different framework?

The root-level `vercel.json` says framework `nextjs` and points outputDirectory at `web/.next`. If you deploy from `web/`, you don't need the root one — the app-level `vercel.json` (or absence of it) is enough.

If Vercel can't auto-detect, choose **"Other"** in the framework prompt and let `vercel.json` do the work.

## Troubleshooting

| Problem | Fix |
|---|---|
| `GEMINI_API_KEY not valid` | Make sure the env var is on production. `vercel env ls` to check. |
| Firestore `PERMISSION_DENIED` | The `firestore.rules` is for dev. Make sure the API is enabled in your project (you did this). |
| Camera not working on iPhone | Safari only. Chrome iOS uses WebKit under the hood but the BarcodeDetector API may not be exposed. |
| `MODULE_NOT_FOUND` on build | `cd web && rm -rf .next && npm install --silent` then re-deploy. |
| Demo runs slow first call | Free tier cold-start. 3-5s on first request, faster after. |
