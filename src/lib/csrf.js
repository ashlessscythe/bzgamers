/**
 * CSRF defence for cookie-authenticated JSON routes: reject state-changing
 * requests whose Origin (or, failing that, Referer) is not our own site.
 * Requests with neither header (non-browser clients) carry no ambient cookies
 * and are allowed through.
 */

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function hostOf(value) {
  try {
    return new URL(value).host
  } catch {
    return null
  }
}

/**
 * @param {Request} request
 * @param {string[]} [extraHosts] additional trusted hosts (e.g. from NEXTAUTH_URL)
 * @returns {boolean} true if the request should be rejected
 */
export function isCrossSiteWrite(request, extraHosts = []) {
  if (SAFE_METHODS.has(request.method)) return false

  const source = request.headers.get('origin') ?? request.headers.get('referer')
  if (!source) return false
  if (source === 'null') return true

  const sourceHost = hostOf(source)
  if (!sourceHost) return true

  const trusted = new Set(extraHosts.filter(Boolean))
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (host) trusted.add(host)
  return !trusted.has(sourceHost)
}
