import '../styles/globals.css'
import Layout from '../components/Layout'

export const metadata = {
  title: {
    default: 'BZGamers - Where the bz go to chill and play',
    template: '%s - BZGamers'
  },
  description: 'Find games that match your mood and connect with like-minded gamers',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
} 