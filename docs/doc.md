# BZGamers MVP Spec

## Problem

Gamers—especially casual or 'relaxed' gamers—often feel frustrated due to:

* Toxic or uncooperative teammates
* Difficulty finding like-minded players
* Inability to discover games that match their current mood, time constraints, or preferences
* High hardware costs and dissatisfaction with mobile/PC gaming quality

## Goal

Build a web app MVP that:

* Greets the user in a friendly way
* Allows them to:

  * Look for games that match their current mood or taste
  * Eventually, connect with like-minded gamers (future feature)
* Uses cheerful, sleek UI with dark and bright mode
* Animations and transitions should feel modern, polished

## Features

### 1. Welcome Screen

* Message: "Hello! Welcome to BZGamers — where the bz go to chill and play."
* Two options:

  * "Find a Game That Fits My Mood"
  * "(Coming Soon) Find Someone to Game With"

### 2. Mood-Based Game Finder

* Allow users to select their current mood, time availability, and genre preference
* Pull matching games from a public API (IGDB, RAWG, etc.)
* Display results in cards with animations

### 3. Auth & Sessions

* Anonymous usage allowed for browsing games
* Sign-up (via Neon Auth or Clerk alt) required to bookmark games or connect with others

### 4. Tech Stack

* **Frontend**: Next.js (preferred for maturity, serverless features)

  * Tailwind CSS for styling (theme-aware: bright/dark)
  * Framer Motion for animations
  * ShadCN UI (optional)
* **Backend**: PostgreSQL on Neon.tech
* **Game Data**: RAWG or IGDB API (determine licensing terms)

### 5. Stretch Features (Future)

* Gamer profile creation
* Matchmaking for mood/taste/availability
* Real-time chat or scheduling system
* Integration with Discord or Steam

## Design Goals

* Sleek, colorful, uplifting design (but not cartoony)
* Easy on the eyes, fast to navigate
* Responsive mobile/desktop UI

## Tasks

* [ ] Choose a game info API and validate it
* [ ] Set up project on GitHub with basic structure
* [ ] Create landing page and welcome screen
* [ ] Implement mood-based game selector flow
* [ ] Integrate game API
* [ ] Set up auth (anonymous + optional account)
* [ ] Style with Tailwind (dark/light theme)
* [ ] Add animations with Framer Motion

## Notes

* Domain name should reflect casual chill gaming vibe (maybe: bzgamers.com or similar)
* MVP launch may skip user-to-user connections due to initial low user base

## Inspiration

* Astro Skeleton Themes
* Cozy web designs (e.g., Raindrop.io, Notion onboarding)

---

Once this is live and stable, start building up the gamer connection feature.
