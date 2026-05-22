import { PrismaClient } from '@/generated/prisma'
import { fetchGameById } from '@/lib/api'
import { isStaleGameData, normalizeGame } from '@/lib/game-utils'

const prisma = new PrismaClient()

/**
 * Refresh legacy/incomplete favorite snapshots from IGDB and persist when possible.
 */
export async function enrichFavorites(favorites) {
  return Promise.all(
    favorites.map(async (fav) => {
      const gameId = fav.gameId

      if (!isStaleGameData(fav.gameData, gameId)) {
        return {
          ...fav,
          gameData: normalizeGame(fav.gameData, gameId),
        }
      }

      try {
        const fresh = await fetchGameById(gameId)
        await prisma.favorite.update({
          where: { id: fav.id },
          data: {
            gameData: fresh,
            gameName: fresh.name ?? fav.gameName,
          },
        })
        return { ...fav, gameData: fresh, gameName: fresh.name ?? fav.gameName }
      } catch (error) {
        console.warn(`Could not refresh favorite game ${gameId}:`, error.message)
        return {
          ...fav,
          gameData: normalizeGame(fav.gameData, gameId),
        }
      }
    })
  )
}
