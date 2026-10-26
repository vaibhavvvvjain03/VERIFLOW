import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

export interface UrlValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  host?: string;
  ipAddresses?: string[];
  protocol?: string;
  port?: number;
  error?: string;
  warning?: string;
  isLocalFixture?: boolean;
}

/**
 * Cloud metadata endpoints and known dangerous internal hostnames
 */
const BLOCKED_HOSTNAMES = new Set([
  'metadata.google.internal',
  'instance-data',
  '169.254.169.254',
  '100.100.100.200',
  'metadata.aws.internal',
]);

/**
 * Checks if an IPv4 address falls within private, loopback, link-local, multicast, or reserved ranges.
 */
export function isPrivateOrReservedIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // invalid IP format considered unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private network)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 100.64.0.0/10 (Shared Address Space / Carrier-Grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 169.254.0.0/16 (Link-local & Cloud Metadata)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && parts[2] === 0) return true;

  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && parts[2] === 2) return true;

  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Network benchmark tests)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && parts[2] === 100) return true;

  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && parts[2] === 113) return true;

  // 224.0.0.0/4 (Multicast: 224.0.0.0 - 239.255.255.255)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future Use)
  if (a >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (ip === '255.255.255.255') return true;

  return false;
}

/**
 * Checks if an IPv6 address falls within loopback, unique local, link-local, multicast, or IPv4-mapped private ranges.
 */
export function isPrivateOrReservedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 (Loopback)
  if (normalized === '::1' || normalized === '0000:0000:0000:0000:0000:0000:0000:0001') return true;

  // :: (Unspecified)
  if (normalized === '::' || normalized === '0000:0000:0000:0000:0000:0000:0000:0000') return true;

  // fc00::/7 (Unique Local Address - private)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // fe80::/10 (Link-local)
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;

  // ff00::/8 (Multicast)
  if (normalized.startsWith('ff')) return true;

  // IPv4-mapped IPv6 (::ffff:192.0.2.1)
  if (normalized.startsWith('::ffff:')) {
    const ipv4Part = normalized.substring(7);
    return isPrivateOrReservedIPv4(ipv4Part);
  }

  return false;
}

/**
 * Comprehensive target URL validation enforcing destination safety, protocol rules, and DNS resolution checks.
 *
 * @param inputUrl Raw URL string entered by user
 * @param allowLocalFixture Whether explicit localhost testing against internal demo store is allowed
 */
