// Deriva la zona horaria del PAÍS de un equipo a partir de su IP pública — reemplaza el supuesto
// de que todos los equipos están en Colombia (-05:00) al convertir timestamps para mostrar
// (ver computers.timezone_offset_minutes en el schema, consumido por tracer-dashboard).
//
// Usa ip-api.com (gratis, sin api-key, ~45 req/min) en vez de ipdata.co (ya usado client-side en
// tracer-dashboard para mostrar ciudad/país) porque la key compartida ahí ya no devuelve
// time_zone/country — confirmado con una llamada real durante el desarrollo, probablemente por
// cuota/plan agotado. Esto solo se llama cuando la IP de un equipo cambia (ver wsHub.ts), así
// que el límite de tasa gratis alcanza de sobra.

const PRIVATE_IP_RE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.0\.0\.0$|::1$|fd|fc)/;

export function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RE.test(ip.trim());
}

export interface TimezoneInfo {
  name: string;
  offsetMinutes: number;
}

export async function lookupTimezoneForIp(ip: string): Promise<TimezoneInfo | null> {
  if (!ip || isPrivateIp(ip)) return null;

  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,timezone,offset`);
    if (!res.ok) return null;

    const data = await res.json() as { status: string; timezone?: string; offset?: number };
    if (data.status !== "success" || !data.timezone || typeof data.offset !== "number") return null;

    return { name: data.timezone, offsetMinutes: Math.round(data.offset / 60) };
  } catch (err) {
    console.warn(`[geoTimezone] No se pudo resolver timezone para IP ${ip}:`, err);
    return null;
  }
}
