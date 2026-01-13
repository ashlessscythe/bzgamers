"use client"

import { motion } from 'framer-motion'

export default function FeedbackCard({ feedback, onView, onDelete, isDeleting }) {
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
              #{feedback.id}
            </span>
            {feedback.user ? (
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {feedback.user.name || feedback.user.email}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Anonymous
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {feedback.name}
          </h3>
          <a 
            href={`mailto:${feedback.email}`}
            className="text-sm text-primary hover:underline block mb-2 truncate"
          >
            {feedback.email}
          </a>
        </div>
        {isDeleting ? (
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <button
            onClick={() => onDelete(feedback.id)}
            className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete feedback"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <button
        onClick={() => onView(feedback)}
        className="text-left w-full mb-3 group"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 group-hover:text-primary transition-colors">
          {feedback.message}
        </p>
        {feedback.message.length > 120 && (
          <span className="text-xs text-primary mt-1 inline-block">
            Read more...
          </span>
        )}
      </button>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="font-medium">
            {new Date(feedback.createdAt).toLocaleDateString()}
          </div>
          <div>
            {new Date(feedback.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
