(function(){
  console.log('TaiStat Hotels loaded');

  async function loadSerpImages() {
    const query = document.body.getAttribute('data-serp-query') || '';
    if (!query) return;

    try {
      // Use backend proxy to keep API key server-side
      const url = `/api/images?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('SERPAPI request failed');
      const data = await res.json();
      const images = (data.images_results || []).map(i => i.original || i.thumbnail).filter(Boolean);
      if (!images.length) return;

      // Use the first 10 images total
      const top = images.slice(0, 10);

      // Fill Featured Rooms (first 3 images)
      const roomImgs = document.querySelectorAll('.rooms .card img');
      roomImgs.forEach((img, i) => {
        if (top[i]) img.src = top[i];
      });

      // Rebuild Gallery with remaining images (next 7)
      const galleryGrid = document.querySelector('.gallery .grid-4');
      if (galleryGrid) {
        const remaining = top.slice(3); // up to 7
        galleryGrid.innerHTML = '';
        remaining.forEach(src => {
          const el = document.createElement('img');
          el.src = src;
          el.alt = 'Hotel image';
          galleryGrid.appendChild(el);
        });
      }
    } catch (err) {
      console.warn('SERP image load failed:', err);
    }
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { setupHamburger(); });
  } else {
    setupHamburger();
  }

  function setupHamburger(){
    const btn = document.querySelector('.hamburger');
    const nav = document.getElementById('navmenu');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      btn.setAttribute('aria-expanded', String(!open));
    });
  }
})();

