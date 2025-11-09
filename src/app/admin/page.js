"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [waitlist, setWaitlist] = useState([])
  const [stats, setStats] = useState({ total: 0, notified: 0, unnotified: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEmails, setSelectedEmails] = useState([])
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [useTemplate, setUseTemplate] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchWaitlist()
    }
  }, [status, session, router])

  const fetchWaitlist = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/waitlist')
      const data = await response.json()
      
      if (data.success) {
        setWaitlist(data.data)
        setStats(data.stats)
      } else {
        setError('Failed to fetch waitlist')
      }
    } catch (err) {
      setError('Error fetching waitlist')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSelect = (emailId) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEmails.length === waitlist.filter(e => !e.notified).length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(waitlist.filter(e => !e.notified).map(e => e.id))
    }
  }

  const handleSendEmail = async (sendToAll = false) => {
    if (!useTemplate && (!emailSubject || !emailMessage)) {
      setSendStatus({ type: 'error', message: 'Subject and message are required' })
      return
    }

    setIsSending(true)
    setSendStatus(null)

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailIds: sendToAll ? null : selectedEmails,
          subject: emailSubject || 'Welcome to BZGamers Waitlist! 🎮',
          message: emailMessage,
          sendToAll,
          useTemplate
        })
      })

      const data = await response.json()

      if (data.success) {
        setSendStatus({ 
          type: 'success', 
          message: `Sent ${data.sent} email(s), ${data.failed} failed` 
        })
        setEmailSubject('')
        setEmailMessage('')
        setSelectedEmails([])
        setShowEmailForm(false)
        fetchWaitlist() // Refresh list
      } else {
        setSendStatus({ type: 'error', message: data.error || 'Failed to send emails' })
      }
    } catch (err) {
      setSendStatus({ type: 'error', message: 'Error sending emails' })
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null
  }

  const unnotifiedEmails = waitlist.filter(e => !e.notified)

  return (
    <div className="min-h-[calc(100vh-200px)] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-secondary px-4 py-2"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Emails</h3>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Notified</h3>
            <p className="text-3xl font-bold text-green-600">{stats.notified}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.unnotified}</p>
          </motion.div>
        </div>

        {/* Email Form */}
        {showEmailForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Send Email</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useTemplate"
                  checked={useTemplate}
                  onChange={(e) => {
                    setUseTemplate(e.target.checked)
                    if (e.target.checked) {
                      setEmailSubject('Welcome to BZGamers Waitlist! 🎮')
                      setEmailMessage('')
                    }
                  }}
                  className="rounded"
                />
                <label htmlFor="useTemplate" className="text-sm font-medium">
                  Use default welcome email template
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  disabled={useTemplate}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Email subject"
                />
              </div>
              {!useTemplate && (
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Email message (HTML supported)"
                  />
                </div>
              )}
              {useTemplate && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
                  Using the default welcome email template. The email will be personalized for each recipient.
                </div>
              )}
              {sendStatus && (
                <div className={`p-4 rounded-lg ${
                  sendStatus.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {sendStatus.message}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => handleSendEmail(false)}
                  disabled={isSending || selectedEmails.length === 0}
                  className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : `Send to Selected (${selectedEmails.length})`}
                </button>
                <button
                  onClick={() => handleSendEmail(true)}
                  disabled={isSending || unnotifiedEmails.length === 0}
                  className="btn-secondary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Sending...' : `Send to All Pending (${unnotifiedEmails.length})`}
                </button>
                <button
                  onClick={() => {
                    setShowEmailForm(false)
                    setEmailSubject('')
                    setEmailMessage('')
                    setSendStatus(null)
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="btn-primary px-6 py-2"
          >
            {showEmailForm ? 'Hide Email Form' : 'Send Email'}
          </button>
          <button
            onClick={fetchWaitlist}
            className="btn-secondary px-6 py-2"
          >
            Refresh
          </button>
        </div>

        {/* Waitlist Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={unnotifiedEmails.length > 0 && selectedEmails.length === unnotifiedEmails.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notified
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {waitlist.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      {!email.notified && (
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email.id)}
                          onChange={() => handleEmailSelect(email.id)}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {email.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        email.notified
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}>
                        {email.notified ? 'Notified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(email.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {email.notifiedAt ? new Date(email.notifiedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {waitlist.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No emails on waitlist yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

