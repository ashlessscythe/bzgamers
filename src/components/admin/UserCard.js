"use client"

import { motion } from 'framer-motion'

export default function UserCard({ user, onRoleChange, isUpdating, currentUserId }) {
  const isCurrentUser = parseInt(currentUserId) === user.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              #{user.id}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
              user.role === 'ADMIN'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
            }`}>
              {user.role}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {user.email}
          </h3>
          {user.name && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {user.name}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Favorites:</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {user._count?.favorites || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Email Verified:</span>
          {user.emailVerified ? (
            <span className="text-green-600 dark:text-green-400 font-medium">✓ Verified</span>
          ) : (
            <span className="text-gray-400">Not verified</span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Created:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Role
        </label>
        {isUpdating ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <select
            value={user.role}
            onChange={(e) => onRoleChange(user.id, e.target.value)}
            disabled={isCurrentUser}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="GUEST">GUEST</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        )}
        {isCurrentUser && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Cannot change your own role
          </p>
        )}
      </div>
    </motion.div>
  )
}
