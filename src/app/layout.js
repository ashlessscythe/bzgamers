import '../styles/globals.css'
import Layout from '../components/Layout'
import { SITE_NAME } from '../lib/config'
import SessionProvider from '../components/SessionProvider'

export const metadata = {
  title: {
    default: SITE_NAME,
    template: `%s - ${SITE_NAME}`
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
        <SessionProvider>
          <Layout>
            {children}
          </Layout>
        </SessionProvider>
      </body>
    </html>
  )
} 