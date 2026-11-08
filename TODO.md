# BZGamers Project TODO

This document outlines the steps needed to complete the BZGamers MVP, organized into milestones with checkable tasks.

## Milestone 1: Project Setup & API Selection ✅
- [x] Research and select game info API (RAWG or IGDB)
  - [x] Compare API features, limitations, and pricing
  - [x] Verify licensing terms
  - [x] Create test account and API key
  - [x] Test API endpoints for required data
- [x] Set up GitHub repository
  - [x] Initialize Next.js project
  - [x] Configure Tailwind CSS
  - [x] Set up project structure (pages, components, styles)
  - [x] Create initial README.md
  - [x] Set up CI/CD pipeline (optional)
- [x] Configure development environment
  - [x] Install necessary dependencies (Next.js, Tailwind, Framer Motion)
  - [x] Set up ESLint and Prettier
  - [x] Create environment variables template

## Milestone 2: Core UI Development ✅
- [x] Design and implement welcome screen
  - [x] Create friendly greeting message
  - [x] Design and implement the two main option buttons
  - [x] Add responsive layout for mobile/desktop
- [x] Implement theme switching (dark/bright mode)
  - [x] Set up Tailwind theme configuration
  - [x] Create theme toggle component
  - [x] Implement theme persistence
- [x] Create basic layout components
  - [x] Header/navigation component
  - [x] Footer component
  - [x] Layout wrapper

## Milestone 3: Mood-Based Game Finder ✅
- [x] Design mood selection interface
  - [x] Create mood selection component
  - [x] Implement time availability selector
  - [x] Add genre preference options
- [x] Enhance mood and genre selection interface
  - [x] Expand mood selection with "See All" option for esoteric tastes
  - [x] Expand genre selection with "Advanced" toggle for more options
  - [x] Keep basic/common moods and genres immediately visible
  - [x] Implement collapsible advanced sections
- [x] Implement API integration
  - [x] Create API service for game data
  - [x] Implement caching strategy
  - [x] Add error handling
- [x] Develop game results display
  - [x] Design and implement game cards
  - [x] Create loading states
  - [x] Add animations with Framer Motion
  - [x] Implement filtering and sorting options
- [x] Add advanced filtering options to results
  - [x] Implement date range filters (release year/decade)
  - [x] Add platform filters (PC, PlayStation, Xbox, Nintendo, etc.)
  - [x] Create filter UI components with clear/apply functionality
  - [x] Integrate filters with existing API calls
  - [x] Add filter state management and persistence
- [x] Implement "Give me a game like..." feature
  - [x] Create game search input component
  - [x] Implement game lookup via API
  - [x] Display game's themes and genres for selection (`SimilarFocusPicker`)
  - [x] Add multi-select interface (limit to 4 selections; `focus` param on `/api/similar-games`)
  - [x] Create API endpoint for finding similar games
  - [x] Implement results display with game recommendations
  - [x] Add loading states and error handling
  - [x] Integrate with existing caching system

## Milestone 4: Database & Caching System ✅
- [x] Set up Neon.tech PostgreSQL database
  - [x] Design database schema with Prisma
  - [x] Set up connection and migrations
  - [x] Create comprehensive data models (games, genres, platforms, themes, images, search cache)
- [x] Implement database caching system
  - [x] Create database cache service (`db-cache.js`)
  - [x] Implement enhanced API service with DB caching (`api-enhanced.js`)
  - [x] Add TTL management and cache cleanup
  - [x] Test database caching functionality
- [x] Optimize API usage
  - [x] Reduce API calls through intelligent caching
  - [x] Implement search result caching
  - [x] Cache authentication tokens
  - [x] Add cache statistics and monitoring

## Milestone 5: Authentication & User Features ✅
- [x] Implement authentication
  - [x] Set up NextAuth (credentials + JWT; not Neon Auth/Clerk)
  - [x] Create sign-up/login flows
  - [x] Implement anonymous browsing
  - [x] Add admin UI/endpoint to view Twitch token status and config (Admin → System tab)
  - [x] Add logging/alerts for Twitch token failures (`[TWITCH_AUTH_FAILURE]` log line; optional hourly email via `ADMIN_ALERT_EMAIL`)
- [x] Add user-specific features
  - [x] Create bookmarking functionality
  - [x] Encourage signins via favorites
  - [x] Implement user preferences storage (`UserPreference` table, `/api/preferences`, profile panel; preferred platforms default the games platform filter)
  - [x] Add user profile page (basic)

## Milestone 6: Polish & Launch Preparation
- [ ] Enhance UI with animations
  - [x] Add page transitions (`src/app/template.js` CSS fade/slide)
  - [x] Implement micro-interactions
  - [x] Optimize animation performance (transform/opacity only; `prefers-reduced-motion` honored)
