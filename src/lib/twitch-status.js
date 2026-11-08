/**
 * Twitch/IGDB token health: records auth failures (with a throttled optional
 * email alert) and exposes a safe status snapshot for the admin UI.
 * State lives in the DB search cache, so it is shared across instances and
 * needs no schema change. The token value is never returned.
 */

const STATUS_QUERY = { type: 'auth_token_status' }
const TOKEN_QUERY = { type: 'auth_token' }
const STATUS_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days
const ALERT_INTERVAL = 60 * 60 * 1000 // at most one alert email per hour

function redact(message, secrets) {
  let out = String(message || 'Unknown error')
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join('[redacted]')
  }
  return out.slice(0, 300)
}

function createTwitchStatus({ dbCache, sendAlert, now = () => Date.now(), env = process.env }) {
  async function readStatus() {
    try {
      return (await dbCache.getCachedSearch(STATUS_QUERY)) || {}
    } catch {
      return {}
    }
  }

  async function writeStatus(status) {
    await dbCache.cacheSearch(STATUS_QUERY, status, STATUS_TTL)
  }

  async function recordTokenSuccess() {
    try {
      const status = await readStatus()
      await writeStatus({ ...status, consecutiveFailures: 0, lastSuccessAt: now() })
    } catch (error) {
      console.error('[TWITCH_STATUS] Failed to record success:', error?.message)
    }
  }

  async function recordTokenFailure(error) {
    const failure = {
      at: now(),
      status: error?.status ?? null,
      message: redact(error?.message, [env.NEXT_API_CLIENT_SECRET, env.NEXT_API_CLIENT_ID]),
    }
    console.error(
      `[TWITCH_AUTH_FAILURE] status=${failure.status ?? 'n/a'} message="${failure.message}"`
    )

    try {
      const status = await readStatus()
      const next = {
        ...status,
        consecutiveFailures: (status.consecutiveFailures || 0) + 1,
        lastFailure: failure,
      }

      const alertTo = env.ADMIN_ALERT_EMAIL
      const due = !status.lastAlertAt || now() - status.lastAlertAt >= ALERT_INTERVAL
      if (alertTo && due && sendAlert) {
        try {
          await sendAlert({ to: alertTo, failure, consecutiveFailures: next.consecutiveFailures })
          next.lastAlertAt = now()
        } catch (alertError) {
          console.error('[TWITCH_STATUS] Failed to send alert:', alertError?.message)
        }
      }

      await writeStatus(next)
    } catch (statusError) {
      console.error('[TWITCH_STATUS] Failed to record failure:', statusError?.message)
    }
  }

  async function getTokenStatus() {
    const status = await readStatus()
    let token = { present: false }
    try {
      const cached = await dbCache.getCachedSearch(TOKEN_QUERY)
      if (cached?.token) {
        const expiresAt = cached.createdAt + cached.expiresIn * 1000
        token = {
          present: true,
          createdAt: cached.createdAt,
          expiresAt,
          secondsRemaining: Math.max(0, Math.round((expiresAt - now()) / 1000)),
        }
      }
    } catch {
      // leave token.present = false
    }

    return {
      config: {
        clientIdSet: Boolean(env.NEXT_API_CLIENT_ID),
        clientSecretSet: Boolean(env.NEXT_API_CLIENT_SECRET),
        alertEmailSet: Boolean(env.ADMIN_ALERT_EMAIL),
      },
      token,
      health: {
        consecutiveFailures: status.consecutiveFailures || 0,
        lastSuccessAt: status.lastSuccessAt ?? null,
        lastFailure: status.lastFailure ?? null,
        lastAlertAt: status.lastAlertAt ?? null,
      },
    }
  }

  return { recordTokenSuccess, recordTokenFailure, getTokenStatus }
}

async function sendEmailAlert({ to, failure, consecutiveFailures }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set')
  const { Resend } = require('resend')
  const from = process.env.RESEND_FROM_EMAIL || 'BZGamers <onboarding@resend.dev>'
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from,
    to,
    subject: 'BZGamers: Twitch/IGDB token request is failing',
    text:
      `Requesting a Twitch OAuth token failed (${consecutiveFailures} in a row).\n\n` +
      `Status: ${failure.status ?? 'n/a'}\nMessage: ${failure.message}\n` +
      `Time: ${new Date(failure.at).toISOString()}\n\n` +
      'Game search will stop working once the cached token expires. ' +
      'Check NEXT_API_CLIENT_ID / NEXT_API_CLIENT_SECRET.',
  })
  if (error) throw new Error(error.message || 'send failed')
}

const defaultInstance = createTwitchStatus({
  dbCache: require('./db-cache'),
  sendAlert: sendEmailAlert,
})

module.exports = { createTwitchStatus, ...defaultInstance }
