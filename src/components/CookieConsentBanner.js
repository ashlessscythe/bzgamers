"use client"

import { useCookieConsent } from './CookieConsentProvider'

export default function CookieConsentBanner() {
  const { acceptNecessary, acceptAll } = useCookieConsent()

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <p id="cookie-consent-title" className="font-semibold text-gray-900 dark:text-gray-100">
            Cookies &amp; storage
          </p>
          <p id="cookie-consent-desc" className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sign-in uses essential cookies. We can also remember your theme and game search on this device.
            We do not use advertising or analytics trackers.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={acceptNecessary}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="px-4 py-2 text-sm font-medium rounded-md btn-primary"
            title="Accept optional preferences storage (theme and saved search)"
          >
            Don&apos;t care
          </button>
        </div>
      </div>
    </div>
  )
}
