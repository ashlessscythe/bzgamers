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

## Milestone 2: Core UI Development
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

## Milestone 3: Mood-Based Game Finder
- [x] Design mood selection interface
  - [x] Create mood selection component
  - [x] Implement time availability selector
  - [x] Add genre preference options
- [x] Implement API integration
  - [x] Create API service for game data
  - [x] Implement caching strategy
  - [x] Add error handling
- [x] Develop game results display
  - [x] Design and implement game cards
  - [x] Create loading states
  - [x] Add animations with Framer Motion
  - [x] Implement filtering and sorting options

## Milestone 4: Authentication & User Features
- [ ] Set up Neon.tech PostgreSQL database
  - [ ] Design database schema
  - [ ] Set up connection
  - [ ] Create migration scripts
- [ ] Implement authentication
  - [ ] Set up Neon Auth or Clerk
  - [ ] Create sign-up/login flows
  - [ ] Implement anonymous browsing
- [ ] Add user-specific features
  - [ ] Create bookmarking functionality
  - [ ] Implement user preferences storage
  - [ ] Add user profile page (basic)

## Milestone 5: Polish & Launch Preparation
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

## Notes
- Remember to maintain the sleek, colorful, uplifting design throughout
- Focus on responsive design from the beginning
- Prioritize user experience and performance
