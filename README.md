# 🎮 BZGamers

**Find the perfect game for your mood, not just your taste.**

BZGamers helps you discover games that match how you're feeling right now. Whether you're stressed and want something relaxing, excited and craving action, or just have 30 minutes to kill - we'll find you the perfect game.

## ✨ What Makes BZGamers Different?

### 🧠 **Mood-Based Discovery**
- Tell us how you're feeling (relaxed, excited, focused, social, creative, nostalgic)
- Share how much time you have (quick 15min session or all-day marathon)
- Pick your favorite genres
- Get personalized game recommendations instantly

### 🚀 **Lightning Fast**
- **Smart caching** means instant results (no waiting for API calls)
- **Persistent database** remembers your preferences and popular games
- **Optimized search** finds exactly what you need in seconds

### 🎨 **Beautiful & Intuitive**
- **Sleek, colorful design** that lifts your mood
- **Dark/light mode** for any lighting condition
- **Mobile-first** - works perfectly on your phone
- **Smooth animations** that feel premium

## 🎯 Perfect For...

- **Casual gamers** who want quick, fun recommendations
- **Busy people** with limited gaming time
- **Mood-driven players** who pick games based on how they feel
- **Discovery-focused gamers** tired of the same old recommendations
- **Non-toxic gaming community** - relaxed, friendly atmosphere

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - Fast, modern React framework
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Responsive Design** - Works on all devices

### Backend & Data
- **PostgreSQL** (Neon.tech) - Reliable, scalable database
- **Prisma ORM** - Type-safe database operations
- **IGDB API** - Comprehensive game database (50,000+ games)
- **Smart Caching** - Reduces API calls by 90%+

### Performance
- **Database caching** - Instant game lookups
- **Search optimization** - Fast mood-based filtering
- **Image optimization** - Quick loading game covers
- **Rate limiting** - Respectful API usage

## 🚀 Quick Start

### For Users
1. Visit [bzgamers.com](https://bzgamers.com) (coming soon!)
2. Choose your mood and time availability
3. Pick your favorite genres
4. Discover amazing games instantly!

### For Developers
```bash
# Clone and setup
git clone https://github.com/yourusername/bzgamers.git
cd bzgamers
npm install

# Set up environment variables
cp .env.example .env
# Add your IGDB API credentials

# Start development
npm run dev
```

## 📊 Current Status

### ✅ **Completed Features**
- **Mood-based game finder** with intelligent filtering
- **Database caching system** with 50,000+ games cached
- **Responsive UI** with dark/light mode
- **API integration** with IGDB (comprehensive game database)
- **Performance optimization** with smart caching

### 🔄 **In Development**
- User authentication and profiles
- Advanced filtering options
- Social features and matchmaking

### 🎯 **Coming Soon**
- Real-time chat for gamers
- Discord/Steam integration
- Advanced mood analytics
- Community features

## 🏗️ Project Structure

```
bzgamers/
├── src/
│   ├── components/     # Reusable UI components
│   ├── lib/           # API clients & database caching
│   │   ├── api-enhanced.js    # Enhanced API with caching
│   │   ├── db-cache.js        # Database caching service
│   │   └── prisma/            # Database schema & migrations
│   ├── pages/         # Next.js pages & API routes
│   └── styles/        # Global styles & Tailwind config
├── prisma/            # Database schema & migrations
└── docs/              # Documentation & compliance
```

## 🤝 Contributing

We welcome contributions! Whether you're a developer, designer, or just passionate about gaming:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep the user experience smooth and intuitive

## 📈 Performance Metrics

- **API Calls Reduced**: 90%+ through intelligent caching
- **Response Time**: <500ms for cached results
- **Database**: 50,000+ games cached with full metadata
- **Uptime**: 99.9%+ with Neon.tech PostgreSQL

## 🔒 Privacy & Compliance

- **No personal data collection** without consent
- **IGDB API compliance** - following all usage guidelines
- **Open source** - transparent and auditable
- **MIT License** - free to use and modify

## 🌟 Why BZGamers?

Traditional game recommendation engines focus on **what you like**, but BZGamers focuses on **how you feel**. 

- **Stressed?** → Relaxing puzzle games
- **Excited?** → High-energy action games  
- **Social?** → Multiplayer experiences
- **Creative?** → Sandbox and simulation games
- **Nostalgic?** → Classic and retro games

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/yourusername/bzgamers/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bzgamers/discussions)
- **Email**: hello@bzgamers.com
- **Buy Me a Coffee**: [https://buymeacoffee.com/tonyagua](https://buymeacoffee.com/tonyagua)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the gaming community**

*BZGamers - Because your mood matters more than your genre preferences.*

## Routing

This project uses the **Next.js App Router** (see `src/app/`). The legacy Pages Router code is preserved in `src/pages-backup/` for reference.

## Environment Variables

Environment variables are managed via a `.env` file. A template is provided in `.env.example`. Be sure to copy `.env.example` to `.env` and fill in your own values before running the project.

- `NEXT_PUBLIC_SITE_NAME`: The name of the site (used in UI and metadata)
- `NEXT_PUBLIC_GH_URL`: The GitHub repository URL (used in UI)

---
