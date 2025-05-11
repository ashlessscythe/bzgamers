/**
 * Mock data for the BZGamers application
 * 
 * This module provides mock data for the application when the API is not available
 * or when running in development mode without API credentials.
 */

// Mock genres
const MOCK_GENRES = [
  { id: 1, name: 'Action', slug: 'action' },
  { id: 2, name: 'Adventure', slug: 'adventure' },
  { id: 3, name: 'RPG', slug: 'role-playing-game-rpg' },
  { id: 4, name: 'Strategy', slug: 'strategy' },
  { id: 5, name: 'Shooter', slug: 'shooter' },
  { id: 6, name: 'Simulation', slug: 'simulation' },
  { id: 7, name: 'Sports', slug: 'sports' },
  { id: 8, name: 'Puzzle', slug: 'puzzle' },
  { id: 9, name: 'Indie', slug: 'indie' },
  { id: 10, name: 'Racing', slug: 'racing' },
  { id: 11, name: 'Fighting', slug: 'fighting' },
  { id: 12, name: 'Platform', slug: 'platform' }
];

// Mock games
const MOCK_GAMES = [
  {
    id: 1,
    name: 'The Legend of Adventure',
    cover: {
      id: 101,
      url: 'https://via.placeholder.com/264x374/3730a3/ffffff?text=Legend+of+Adventure'
    },
    first_release_date: 1609459200, // 2021-01-01
    total_rating: 92,
    summary: 'An epic adventure game where you explore vast landscapes, solve puzzles, and battle mythical creatures.',
    url: 'https://example.com/games/legend-adventure',
    genres: [
      { id: 2, name: 'Adventure' },
      { id: 3, name: 'RPG' }
    ]
  },
  {
    id: 2,
    name: 'Space Explorers',
    cover: {
      id: 102,
      url: 'https://via.placeholder.com/264x374/4f46e5/ffffff?text=Space+Explorers'
    },
    first_release_date: 1625097600, // 2021-07-01
    total_rating: 85,
    summary: 'Explore the vastness of space, discover new planets, and build your own space station in this immersive simulation game.',
    url: 'https://example.com/games/space-explorers',
    genres: [
      { id: 6, name: 'Simulation' },
      { id: 2, name: 'Adventure' }
    ]
  },
  {
    id: 3,
    name: 'Tactical Warfare',
    cover: {
      id: 103,
      url: 'https://via.placeholder.com/264x374/7c3aed/ffffff?text=Tactical+Warfare'
    },
    first_release_date: 1640995200, // 2022-01-01
    total_rating: 78,
    summary: 'Lead your troops to victory in this intense tactical strategy game. Plan your moves carefully and outsmart your opponents.',
    url: 'https://example.com/games/tactical-warfare',
    genres: [
      { id: 4, name: 'Strategy' },
      { id: 5, name: 'Shooter' }
    ]
  },
  {
    id: 4,
    name: 'Puzzle Masters',
    cover: {
      id: 104,
      url: 'https://via.placeholder.com/264x374/6d28d9/ffffff?text=Puzzle+Masters'
    },
    first_release_date: 1656633600, // 2022-07-01
    total_rating: 88,
    summary: 'Challenge your mind with increasingly difficult puzzles. Perfect for short gaming sessions and brain training.',
    url: 'https://example.com/games/puzzle-masters',
    genres: [
      { id: 8, name: 'Puzzle' }
    ]
  },
  {
    id: 5,
    name: 'Racing Champions',
    cover: {
      id: 105,
      url: 'https://via.placeholder.com/264x374/4338ca/ffffff?text=Racing+Champions'
    },
    first_release_date: 1672531200, // 2023-01-01
    total_rating: 82,
    summary: 'Feel the adrenaline as you race through various tracks around the world. Customize your cars and become a racing legend.',
    url: 'https://example.com/games/racing-champions',
    genres: [
      { id: 10, name: 'Racing' },
      { id: 7, name: 'Sports' }
    ]
  },
  {
    id: 6,
    name: 'Retro Platformer',
    cover: {
      id: 106,
      url: 'https://via.placeholder.com/264x374/8b5cf6/ffffff?text=Retro+Platformer'
    },
    first_release_date: 946684800, // 2000-01-01
    total_rating: 95,
    summary: 'A nostalgic platformer that brings back the golden age of gaming with pixel-perfect jumps and classic level design.',
    url: 'https://example.com/games/retro-platformer',
    genres: [
      { id: 12, name: 'Platform' },
      { id: 9, name: 'Indie' }
    ]
  },
  {
    id: 7,
    name: 'Fantasy Quest',
    cover: {
      id: 107,
      url: 'https://via.placeholder.com/264x374/3730a3/ffffff?text=Fantasy+Quest'
    },
    first_release_date: 1688169600, // 2023-07-01
    total_rating: 90,
    summary: 'Embark on an epic journey through a magical world filled with dragons, wizards, and ancient mysteries.',
    url: 'https://example.com/games/fantasy-quest',
    genres: [
      { id: 3, name: 'RPG' },
      { id: 2, name: 'Adventure' }
    ]
  },
  {
    id: 8,
    name: 'Combat Arena',
    cover: {
      id: 108,
      url: 'https://via.placeholder.com/264x374/4f46e5/ffffff?text=Combat+Arena'
    },
    first_release_date: 1704067200, // 2024-01-01
    total_rating: 75,
    summary: 'Test your fighting skills in this competitive arena game. Master different characters and their unique abilities.',
    url: 'https://example.com/games/combat-arena',
    genres: [
      { id: 11, name: 'Fighting' },
      { id: 1, name: 'Action' }
    ]
  },
  {
    id: 9,
    name: 'City Builder',
    cover: {
      id: 109,
      url: 'https://via.placeholder.com/264x374/7c3aed/ffffff?text=City+Builder'
    },
    first_release_date: 1719705600, // 2024-07-01
    total_rating: 87,
    summary: 'Design and build your dream city from the ground up. Manage resources, keep citizens happy, and watch your city thrive.',
    url: 'https://example.com/games/city-builder',
    genres: [
      { id: 6, name: 'Simulation' },
      { id: 4, name: 'Strategy' }
    ]
  },
  {
    id: 10,
    name: 'Zombie Survival',
    cover: {
      id: 110,
      url: 'https://via.placeholder.com/264x374/6d28d9/ffffff?text=Zombie+Survival'
    },
    first_release_date: 1735689600, // 2025-01-01
    total_rating: 80,
    summary: 'Survive in a post-apocalyptic world overrun by zombies. Scavenge for supplies, build defenses, and fight for your life.',
    url: 'https://example.com/games/zombie-survival',
    genres: [
      { id: 1, name: 'Action' },
      { id: 5, name: 'Shooter' }
    ]
  },
  {
    id: 11,
    name: 'Sports League',
    cover: {
      id: 111,
      url: 'https://via.placeholder.com/264x374/4338ca/ffffff?text=Sports+League'
    },
    first_release_date: 1751328000, // 2025-07-01
    total_rating: 83,
    summary: 'Experience the thrill of professional sports. Manage your team, train players, and compete in leagues and tournaments.',
    url: 'https://example.com/games/sports-league',
    genres: [
      { id: 7, name: 'Sports' },
      { id: 6, name: 'Simulation' }
    ]
  },
  {
    id: 12,
    name: 'Indie Gem',
    cover: {
      id: 112,
      url: 'https://via.placeholder.com/264x374/8b5cf6/ffffff?text=Indie+Gem'
    },
    first_release_date: 1767225600, // 2026-01-01
    total_rating: 92,
    summary: 'A unique indie game with innovative mechanics and a heartwarming story that will stay with you long after you finish playing.',
    url: 'https://example.com/games/indie-gem',
    genres: [
      { id: 9, name: 'Indie' },
      { id: 2, name: 'Adventure' }
    ]
  }
];

