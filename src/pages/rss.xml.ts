import rss from '@astrojs/rss';
import { load, site, byDateDesc } from '../lib/data';
export async function GET(context: { site: URL }) {
  const news = (await load('news')).map((n) => ({ ...n.data, link: `/news/${n.id}/` }));
  const posts = (await load('blog')).map((b) => ({ ...b.data, link: `/blog/${b.id}/` }));
  const items = [...news, ...posts].sort((a, b) => b.date.getTime() - a.date.getTime());
  return rss({
    title: `${site.name} — news`,
    description: site.description,
    site: context.site,
    items: items.map((i) => ({ title: i.title, pubDate: i.date, description: i.summary, link: i.link })),
  });
}
