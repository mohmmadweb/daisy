import { events, site } from '../lib/data';
import { ics } from '../lib/ics';
export async function GET(context: { site: URL }) {
  return ics((await events()).all, context.site, `${site.name} events`);
}
