"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  CONSENT_STORAGE_KEY,
  allowsPreferenceStorage,
  clearOptionalStorage,
  readStoredConsent,
  writeStoredConsent,
} from '../lib/cookie-consent'
import CookieConsentBanner from './CookieConsentBanner'

const CookieConsentContext = createContext(null)

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return ctx
}

export default function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setConsent(readStoredConsent())
    setReady(true)
  }, [])

  const acceptNecessary = useCallback(() => {
    clearOptionalStorage()
    writeStoredConsent('necessary')
    setConsent('necessary')
    window.dispatchEvent(new CustomEvent('bzgamers-cookie-consent', { detail: 'necessary' }))
  }, [])

  const acceptAll = useCallback(() => {
    writeStoredConsent('all')
    setConsent('all')
    window.dispatchEvent(new CustomEvent('bzgamers-cookie-consent', { detail: 'all' }))
  }, [])

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY)
    setConsent(null)
  }, [])

  const value = useMemo(
    () => ({
      consent,
      ready,
      showBanner: ready && consent === null,
      preferencesAllowed: allowsPreferenceStorage(consent),
      acceptNecessary,
      acceptAll,
      resetConsent,
    }),
    [consent, ready, acceptNecessary, acceptAll, resetConsent]
  )

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {value.showBanner && <CookieConsentBanner />}
    </CookieConsentContext.Provider>
  )
}
