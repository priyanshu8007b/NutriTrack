# NutriTrack 🥗

> A modern nutrition tracker built for Indian food — log daily meals, track macros, and hit your goals.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

![NutriTrack Banner](./docs/hero-banner.png)

NutriTrack helps you log Indian meals with accurate serving sizes and macros. It includes a curated database of 1000+ Indian dishes, a daily dashboard, BMR/TDEE-based goal planner, and Firebase-backed meal history — all in a clean, responsive UI.

**Live Demo:** Add your deployment URL here  
**Original Design Spec:** [`docs/blueprint.md`](./docs/blueprint.md)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Firestore Rules](#firestore-rules)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Dashboard** — Track today's calories, protein, carbs, and fats vs your targets. See weekly intake trend (Recharts) and recent meals.
- **Log Meals** — Search 1000+ Indian foods, filter by category (Breakfast / Lunch / Snacks / Dinner) and diet (Veg Only), pick quantities (0.5x steps), and log multiple items at once.
- **Goals & Calculator** — BMR/TDEE calculator (Mifflin-St Jeor) using gender, age, weight, height, activity level, and goal (Fat Loss / Maintenance / Muscle Gain). Adjust macro distribution with sliders and live energy breakdown.
- **Food Database** — Browse 1000 items (50 hand-curated + 950 region-varied) with calories, macros, serving size, category, and veg/non-veg indicators. Filter, search, and paginate.
- **Veg Only Mode** — One-tap toggle synced to Firestore (`userProfiles/{uid}.isVegOnly`) that filters suggestions and logging.
- **Nutrition Tips** — Bite-size, India-specific guidance.
- **Auth** — Firebase Authentication with email and anonymous guest sessions. All data scoped to the authenticated user.
- **Responsive & Accessible** — Tailwind CSS + shadcn/ui + Radix UI, Inter font, light/dark tokens.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack), React 19, TypeScript 5
- **Styling:** Tailwind CSS 3.4, tailwindcss-animate, shadcn/ui, Radix UI, lucide-react
- **Charts & Forms:** Recharts, react-hook-form, zod
- **Backend:** Firebase 11 (Authentication, Cloud Firestore, App Hosting)
- **Config:** `next.config.ts` allows `placehold.co`, `images.unsplash.com`, `picsum.photos`

## Screenshots

| Page | Description |
|------|-------------|
| `/` Dashboard | Macro cards, weekly bar chart, recent meals, quick tips |
| `/log` | Search + category filters on the left, plate builder on the right |
| `/goals` | Calculator inputs → calorie result → macro sliders |
| `/database` | Table view with search, category dropdown, and diet filter |
| `/tips` | Curated nutrition tips |
| `/login` | Sign-in / guest entry |

> Tip: Run the app locally and add your screenshots to `docs/` — e.g. `docs/screenshot-dashboard.png`.

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm, yarn, or pnpm
- A Firebase project (free tier is enough)

### 1. Clone and install

```bash
git clone https://github.com/priyanshu8007b/NutriTrack.git
cd NutriTrack
npm install
```

### 2. Set up Firebase

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** → Sign-in method → enable **Email/Password** and **Anonymous**
3. Enable **Firestore Database** → Create database (start in test mode)
4. Go to Project Settings → General → Your apps → Web app → copy the config values

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

All keys are `NEXT_PUBLIC_*` because the Firebase client SDK runs in the browser (`src/firebase/`).

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:9002 — the dev server runs on port **9002** by design (`next dev --turbopack -p 9002`).

### 5. Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | Analytics ID |

## Project Structure

```
.
├── docs/
│   ├── backend.json        # Firestore data model spec
│   ├── blueprint.md        # Original PaushtikPath spec
│   └── hero-banner.png     # Banner used in this README
├── src/
│   ├── ai/                 # Genkit stub (smart-indian-meal-suggestion)
│   ├── app/
│   │   ├── page.tsx        # Dashboard
│   │   ├── log/page.tsx    # Log meal
│   │   ├── goals/page.tsx  # Goals + calculator
│   │   ├── database/page.tsx
│   │   ├── tips/page.tsx
│   │   ├── login/page.tsx
│   │   ├── layout.tsx      # Sidebar + Firebase providers
│   │   └── globals.css     # Design tokens
│   ├── components/
│   │   ├── app-sidebar.tsx
│   │   └── ui/             # shadcn/ui components
│   ├── firebase/           # hooks: useUser, useFirestore, useCollection, useDoc
│   ├── lib/
│   │   ├── mock-data.ts    # 1000 foods + FOOD_BY_ID map + DEFAULT_GOALS
│   │   └── utils.ts
│   └── hooks/
├── firestore.rules         # Security rules (owner-based + admin)
├── apphosting.yaml         # Firebase App Hosting config
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## Data Model

Defined in `docs/backend.json` and implemented in `src/lib/mock-data.ts`:

**FoodItem**
```ts
{
  id: number
  name: string              // e.g. "Chicken Biryani"
  calories: number          // per serving
  protein: number           // g
  carbs: number             // g
  fats: number              // g
  category: string          // Breakfast, Main Course, Snack, etc.
  isVeg: boolean
  servingSize: string       // e.g. "350g"
}
```

The file exports `INDIAN_FOOD_DATABASE` (1000 items) and `FOOD_BY_ID` (`Map<string, FoodItem>`) for O(1) lookups.

**Firestore collections**

- `userProfiles/{uid}` — `{ id, email, isVegOnly, createdAt }`
- `userProfiles/{uid}/mealLogs/{id}` — `{ userId, foodId, quantity, loggedAt }`
- `userProfiles/{uid}/userGoal/userGoal` — `{ targetCalories, targetProteinRatio, targetCarbsRatio, targetFatsRatio }`
- `foodItems/{id}` — global catalog (public read, admin write)
- `roles_admin/{uid}` — admin flag

## Firestore Rules

See `firestore.rules`. Core idea: users can only read/write their own `userProfiles/{uid}` subtree. `foodItems` is publicly readable but only writable by admins.

```js
match /userProfiles/{userId} {
  allow get, list, create, update, delete: if request.auth.uid == userId;
  match /mealLogs/{mealLogId} {
    allow get, list, create, update, delete: if request.auth.uid == userId;
  }
  match /userGoal/{goalId} {
    allow get, list, create, update, delete: if request.auth.uid == userId;
  }
}
match /foodItems/{foodItemId} {
  allow get, list: if true;
  allow create, update, delete: if exists(/databases/$(database)/documents/roles_admin/$(request.auth.uid));
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack on http://localhost:9002 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Next.js ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

## Deployment

This repo is ready for **Firebase App Hosting** (`apphosting.yaml` with `maxInstances: 1`).

```bash
npm i -g firebase-tools
firebase login
firebase deploy
```

Next.js image domains are already allowed in `next.config.ts`.

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes and run `npm run typecheck && npm run build`
4. Commit, push, and open a pull request

Adding a new dish? Edit `BASE_DATABASE` in `src/lib/mock-data.ts` and include name, macros, category, and serving size.

## License

MIT — see [LICENSE](LICENSE) if present. If no license file exists, the project is intended to be MIT.

---

Built with Next.js, Firebase, and Tailwind CSS. Design tokens: Mustard `#C68C09`, Terracotta `#F2651A`, Off-White `#F9F3E7`, font Inter.
