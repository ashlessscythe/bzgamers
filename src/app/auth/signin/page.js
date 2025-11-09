"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AuthModal from '../../../components/AuthModal'

export default function SignInPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Show modal when page loads
    setShowModal(true)
  }, [])

  const handleClose = () => {
    setShowModal(false)
    // Redirect to home after closing
    router.push('/')
  }

  return (
    <>
      <AuthModal 
        isOpen={showModal} 
        onClose={handleClose}
        initialMode="signin"
      />
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Redirecting to sign in...
          </p>
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </>
  )
}

