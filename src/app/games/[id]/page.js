import { notFound } from 'next/navigation'
import { fetchGameById } from '@/lib/api'
import { SITE_NAME } from '@/lib/config'
import { getSiteUrl } from '@/lib/site-url'
import GameDetailView from '@/components/GameDetailView'

function getOgImageUrl(cover) {
  if (!cover?.url) return null
  const url = cover.url.startsWith('//') ? `https:${cover.url}` : cover.url
  return url.replace('t_thumb', 't_cover_big')
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const gameId = parseInt(id, 10)
  if (!Number.isFinite(gameId) || gameId <= 0) {
    return { title: 'Game not found' }
  }

  try {
    const game = await fetchGameById(gameId)
    const title = game.name || 'Game'
    const description =
      game.summary?.slice(0, 160) ||
      `View ${title} on ${SITE_NAME} — find games that match your mood.`
    const imageUrl = getOgImageUrl(game.cover)
    const pageUrl = `${getSiteUrl()}/games/${gameId}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: SITE_NAME,
        type: 'website',
        ...(imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {}),
      },
      twitter: {
        card: imageUrl ? 'summary_large_image' : 'summary',
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
      },
    }
  } catch {
    return { title: 'Game not found' }
  }
}

export default async function GamePage({ params }) {
  const { id } = await params
  const gameId = parseInt(id, 10)

  if (!Number.isFinite(gameId) || gameId <= 0) {
    notFound()
  }

  try {
    const game = await fetchGameById(gameId)
    return <GameDetailView game={game} />
  } catch {
    notFound()
  }
}
