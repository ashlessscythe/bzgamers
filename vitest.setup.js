import '@testing-library/jest-dom/vitest'
import { configure, cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import React from 'react'
import { authMocks } from './src/test/auth-mocks'

configure({ reactStrictMode: false })

afterEach(() => {
  cleanup()
})

vi.mock('next-auth/react', () => ({
  useSession: (...args) => authMocks.useSession(...args),
  signIn: (...args) => authMocks.signIn(...args),
  signOut: (...args) => authMocks.signOut(...args),
  SessionProvider: ({ children }) => children,
}))

vi.mock('framer-motion', () => {
  const motionHandler = (tag) => {
    const MotionComponent = React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(tag, { ...props, ref }, children)
    )
    MotionComponent.displayName = `motion.${tag}`
    return MotionComponent
  }

  return {
    motion: new Proxy(
      {},
      {
        get: (_, prop) => motionHandler(prop),
      }
    ),
    AnimatePresence: ({ children }) => children,
  }
})
