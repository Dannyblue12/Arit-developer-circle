# Savi — spend like you *sabi* 📍

**AI-powered financial companion for Nigerians.** Savi sorts your spending
automatically, measures it against proven benchmarks to give you specific
optimisation suggestions, surfaces real community-verified local prices, turns
savings into goals you chase, and guards every payment against fraud.

Built for the **OPay National Innovation Challenge 2026**.

---

## Monorepo layout

```
savi/
├── backend/     Node.js + Express + MongoDB REST API
└── mobile/      React Native (Expo) app
```

## Core features

| Feature | What it does | Where |
|---|---|---|
| **Auto-sorting** | Categorises transactions from merchant name → pattern → one-tap user memory. No manual logging, ever. | `backend/src/services/categorise.js` |
| **AI optimisation engine** | Benchmarks each category against the user's income bracket and produces evidence-backed suggestions ("You: ₦45,700 · bracket: ₦32,500 · 40% over → meal-prep saves ₦14,000"). | `backend/src/services/suggest.js` |
| **Community prices** | Neighbours share real prices; ranked cheapest-first, confirmations build trust, stale finds fade. Sharers earn ₦50/find. | `backend/src/routes/prices.js` |
| **Savings goals** | Every saving Savi finds attaches to a goal — progress you can feel, lockable into an OPay pocket. | `backend/src/routes/goals.js` |
| **Savi Watch** | Rule-based fraud & waste guardian: flagged new payees, silent recurring debits, duplicate charges, overspend pace. *Only warns — never touches money.* | `backend/src/services/watch.js` |

## Quick start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # edit if needed
npm run seed                # creates demo user + a month of data
npm run dev                 # API on http://localhost:4000
```

Demo login: phone `08010000000` · password `savi1234`

Smoke-test:
```bash
curl http://localhost:4000/api/health
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"08010000000","password":"savi1234"}'
```

### 2. Mobile

```bash
cd mobile
npm install
npm start                   # Expo dev server; press a for Android
```

**Point the app at your API:** automatic. The app derives the API host from
the Expo dev server it loaded from — scan the QR with Expo Go on a phone on
the **same wifi** as your machine and it reaches `http://<your-LAN-IP>:4000`
by itself (Android emulator falls back to `http://10.0.2.2:4000`). To point
somewhere else, set `EXPO_PUBLIC_API_URL`, e.g.:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.50:4000 npm start
```

**Sign-in:** the app signs itself into the seeded demo account on launch
(and registers it first if the backend is fresh), so live data flows with
zero setup.

**Offline-safe demo:** if the API is unreachable, the app automatically falls
back to bundled demo data (identical to the seeded backend) and shows a small
"demo data" badge — the pitch never dies with the wifi.

## API surface

```
POST /api/auth/register            POST /api/auth/login
POST /api/auth/link-opay           GET  /api/auth/me

GET  /api/spending/summary         GET  /api/spending/suggestions
GET  /api/spending/tidy            POST /api/spending/tidy/:txId
POST /api/spending/transactions    (ingest + auto-categorise + Watch review)

GET  /api/goals                    POST /api/goals
POST /api/goals/:id/contribute

GET  /api/prices                   GET  /api/prices/fresh
POST /api/prices                   POST /api/prices/:id/confirm

GET  /api/watch                    POST /api/watch/:id/resolve
```

## How the AI works (honest version)

1. **Categorisation** needs no ML for v1: merchant-name matching covers most
   wallet transactions; repeated amount+payee patterns catch rent/suppliers;
   the user is asked **once** about a plain transfer to a new person and Savi
   remembers that counterparty forever.
2. **Suggestions** come from a benchmark engine: the user's per-category spend
   is compared against income-bracket medians, and a playbook of local,
   concrete optimisations fires only when the numbers justify it — so every
   tip ships with its evidence. Benchmarks are seeded for the prototype; in
   production they're aggregated nightly from anonymised cohort data.
3. **Savi Watch** is transparent rules (flagged payees, silent debits,
   duplicates, pace) — auditable, explainable, and honest about being v1.
   An LLM layer (`LLM_API_KEY`) can refine phrasing later; numbers always
   come from the engine.

## Roadmap (post-challenge)

- Real OPay OAuth + live transaction webhook (replaces the seed stub)
- Community fraud-signal network feeding Savi Watch
- Voice interface in Pidgin/Yoruba/Hausa/Igbo for low-literacy users
- Auto-fix recurring bills (data bundles first)

## Push to GitHub

```bash
cd savi
git init
git add .
git commit -m "Savi v1 — API + React Native app"
git branch -M main
git remote add origin https://github.com/<your-username>/savi.git
git push -u origin main
```

## Team

Built by Team Savi for the OPay National Innovation Challenge 2026.

*All demo figures are illustrative.*
