import '../styles/globals.css'
import ThemeToggle from '../components/ThemeToggle'

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4">
        <header className="py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">BZGamers</h1>
          <ThemeToggle />
        </header>
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  )
}

export default MyApp