export async function validateTargetUrl(
  inputUrl: string,
  allowLocalFixture: boolean = false
): Promise<UrlValidationResult> {
  // URL-004: Empty URL or whitespace-only
  if (!inputUrl || !inputUrl.trim()) {
    return {
      valid: false,
      error: 'Target URL cannot be empty. Enter a valid public website URL (e.g., https://example.com).',
    };
  }

  let raw = inputUrl.trim();
  const lowerRaw = raw.toLowerCase();

  // URL-006: Unsupported schemes (file:, data:, javascript:, ftp:, gopher:, etc.)
  const PROHIBITED_SCHEMES = ['file:', 'data:', 'javascript:', 'vbscript:', 'ftp:', 'gopher:', 'ws:', 'wss:', 'mailto:', 'about:'];
  for (const s of PROHIBITED_SCHEMES) {
    if (lowerRaw.startsWith(s)) {
      return {
        valid: false,
        error: `Unsupported URL protocol "${s}". Only HTTPS and HTTP public websites are supported.`,
      };
    }
  }

  // URL-003: Missing scheme (e.g. "example.com" or "news.ycombinator.com")
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
    // Protocol-relative check (URL-016: //example.com)
    if (raw.startsWith('//')) {
      raw = 'https:' + raw;
    } else {
      raw = 'https://' + raw;
    }
  }

  // Parse with standard WHATWG URL parser
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch (err: any) {
    // URL-005: Malformed URL / broken percent encoding
    return {
      valid: false,
      error: `Malformed URL: ${err.message || 'Invalid URL syntax'}`,
    };
  }

  // URL-006: Unsupported schemes (file:, data:, javascript:, ftp:, gopher:)
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return {
      valid: false,
      error: `Unsupported URL protocol "${protocol}". Only HTTPS and HTTP public websites are supported.`,
    };
  }

  let warning: string | undefined;
  // URL-002: HTTP warning
  if (protocol === 'http:') {
    warning = 'Target uses unencrypted HTTP transport. In-transit data is not encrypted.';
  }

  // URL-007: Reject credentials in URL (user:pass@)
  if (parsed.username || parsed.password) {
    parsed.username = '';
    parsed.password = '';
    warning = (warning ? warning + ' ' : '') + 'Credentials stripped from target URL for security.';
  }

  const hostname = parsed.hostname.toLowerCase();

  // URL-008: Unicode / punycode normalization (parsed.hostname already handles IDN normalization)
  const canonicalHost = hostname;

  // Cloud metadata endpoint hostnames check (URL-012, SEC-001)
  if (BLOCKED_HOSTNAMES.has(canonicalHost) || canonicalHost.endsWith('.internal') || canonicalHost.endsWith('.local')) {
    return {
      valid: false,
      error: `Access to internal/cloud metadata destination "${canonicalHost}" is blocked for security.`,
    };
  }

  // Check if target is the internal local demo store fixture
  const isLocalhost =
    canonicalHost === 'localhost' ||
    canonicalHost === '127.0.0.1' ||
    canonicalHost === '::1' ||
    canonicalHost === '0.0.0.0';

  const port = parsed.port ? parseInt(parsed.port, 10) : protocol === 'https:' ? 443 : 80;

  if (isLocalhost) {
    if (allowLocalFixture) {
      return {
        valid: true,
        normalizedUrl: parsed.toString(),
        host: canonicalHost,
        protocol,
        port,
        isLocalFixture: true,
        warning: 'Testing against local development fixture context.',
      };
    } else {
      // URL-010: Block localhost / loopback in public URL testing mode
      return {
        valid: false,
        error: `Localhost target "${canonicalHost}" is blocked in public website testing mode. To run regression tests against the demo store, use the internal fixture toggle.`,
      };
    }
  }

  // URL-016: Non-standard port policy
  // For external public testing, only permit ports 80, 443, 8080, 8443
  const ALLOWED_PUBLIC_PORTS = [80, 443, 8080, 8443];
  if (!ALLOWED_PUBLIC_PORTS.includes(port)) {
    return {
      valid: false,
      error: `Port ${port} is not permitted for public website testing. Permitted ports: 80, 443, 8080, 8443.`,
    };
  }

  // IP literal checks (URL-009, URL-011)
  const isIpv4Literal = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(canonicalHost);
  const isIpv6Literal = canonicalHost.startsWith('[') && canonicalHost.endsWith(']');
  const cleanIpv6 = isIpv6Literal ? canonicalHost.slice(1, -1) : canonicalHost;

  if (isIpv4Literal) {
    if (isPrivateOrReservedIPv4(canonicalHost)) {
      return {
        valid: false,
        error: `Destination IP "${canonicalHost}" is a private or reserved network range and cannot be accessed.`,
      };
    }
  } else if (cleanIpv6.includes(':')) {
    if (isPrivateOrReservedIPv6(cleanIpv6)) {
      return {
        valid: false,
        error: `Destination IPv6 "${cleanIpv6}" is a private or reserved network range and cannot be accessed.`,
      };
    }
  } else {
    // DNS Resolution & Rebinding Check (URL-013, URL-017, SEC-001)
    try {
      const addresses = await dnsLookup(canonicalHost, { all: true });
      const ipList = addresses.map((a) => a.address);

      for (const addr of addresses) {
        if (addr.family === 4 && isPrivateOrReservedIPv4(addr.address)) {
          return {
            valid: false,
            error: `Security violation: Domain "${canonicalHost}" resolves to private IP "${addr.address}" (DNS rebinding risk). Access blocked.`,
          };
        }
        if (addr.family === 6 && isPrivateOrReservedIPv6(addr.address)) {
          return {
            valid: false,
            error: `Security violation: Domain "${canonicalHost}" resolves to private IPv6 "${addr.address}". Access blocked.`,
          };
        }
      }

      return {
        valid: true,
        normalizedUrl: parsed.toString(),
        host: canonicalHost,
        ipAddresses: ipList,
        protocol,
        port,
        warning,
        isLocalFixture: false,
      };
    } catch (dnsErr: any) {
      // URL-017: DNS lookup failure / NXDOMAIN
      return {
        valid: false,
        error: `DNS resolution failed for host "${canonicalHost}": ${dnsErr.code || dnsErr.message || 'Domain name does not exist'}.`,
      };
    }
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    host: canonicalHost,
    protocol,
    port,
    warning,
    isLocalFixture: false,
  };
}
