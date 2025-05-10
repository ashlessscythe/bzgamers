import Head from 'next/head'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Head>
        <title>BZGamers - Where the bz go to chill and play</title>
        <meta name="description" content="Find games that match your mood and connect with like-minded gamers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to{' '}
          <span className="text-primary">BZGamers</span>
        </h1>

        <p className="text-xl md:text-2xl mb-8">
          Where the bz go to chill and play
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button className="btn-primary text-lg py-3 px-8">
            Find a Game That Fits My Mood
          </button>
          <button className="btn-secondary text-lg py-3 px-8 opacity-70 cursor-not-allowed">
            (Coming Soon) Find Someone to Game With
          </button>
        </div>
      </main>

      <footer className="w-full h-16 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center">
        <p>
          BZGamers &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
