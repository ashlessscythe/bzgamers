"use client"

import { motion } from 'framer-motion'

export default function WaitlistCard({ email, onSelect, isSelected, canSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border ${
        isSelected 
          ? 'border-primary dark:border-primary/50 bg-primary/5 dark:bg-primary/10' 
          : 'border-gray-200 dark:border-gray-700'
      } p-4 hover:shadow-lg transition-all`}
    >
      <div className="flex items-start gap-3">
        {canSelect && (
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(email.id)}
              className="rounded w-4 h-4 text-primary focus:ring-primary"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <a 
              href={`mailto:${email.email}`}
              className="text-sm font-medium text-primary hover:underline truncate flex-1"
            >
              {email.email}
            </a>
            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
              email.notified
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
            }`}>
              {email.notified ? 'Notified' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>
              <div className="font-medium mb-1">Joined:</div>
              <div>{new Date(email.createdAt).toLocaleDateString()}</div>
            </div>
            {email.notifiedAt && (
              <div>
                <div className="font-medium mb-1">Notified:</div>
                <div>{new Date(email.notifiedAt).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
