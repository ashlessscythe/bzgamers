import Link from 'next/link'

/**
 * Short note on what a free account adds. Signed-out users get an invitation;
 * signed-in users get a pointer to the features they can use.
 */
export default function AccountPerksNote({ isSignedIn, isLoading = false }) {
  if (isLoading) return null

  return (
    <aside
      aria-label="Account features"
      className="rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10 px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
    >
      {isSignedIn ? (
        <p>
          <span className="font-semibold">Your account:</span> tap the heart on any game to save it to your{' '}
          <Link href="/profile" className="text-primary hover:underline">profile</Link>, and set your preferred
          platforms there so searches start filtered to games you can play.
        </p>
      ) : (
        <p>
          <span className="font-semibold">Free account perks:</span> save favorite games and set your preferred
          platforms so searches start filtered to what you can play.{' '}
          <Link href="/profile" className="text-primary hover:underline">Sign in or create an account</Link>
        </p>
      )}
    </aside>
  )
}
