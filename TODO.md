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
  - [ ] Set up CI/CD pipeline (optional)
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
- [ ] Enhance mood and genre selection interface
  - [ ] Expand mood selection with "See All" option for esoteric tastes
  - [ ] Expand genre selection with "Advanced" toggle for more options
  - [ ] Keep basic/common moods and genres immediately visible
  - [ ] Implement collapsible advanced sections
- [x] Implement API integration
  - [x] Create API service for game data
  - [x] Implement caching strategy
  - [x] Add error handling
- [x] Develop game results display
  - [x] Design and implement game cards
  - [x] Create loading states
  - [x] Add animations with Framer Motion
  - [x] Implement filtering and sorting options
- [ ] Add advanced filtering options to results
  - [ ] Implement date range filters (release year/decade)
  - [ ] Add platform filters (PC, PlayStation, Xbox, Nintendo, etc.)
  - [ ] Create filter UI components with clear/apply functionality
  - [ ] Integrate filters with existing API calls
  - [ ] Add filter state management and persistence
- [ ] Implement "Give me a game like..." feature (Beta)
  - [ ] Create game search input component
  - [ ] Implement game lookup via API
  - [ ] Display game's themes and genres for selection
  - [ ] Add multi-select interface (limit to 4 selections)
  - [ ] Create API endpoint for finding similar games
  - [ ] Implement results display with game recommendations
  - [ ] Add loading states and error handling
  - [ ] Integrate with existing caching system

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

## Milestone 5: Authentication & User Features
- [ ] Implement authentication
  - [ ] Set up Neon Auth or Clerk
  - [ ] Create sign-up/login flows
  - [ ] Implement anonymous browsing
  - [ ] Add admin UI/endpoint to view Twitch token status and config
  - [ ] Add logging/alerts for Twitch token failures
- [ ] Add user-specific features
  - [ ] Create bookmarking functionality
  - [ ] Implement user preferences storage
  - [ ] Add user profile page (basic)

## Milestone 6: Polish & Launch Preparation
- [ ] Enhance UI with animations
  - [ ] Add page transitions
  - [ ] Implement micro-interactions
  - [ ] Optimize animation performance
- [ ] Perform testing
  - [ ] Cross-browser testing
  - [ ] Mobile responsiveness testing
  - [ ] Performance optimization
  - [ ] Accessibility audit
- [ ] Prepare for deployment
  - [ ] Set up production environment
  - [ ] Configure domain (bzgamers.com or similar)
  - [ ] Create deployment documentation
  - [ ] Implement analytics (optional)

## Future Features (Post-MVP)
- [ ] Gamer profile creation
- [ ] Matchmaking for mood/taste/availability
- [ ] Real-time chat or scheduling system
- [ ] Integration with Discord or Steam
- [ ] Advanced caching features
  - [ ] Local image caching/downloading
  - [ ] Background data synchronization
  - [ ] Cache warming strategies
  - [ ] Admin dashboard for cache management

## Notes
- Remember to maintain the sleek, colorful, uplifting design throughout
- Focus on responsive design from the beginning
- Prioritize user experience and performance
- Database caching system is now fully functional and reduces API calls significantly
- Consider implementing local image caching for better performance and reliability
