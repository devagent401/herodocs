import { getCollection } from 'astro:content';

const clean = (s: string) =>
  s
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function GET() {
  const docs = await getCollection('docs');
  const index = docs.map((d) => {
    const body = d.body ?? '';
    const headings = [...body.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => clean(m[1]));
    const slug = d.id.replace(/\/?index$/, '');
    return {
      title: d.data.title,
      description: d.data.description ?? '',
      url: `/${slug}${slug ? '/' : ''}`,
      section: slug.split('/')[0] ?? '',
      headings,
      text: clean(body).slice(0, 6000),
    };
  });
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
