import { publications, bibtex } from '../lib/data';
export async function GET() {
  const body = (await publications()).map(bibtex).join('\n\n') + '\n';
  return new Response(body, { headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' } });
}
