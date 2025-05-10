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
- [ ] Design and implement welcome screen
  - [ ] Create friendly greeting message
  - [ ] Design and implement the two main option buttons
  - [ ] Add responsive layout for mobile/desktop
- [ ] Implement theme switching (dark/bright mode)
  - [ ] Set up Tailwind theme configuration
  - [ ] Create theme toggle component
  - [ ] Implement theme persistence
- [ ] Create basic layout components
  - [ ] Header/navigation component
  - [ ] Footer component
  - [ ] Layout wrapper

## Milestone 3: Mood-Based Game Finder
- [ ] Design mood selection interface
  - [ ] Create mood selection component
  - [ ] Implement time availability selector
  - [ ] Add genre preference options
- [ ] Implement API integration
  - [ ] Create API service for game data
  - [ ] Implement caching strategy
  - [ ] Add error handling
- [ ] Develop game results display
  - [ ] Design and implement game cards
  - [ ] Create loading states
  - [ ] Add animations with Framer Motion
  - [ ] Implement filtering and sorting options

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
