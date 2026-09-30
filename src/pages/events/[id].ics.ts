import { load, site } from '../../lib/data';
import { ics } from '../../lib/ics';
export async function getStaticPaths() {
  return (await load('events')).map((e) => ({ params: { id: e.id }, props: { event: e } }));
}
export async function GET({ props, site: url }: { props: any; site: URL }) {
  return ics([props.event], url, `${site.name} events`);
}
