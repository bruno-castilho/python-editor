import { UAParser } from 'ua-parser-js'
import geoip from 'geoip-lite'

export function parseSessionInfo(req: {
  ip?: string
  headers: Record<string, string | string[] | undefined>
}) {
  const rawIp =
    (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim() ??
    req.ip ??
    ''

  const userAgent = (req.headers['user-agent'] as string | undefined) ?? ''

  const parser = new UAParser(userAgent)
  const browserResult = parser.getBrowser()
  const osResult = parser.getOS()
  const deviceResult = parser.getDevice()

  const browser = browserResult.name ?? 'Unknown'

  let device = 'Unknown'
  if (deviceResult.vendor || deviceResult.model) {
    device = [deviceResult.vendor, deviceResult.model].filter(Boolean).join(' ')
  } else if (osResult.name) {
    device = osResult.name
  }

  let location = 'Unknown'
  const geo = geoip.lookup(rawIp)
  if (geo) {
    const parts = [geo.city, geo.region, geo.country].filter(Boolean)
    if (parts.length > 0) {
      location = parts.join(' - ')
    }
  }

  return { ip: rawIp, device, browser, location }
}