// Filter games by mood
function filterGamesByMood(mood, timeAvailable, genre) {
  let filteredGames = [...MOCK_GAMES];
  
  // Filter by mood
  if (mood) {
    switch(mood) {
      case 'relaxed':
        filteredGames = filteredGames.filter(game => 
          !game.genres.some(g => ['Shooter', 'Racing', 'Sports'].includes(g.name))
        );
        break;
      case 'excited':
        filteredGames = filteredGames.filter(game => 
          game.genres.some(g => ['Action', 'Shooter', 'Racing', 'Sports'].includes(g.name))
        );
        break;
      case 'focused':
        filteredGames = filteredGames.filter(game => 
          game.genres.some(g => ['Strategy', 'Puzzle'].includes(g.name))
        );
        break;
      case 'social':
        // In a real app, we'd filter by multiplayer games
        filteredGames = filteredGames.filter(game => 
          game.genres.some(g => ['Sports', 'Fighting'].includes(g.name))
        );
        break;
      case 'creative':
        filteredGames = filteredGames.filter(game => 
          game.genres.some(g => ['Simulation', 'Indie'].includes(g.name))
        );
        break;
      case 'nostalgic':
        filteredGames = filteredGames.filter(game => 
          game.first_release_date < 1009843200 // Before 2002
        );
        break;
    }
  }
  
  // Filter by time available
  if (timeAvailable) {
    switch(timeAvailable) {
      case 'short':
        filteredGames = filteredGames.filter(game => game.total_rating <= 80);
        break;
      case 'medium':
        filteredGames = filteredGames.filter(game => game.total_rating > 80 && game.total_rating < 90);
        break;
      case 'long':
        filteredGames = filteredGames.filter(game => game.total_rating >= 90);
        break;
    }
  }
  
  // Filter by genre
  if (genre) {
    // Handle both string genre names and numeric IDs
    if (typeof genre === 'string') {
      filteredGames = filteredGames.filter(game => 
        game.genres.some(g => g.name.toLowerCase().includes(genre.toLowerCase()))
      );
    } else {
      filteredGames = filteredGames.filter(game => 
        game.genres.some(g => g.id === genre)
      );
    }
  }
  
  return filteredGames;
}

module.exports = {
  MOCK_GENRES,
  MOCK_GAMES,
  filterGamesByMood
};
