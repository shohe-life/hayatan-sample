// Cloudflare Pages の Advanced mode。/api/blog だけここで処理し、それ以外は通常の静的ファイルを返す。
// functions/ フォルダはダッシュボードのドラッグ＆ドロップ公開では動かないため、_worker.js 1本にしている
// （https://developers.cloudflare.com/pages/get-started/direct-upload/ ）。
// アメブロのRSSはブラウザから直接読めない（CORS不可）ため、ここでRSSを取得してJSONで返す。
const FEED_URL = 'https://rssblog.ameba.jp/hayatan-kind/rss20.xml';
const MAX_ITEMS = 3;
const EXCERPT_LEN = 70;

async function handleBlog() {
  try {
    const res = await fetch(FEED_URL, { cf: { cacheTtl: 1800, cacheEverything: true } });
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const posts = parseFeed(await res.text()).slice(0, MAX_ITEMS);
    return json({ posts }, 200, 'public, max-age=1800');
  } catch (e) {
    return json({ posts: [] }, 502, 'no-store');
  }
}

function json(body, status, cacheControl) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cacheControl },
  });
}

function parseFeed(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map((item) => {
    // 写真は返さない。記事内の画像は毎回同じメルマガ告知バナーで、サムネにならないため
    const html = pick(item, 'description');
    return {
      title: decode(pick(item, 'title')),
      url: pick(item, 'link'),
      date: pick(item, 'pubDate'),
      excerpt: excerpt(html),
    };
  }).filter((p) => p.title && /^https:\/\/ameblo\.jp\//.test(p.url));
}

function pick(item, tag) {
  const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  return m[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();
}

function excerpt(html) {
  const text = decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return text.length > EXCERPT_LEN ? text.slice(0, EXCERPT_LEN) + '…' : text;
}

function decode(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, '&');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/blog' && request.method === 'GET') return handleBlog();
    return env.ASSETS.fetch(request);
  },
};
