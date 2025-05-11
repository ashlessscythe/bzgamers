import { motion } from 'framer-motion'

/**
 * GameCard component for displaying individual game information
 */
export default function GameCard({ game }) {
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    },
    hover: { 
      y: -10,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 10
      }
    }
  }

  // Format release date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Release Date'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Get cover image URL or placeholder
  const getCoverUrl = (cover) => {
    if (cover && cover.url) {
      // Replace t_thumb with t_cover_big for larger images
      return cover.url.replace('t_thumb', 't_cover_big')
    }
    return 'https://via.placeholder.com/264x374?text=No+Image'
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700">
        <img 
          src={getCoverUrl(game.cover)} 
          alt={game.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {game.total_rating && (
          <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            {Math.round(game.total_rating)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{game.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {formatDate(game.first_release_date)}
        </p>
        
        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.genres.slice(0, 3).map(genre => (
              <span 
                key={genre.id} 
                className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
          {game.summary || 'No description available.'}
        </p>
        
        <a 
          href={game.url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-primary text-sm py-2 px-4 inline-block"
        >
          Learn More
        </a>
      </div>
    </motion.div>
  )
}
