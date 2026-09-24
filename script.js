new Splide('.kindle-carousel', {
  type: 'loop',
  perPage: 3,
  gap: '24px',
  focus: 'center',
  autoplay: true,
  interval: 4000,
  pauseOnHover: true,
  arrows: true,
  pagination: true,
  breakpoints: {
    640: { perPage: 1, gap: '16px' },
    1000: { perPage: 2, gap: '20px' },
  },
}).mount();

// アメブロ最新記事（/api/blog は Cloudflare Pages Functions）
(async () => {
  const list = document.querySelector('.blog-list');
  if (!list) return;
  try {
    const res = await fetch('/api/blog');
    if (!res.ok) throw new Error(res.status);
    const { posts } = await res.json();
    if (!posts.length) throw new Error('empty');
    list.innerHTML = '';
    posts.forEach((p) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'blog-card';
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener';
      const body = document.createElement('div');
      body.className = 'blog-body';
      const d = new Date(p.date);
      const time = document.createElement('time');
      time.dateTime = d.toISOString();
      time.textContent = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
      const h3 = document.createElement('h3');
      h3.textContent = p.title;
      const text = document.createElement('p');
      text.textContent = p.excerpt;
      body.append(time, h3, text);
      a.appendChild(body);
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch (e) {
    // 取得できなければカード欄ごと隠し、下の「ブログを見る」ボタンだけ残す
    list.hidden = true;
  }
})();
