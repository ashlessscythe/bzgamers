import '../styles/globals.css'
import Layout from '../components/Layout'
import { SITE_NAME } from '../lib/config'

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
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
} 