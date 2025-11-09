import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyCredentials } from './auth'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials')
          return null
        }

        try {
          const user = await verifyCredentials(credentials.email, credentials.password)
          
          if (!user) {
            console.log('[AUTH] Authorization failed - user not found or invalid credentials')
            return null
          }

          console.log('[AUTH] Authorization successful for:', user.email)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('[AUTH] Error in authorize:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Trust the host in NextAuth v5 (can also use AUTH_TRUST_HOST env var)
}

// Export auth function for NextAuth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

