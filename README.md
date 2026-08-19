Here is a crisp, ready-to-copy Markdown README for your **NutriTrack** project, generated based on your repository's structure and commit history.
# NutriTrack 🥗

> Nutrition tracker for Indian food — log daily meals and track calories and macros.

# NutriTrack 🍏
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

NutriTrack is a web application designed to help users log their daily meals and monitor their dietary preferences. Built with Next.js and Firebase, it offers a simple and intuitive interface for nutrition tracking.
![NutriTrack Banner](./docs/hero-banner.png)

## ✨ Features
NutriTrack is a web app for logging Indian meals and tracking daily nutrition. It uses a local database of 1000 Indian food items (50 manually defined + 950 generated), a dashboard for daily and weekly totals, a goal calculator, and Firebase for authentication and storage of meal logs.

*   **Meal Logging**: Easily record your daily food intake.
*   **Vegetarian Filter**: A dedicated "Veg Only" switch on the dashboard to filter meal suggestions or logged items, catering to vegetarian preferences.
*   **Firebase Integration**: Utilizes Firebase for backend services, including authentication and Firestore database for data persistence.
*   **Modern Frontend**: Built with the latest **Next.js** (App Router) and styled with **Tailwind CSS** for a responsive and clean user interface.
**Original Design Spec:** [`docs/blueprint.md`](./docs/blueprint.md)

## 🛠️ Tech Stack
---

*   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
*   **Language**: TypeScript
## Table of Contents

## 🚀 Getting Started
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

Follow these steps to get a local copy of the project up and running.
---

## Features

Available in the current codebase (`src/app/*`):

- **Dashboard (`/`)** — Shows today's totals for calories, protein, carbs, and fats versus targets stored in Firestore. Includes a 7-day bar chart (Recharts) and the 5 most recent meal logs. Has a Veg Only switch that updates `userProfiles/{uid}.isVegOnly`.
- **Log Meals (`/log`)** — Search across 1000 items, filter by category (All / Breakfast / Lunch / Snacks / Dinner) and by the Veg Only setting. Select a quantity in 0.5 steps via a dialog, add items to a plate, adjust quantity or remove, and save all items to `userProfiles/{uid}/mealLogs`.
- **Goals (`/goals`)** — Calculator that uses the Mifflin-St Jeor equation with inputs for gender, age, weight, height, activity level, and goal (Fat Loss -400 kcal / Maintenance / Muscle Gain +300 kcal). Result can be fine-tuned with a slider. Separate sliders for protein, carbs, and fats (0–400 g) with a stack bar showing the calorie breakdown. Saves to `userProfiles/{uid}/userGoal/userGoal`.
- **Food Database (`/database`)** — Table of 1000 items from `src/lib/mock-data.ts`. Columns: name, serving size, calories, protein, carbs, fats, category, veg/non-veg flag. Filter by text search, category dropdown, and diet (All / Veg / Non-Veg). Shows 30 items initially with a “Load 50 More” button.
- **Nutrition Tips (`/tips`)** — Displays 4 random tips picked from a list of 8 on each load, plus a static daily habit card.
- **Authentication (`/login`)** — Firebase Authentication with Google sign-in and anonymous guest sign-in (`initiateAnonymousSignIn` / `initiateGoogleSignIn`). If not signed in, the dashboard shows a prompt to sign in. All meal logs and goals are stored under the current user’s UID.
- **Suggestions (`/suggestions`)** — Currently returns “This feature has been removed.”

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack), React 19, TypeScript 5
- **Styling:** Tailwind CSS 3.4, tailwindcss-animate, shadcn/ui, Radix UI, lucide-react, Inter font
- **Charts & Forms:** Recharts 2.15, react-hook-form, zod
- **Backend:** Firebase 11 (Authentication, Cloud Firestore, App Hosting)
- **Config:** `next.config.ts` allows `placehold.co`, `images.unsplash.com`, `picsum.photos` and sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`

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

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   A Firebase project (for backend services)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/priyanshu8007b/NutriTrack.git
    ```
2.  **Navigate to the project directory**
    ```bash
    cd NutriTrack
    ```
3.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
4.  **Set up Firebase Configuration**
    *   Create a `.env.local` file in the root directory.
    *   Add your Firebase project configuration keys to the file. You'll need variables similar to:
        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
        ... other config vars
        ```
    *   Ensure your Firebase project has Firestore and Authentication enabled.

5.  **Run the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
6.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

*   `src/app/`: Contains the main application code using the Next.js App Router. The main entry point is `src/app/page.tsx`.
*   `firestore.rules`: Security rules for your Firestore database.
*   `public/`: Static assets.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/priyanshu8007b/NutriTrack/issues) if you have any questions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. *(Note: A license file was not present in the repository view; you may want to add one.)*
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

Defined in `docs/backend.json` and implemented in `src/lib/mock-data.ts` (local mock data, not a remote verified source):

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

- `INDIAN_FOOD_DATABASE` contains 1000 items: `BASE_DATABASE` (50 manually defined North/South/West/East dishes) + 950 programmatically generated items (region + ingredient + type). Exported with `FOOD_BY_ID` (`Map<string, FoodItem>`) for lookup by ID.
- `DEFAULT_GOALS` is `{ calories: 2000, protein: 100, carbs: 250, fats: 65 }` used when no user goal is saved.

**Firestore collections**

- `userProfiles/{uid}` — `{ id, email, isVegOnly, createdAt }`
- `userProfiles/{uid}/mealLogs/{id}` — `{ userId, foodId, quantity, loggedAt }`
- `userProfiles/{uid}/userGoal/userGoal` — `{ targetCalories, targetProteinRatio, targetCarbsRatio, targetFatsRatio, updatedAt }`
- `foodItems/{id}` — global catalog (public read, admin write) — currently not populated; app uses local `mock-data.ts`
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

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes and run `npm run typecheck && npm run build`
4. Commit, push, and open a pull request

To add a dish, edit `BASE_DATABASE` in `src/lib/mock-data.ts` and include name, calories, protein, carbs, fats, category, isVeg, and servingSize.

## License

No `LICENSE` file is currently in the repository. Add one if you need a specific license (e.g., MIT).

---

Design tokens in `src/app/globals.css`: `--primary` 42 88% 41% (#C68C09), `--accent` 21 89% 53% (#F2651A), `--background` 40 50% 94% (#F9F3E7), font Inter.
