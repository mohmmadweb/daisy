import type { CollectionEntry } from 'astro:content';
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => `\\${m}`);
export function ics(events: CollectionEntry<'events'>[], site: URL, name: string) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${name}//Events//EN`, 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(name)}`, 'X-WR-TIMEZONE:Asia/Tehran'];
  for (const e of events) {
    const d = e.data;
    const end = d.end ?? new Date(d.date.getTime() + 3600e3);
    const url = new URL(`/events/${e.id}/`, site).toString();
    lines.push('BEGIN:VEVENT', `UID:${e.id}@${site.host}`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(d.date)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(d.title)}`, `URL:${url}`, `DESCRIPTION:${esc([d.speaker && `Speaker: ${d.speaker}${d.affiliation ? `, ${d.affiliation}` : ''}`, d.online && `Online: ${d.online}`, url].filter(Boolean).join('\n'))}`);
    if (d.location) lines.push(`LOCATION:${esc(d.location)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.join('\r\n') + '\r\n', { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
