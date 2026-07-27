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
- [x] Implement "Give me a game like..." feature (Beta)
  - [x] Create game search input component
  - [x] Implement game lookup via API
  - [ ] Display game's themes and genres for selection
  - [ ] Add multi-select interface (limit to 4 selections)
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

## Milestone 5: Authentication & User Features
- [x] Implement authentication
  - [x] Set up NextAuth (credentials + JWT; not Neon Auth/Clerk)
  - [x] Create sign-up/login flows
  - [x] Implement anonymous browsing
  - [ ] Add admin UI/endpoint to view Twitch token status and config
  - [ ] Add logging/alerts for Twitch token failures
- [x] Add user-specific features
  - [x] Create bookmarking functionality
  - [x] Encourage signins via favorites
  - [ ] Implement user preferences storage
  - [x] Add user profile page (basic)

## Milestone 6: Polish & Launch Preparation
- [ ] Enhance UI with animations
  - [ ] Add page transitions
  - [x] Implement micro-interactions
  - [ ] Optimize animation performance
- [x] Perform testing
  - [x] Unit/API Vitest suite with coverage gates in CI
  - [ ] Cross-browser testing
  - [ ] Mobile responsiveness testing
  - [ ] Performance optimization
  - [ ] Accessibility audit
- [ ] Prepare for deployment
  - [ ] Set up production environment
  - [ ] Configure domain (bzgamers.com or similar)
  - [ ] Create deployment documentation
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
  - [ ] Cache warming strategies
  - [ ] Admin dashboard for cache management

## Notes
- Remember to maintain the sleek, colorful, uplifting design throughout
- Focus on responsive design from the beginning
- Prioritize user experience and performance
- Database caching system is now fully functional and reduces API calls significantly
- Consider implementing local image caching for better performance and reliability
