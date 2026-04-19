# RateLimitRefugees — Stokvel Management Platform
A web-based platform for managing South African stokvel groups — contributions, payouts, meetings, and financial insights.

## Deployed App
https://stokvelplatform.netlify.app/


## Group Members
- Muhammed Abed
- Muhammad Akhalwaya
- Raees Mia Bala
- Huzaifa Majeed
- Irfaan Fulat
- Ahmed Majeed.

---

## Tech Stack
- **React + Vite** — user interface
- **Tailwind CSS** — styling
- **Supabase** — database and authentication

---

## Teammate Setup Guide

### What You Need to Install First
1. **Node.js** — https://nodejs.org (pick the LTS version)
2. **Git** — https://git-scm.com
3. **VS Code** — https://code.visualstudio.com

### Getting the Project
```bash
git clone https://github.com/ra2ez/RateLimitRefugees.git
cd RateLimitRefugees
cd stokvel-app
npm install
```

### Setting Up the Secret Keys
Create a file called `.env` inside the `stokvel-app` folder and paste this:
```
VITE_SUPABASE_URL=ask_huzaifa_for_this
VITE_SUPABASE_KEY=ask_huzaifa_for_this
```
Get the actual values from Huzaifa on WhatsApp.

### Running the App
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

If you see **"Stokvel App — Welcome! We are live."** you are good to go.

---

## Branch Structure
- `main` — stable, working code only
- `feature/setup` — initial project setup (React, Tailwind, Supabase)

---

## Trello Link
https://trello.com/b/D91GBp4E/stokvel-project-sprint-1