- [x] Perform testing
  - [x] Unit/API Vitest suite with coverage gates in CI
  - [ ] Cross-browser testing
  - [ ] Mobile responsiveness testing
  - [ ] Performance optimization
  - [ ] Accessibility audit
    - Done so far: skip link, `main` landmark, global `:focus-visible` ring, mobile menu `aria-expanded`/`aria-controls`, reduced-motion CSS. Still needs a manual screen-reader/axe pass and colour-contrast check
- [ ] Prepare for deployment
  - [ ] Set up production environment
  - [ ] Configure domain (bzgamers.com or similar)
  - [x] Create deployment documentation (`docs/deployment.md`)
    - Note for the docs: `npm start` (`scripts/start.js`) runs `prisma migrate deploy` before `next start`, so migrations apply on boot. Hosts that don't use `npm start` (e.g. serverless) must run `npx prisma migrate deploy` themselves, since the build only runs `prisma generate`. Set `NEXTAUTH_URL` (required in production) and optionally `ADMIN_ALERT_EMAIL`
  - [x] Implement analytics (optional)

## Milestone 7: Gaming Psychology & Mindfulness Features
- [ ] Create "Mindful Gaming" content section
  - [ ] Design psychology-focused content layout
  - [ ] Implement content management system for articles
  - [ ] Add guest writer submission tools
  - [ ] Create content categories (dark patterns, backlog psychology, etc.)
- [ ] Develop psychological gaming insights
  - [ ] Dark pattern recognition in gaming
  - [ ] Backlog reframing and management strategies
  - [ ] Psychology of gaming addiction and healthy habits
  - [ ] Consumer behavior analysis (buying games to never play)
  - [ ] Mindfulness techniques for gamers
- [ ] Build content management tools
  - [ ] Guest writer registration and submission system
  - [ ] Content moderation and approval workflow
  - [ ] Rich text editor for article creation
  - [ ] Image and media upload capabilities
  - [ ] Content scheduling and publishing tools
- [ ] Implement user engagement features
  - [ ] Article bookmarking and sharing
  - [ ] Comment system for discussions
  - [ ] User progress tracking for mindfulness practices
  - [ ] Community support features

## Future Features (Post-MVP)
- [ ] Gamer profile creation
- [ ] Matchmaking for mood/taste/availability
- [ ] Real-time chat or scheduling system
- [ ] Integration with Discord or Steam
- [ ] Advanced caching features
  - [ ] Local image caching/downloading
  - [ ] Background data synchronization
  - [x] Cache warming strategies (admin "Warm cache" action pre-loads genres/platforms/themes)
  - [x] Admin dashboard for cache management (Admin → System → Database cache: stats, cleanup, clear, warm)

## Security Follow-ups
- [x] Delete dead `src/pages-backup/` (stale copies of diagnostic API routes)
- [x] Signup user enumeration: stop returning "Email already registered" (409)
- [x] Add Turnstile captcha to `/api/waitlist` (server `src/lib/turnstile.js` + `TurnstileWidget` on the homepage form)
- [x] `/api/auth/reset-password` left rate-limited only: it requires an unguessable one-time token, and the request step (`forgot-password`) already has Turnstile
- [x] Strengthen password policy: min 8 chars, common-password blocklist, no email in password (signup, reset, UI)
- [x] Optional: online breach check (HaveIBeenPwned k-anonymity, fail-open, `src/lib/pwned-password.js`) at signup/reset
- [ ] Email verification before sign-in (`emailVerified` exists in schema, unused)
- [x] Add HSTS header
- [ ] Tighten CSP: replace `unsafe-inline`/`unsafe-eval` with nonces (needs per-request nonce via proxy and dynamic rendering)
- [x] Re-check admin role against the database in `/api/admin/*` (JWT role is trusted until expiry)
- [x] Back the rate limiter with a shared store: optional Upstash Redis (`UPSTASH_REDIS_REST_URL`/`_TOKEN`), falls back to per-instance memory
- [x] Replace `dangerouslySetInnerHTML` in `src/app/games/page.js` (personalized summary) with JSX
- [x] Escape `name`/`email` in HTML email templates; sanitize admin custom email HTML
- [x] Share one `PrismaClient` singleton instead of one per route file
- [x] Fail hard (don't fall back to localhost/`VERCEL_URL`) when `NEXTAUTH_URL` is unset in production (password-reset links)
- [x] Review `trustHost: true` in `src/lib/auth-config.js` (kept intentionally; rationale in `docs/deployment.md`)
- [x] CSRF origin check on state-changing `/api/*` requests (`src/lib/csrf.js`, enforced in `src/proxy.js`)
- [x] CI: raise `npm audit` threshold from critical to high
- [x] Replace placeholder secrets in `.env.example` (e.g. `AUTH_SECRET="bruh"`) with obvious "change-me" values

## Notes
- Remember to maintain the sleek, colorful, uplifting design throughout
- Focus on responsive design from the beginning
- Prioritize user experience and performance
- Database caching system is now fully functional and reduces API calls significantly
- Consider implementing local image caching for better performance and reliability
