# BZGamers

BZGamers is a web application that helps gamers find games that match their current mood and preferences. The platform aims to create a friendly, non-toxic gaming community where casual and relaxed gamers can discover games and eventually connect with like-minded players.

## Features

- **Mood-Based Game Finder**: Find games that match your current mood, time availability, and genre preferences
- **User-Friendly Interface**: Sleek, colorful design with dark and light mode support
- **Responsive Design**: Works seamlessly on both mobile and desktop devices
- **Modern Animations**: Smooth transitions and animations for a polished user experience

## Tech Stack

- **Frontend**: Next.js with Tailwind CSS and Framer Motion
- **Backend**: PostgreSQL on Neon.tech (planned)
- **Game Data**: Integration with RAWG or IGDB API (in progress)

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/bzgamers.git
   cd bzgamers
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Project Structure

```
bzgamers/
├── docs/               # Documentation files
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries and API clients
│   ├── pages/          # Next.js pages
│   ├── styles/         # Global styles and Tailwind configuration
│   └── utils/          # Helper functions
├── .eslintrc.js        # ESLint configuration
├── .gitignore          # Git ignore file
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── README.md           # Project documentation
└── tailwind.config.js  # Tailwind CSS configuration
```

## Future Features

- User authentication and profiles
- Matchmaking for mood/taste/availability
- Real-time chat or scheduling system
- Integration with Discord or Steam

## License

This project is licensed under the MIT License - see the LICENSE file for details.
