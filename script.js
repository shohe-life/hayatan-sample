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
