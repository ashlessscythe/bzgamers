"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import FeedbackCard from '@/components/admin/FeedbackCard'
import UserCard from '@/components/admin/UserCard'
import WaitlistCard from '@/components/admin/WaitlistCard'
import AnalyticsPanel from '@/components/admin/AnalyticsPanel'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('waitlist') // 'waitlist', 'users', 'feedback', or 'analytics'
  const [waitlist, setWaitlist] = useState([])
  const [stats, setStats] = useState({ total: 0, notified: 0, unnotified: 0 })
  const [users, setUsers] = useState([])
  const [userStats, setUserStats] = useState({ total: 0, admins: 0, guests: 0 })
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, withUser: 0, anonymous: 0 })
  const [analyticsEvents, setAnalyticsEvents] = useState([])
  const [analyticsStats, setAnalyticsStats] = useState({
    totalEvents: 0,
    uniqueVisitors: 0,
    moodSearches: 0,
    gameSearches: 0,
    similarSearches: 0,
    anonymousEvents: 0,
    signedInEvents: 0,
    favorites: 0,
    byType: {},
  })
  const [analyticsTables, setAnalyticsTables] = useState({
    topMoods: [],
    topSearches: [],
    topSimilarSeeds: [],
    topTimes: [],
    topGenres: [],
  })
  const [analyticsDays, setAnalyticsDays] = useState(30)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [, setError] = useState('')
  const [deletingFeedback, setDeletingFeedback] = useState({})
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [selectedEmails, setSelectedEmails] = useState([])
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [useTemplate, setUseTemplate] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState(null)
  const [updatingRoles, setUpdatingRoles] = useState({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchWaitlist()
      fetchUsers()
      fetchFeedbacks()
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return

    let cancelled = false
    const load = async () => {
      try {
        setIsLoadingAnalytics(true)
        const response = await fetch(`/api/admin/analytics?days=${analyticsDays}&limit=100`)
        const data = await response.json()
        if (cancelled) return
        if (data.success) {
          setAnalyticsEvents(data.data)
          setAnalyticsStats(data.stats)
          setAnalyticsTables(data.tables)
        } else {
          setError('Failed to fetch analytics')
        }
      } catch (err) {
        if (!cancelled) {
          setError('Error fetching analytics')
          console.error(err)
        }
      } finally {
        if (!cancelled) setIsLoadingAnalytics(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [status, session, analyticsDays])

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

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.data)
        setUserStats(data.stats)
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('Error fetching users')
      console.error(err)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const fetchFeedbacks = async () => {
    try {
      setIsLoadingFeedback(true)
      const response = await fetch('/api/admin/feedback')
      const data = await response.json()
      
      if (data.success) {
        setFeedbacks(data.data)
        setFeedbackStats(data.stats)
      } else {
        setError('Failed to fetch feedback')
      }
    } catch (err) {
      setError('Error fetching feedback')
      console.error(err)
    } finally {
      setIsLoadingFeedback(false)
    }
  }

  const fetchAnalytics = async (days = analyticsDays) => {
    try {
      setIsLoadingAnalytics(true)
      const response = await fetch(`/api/admin/analytics?days=${days}&limit=100`)
      const data = await response.json()

      if (data.success) {
        setAnalyticsEvents(data.data)
        setAnalyticsStats(data.stats)
        setAnalyticsTables(data.tables)
      } else {
        setError('Failed to fetch analytics')
      }
    } catch (err) {
      setError('Error fetching analytics')
      console.error(err)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return
    }

    setDeletingFeedback(prev => ({ ...prev, [feedbackId]: true }))
    
    try {
      const response = await fetch(`/api/admin/feedback?id=${feedbackId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setFeedbacks(prev => prev.filter(f => f.id !== feedbackId))
        fetchFeedbacks() // Refresh stats
      } else {
        alert(data.error || 'Failed to delete feedback')
      }
    } catch (err) {
      alert('Error deleting feedback')
      console.error(err)
    } finally {
      setDeletingFeedback(prev => ({ ...prev, [feedbackId]: false }))
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRoles(prev => ({ ...prev, [userId]: true }))
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      const data = await response.json()

      if (data.success) {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          )
        )
        // Refresh stats
        fetchUsers()
      } else {
        alert(data.error || 'Failed to update user role')
      }
    } catch (err) {
      alert('Error updating user role')
      console.error(err)
    } finally {
      setUpdatingRoles(prev => ({ ...prev, [userId]: false }))
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

  if (status === 'loading' || (isLoading && activeTab === 'waitlist') || (isLoadingUsers && activeTab === 'users') || (isLoadingFeedback && activeTab === 'feedback') || (isLoadingAnalytics && activeTab === 'analytics' && analyticsEvents.length === 0)) {
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'waitlist'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Waitlist Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'feedback'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Feedback Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Visitor Activity
            </button>
          </div>
        </div>

        {/* Waitlist Tab Content */}
        {activeTab === 'waitlist' && (
          <>
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

        {/* Waitlist Cards (Mobile) */}
        <div className="md:hidden space-y-4">
          {waitlist.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              No emails on waitlist yet
            </div>
          ) : (
            waitlist.map((email) => (
              <WaitlistCard
                key={email.id}
                email={email}
                onSelect={handleEmailSelect}
                isSelected={selectedEmails.includes(email.id)}
                canSelect={!email.notified}
              />
            ))
          )}
        </div>

        {/* Waitlist Table (Desktop) */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
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
          </>
        )}

        {/* User Management Tab Content */}
        {activeTab === 'users' && (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-primary">{userStats.total}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Admins</h3>
                <p className="text-3xl font-bold text-purple-600">{userStats.admins}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Guests</h3>
                <p className="text-3xl font-bold text-blue-600">{userStats.guests}</p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex gap-4">
              <button
                onClick={fetchUsers}
                className="btn-secondary px-6 py-2"
              >
                Refresh
              </button>
            </div>

            {/* Users Cards (Mobile) */}
            <div className="md:hidden space-y-4">
              {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  No users found
                </div>
              ) : (
                users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onRoleChange={handleRoleChange}
                    isUpdating={updatingRoles[user.id]}
                    currentUserId={session?.user?.id}
                  />
                ))
              )}
            </div>

            {/* Users Table (Desktop) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Favorites
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email Verified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {user.name || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {user._count?.favorites || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {user.emailVerified ? (
                            <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                          ) : (
                            <span className="text-gray-400">Not verified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {updatingRoles[user.id] ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={parseInt(session?.user?.id) === user.id}
                              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="GUEST">GUEST</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No users found
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Feedback Management Tab Content */}
        {activeTab === 'feedback' && (
          <>
            {/* Feedback Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Feedback</h3>
                <p className="text-3xl font-bold text-primary">{feedbackStats.total}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">From Users</h3>
                <p className="text-3xl font-bold text-blue-600">{feedbackStats.withUser}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Anonymous</h3>
                <p className="text-3xl font-bold text-orange-600">{feedbackStats.anonymous}</p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex gap-4">
              <button
                onClick={fetchFeedbacks}
                className="btn-secondary px-6 py-2"
              >
                Refresh
              </button>
            </div>

            {/* Feedback Cards (Mobile) */}
            <div className="md:hidden space-y-4">
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  No feedback submissions yet
                </div>
              ) : (
                feedbacks.map((feedback) => (
                  <FeedbackCard
                    key={feedback.id}
                    feedback={feedback}
                    onView={setSelectedFeedback}
                    onDelete={handleDeleteFeedback}
                    isDeleting={deletingFeedback[feedback.id]}
                  />
                ))
              )}
            </div>

            {/* Feedback Table (Desktop) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {feedbacks.map((feedback) => (
                      <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            #{feedback.id}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {feedback.name}
                            </span>
                            <a 
                              href={`mailto:${feedback.email}`}
                              className="text-sm text-primary hover:underline truncate max-w-xs"
                              title={feedback.email}
                            >
                              {feedback.email}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {feedback.user ? (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {feedback.user.name || feedback.user.email}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              Anonymous
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 max-w-lg">
                          <button
                            onClick={() => setSelectedFeedback(feedback)}
                            className="text-left group"
                            title="Click to view full message"
                          >
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-primary transition-colors">
                              {feedback.message}
                            </p>
                            {feedback.message.length > 120 && (
                              <span className="text-xs text-primary mt-1 inline-block">
                                Read more...
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <div className="font-medium">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(feedback.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {deletingFeedback[feedback.id] ? (
                            <div className="inline-flex items-center justify-center w-8 h-8">
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeleteFeedback(feedback.id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete feedback"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {feedbacks.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No feedback submissions yet
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Detail Modal */}
            {selectedFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                onClick={() => setSelectedFeedback(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Feedback Details
                      </h2>
                      <button
                        onClick={() => setSelectedFeedback(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ID</label>
                        <p className="text-gray-900 dark:text-white">{selectedFeedback.id}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                        <p className="text-gray-900 dark:text-white">{selectedFeedback.name}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <p className="text-gray-900 dark:text-white">
                          <a 
                            href={`mailto:${selectedFeedback.email}`}
                            className="text-primary hover:underline"
                          >
                            {selectedFeedback.email}
                          </a>
                        </p>
                      </div>

                      {selectedFeedback.user && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">User Account</label>
                          <p className="text-gray-900 dark:text-white">
                            {selectedFeedback.user.name || selectedFeedback.user.email} (ID: {selectedFeedback.user.id})
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Message</label>
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          {selectedFeedback.message}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(selectedFeedback.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={() => {
                            handleDeleteFeedback(selectedFeedback.id)
                            setSelectedFeedback(null)
                          }}
                          disabled={deletingFeedback[selectedFeedback.id]}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {deletingFeedback[selectedFeedback.id] ? 'Deleting...' : 'Delete Feedback'}
                        </button>
                        <button
                          onClick={() => setSelectedFeedback(null)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </>
        )}

        {/* Visitor Activity Tab Content */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel
            stats={analyticsStats}
            tables={analyticsTables}
            events={analyticsEvents}
            days={analyticsDays}
            onDaysChange={setAnalyticsDays}
            onRefresh={() => fetchAnalytics(analyticsDays)}
            isLoading={isLoadingAnalytics}
          />
        )}
      </div>
    </div>
  )
}

