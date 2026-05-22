import '../styles/globals.css'
import Layout from '../components/Layout'
import { SITE_NAME } from '../lib/config'
import SessionProvider from '../components/SessionProvider'
import CookieConsentProvider from '../components/CookieConsentProvider'

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
          <CookieConsentProvider>
            <Layout>
              {children}
            </Layout>
          </CookieConsentProvider>
        </SessionProvider>
      </body>
    </html>
  )
} 