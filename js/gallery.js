// Gallery renderer with optional year filter and lightbox
(function(){
  let currentImages = [];
  let currentIndex = 0;

  async function loadJSON(){
    const urls = ['content/gallery.json', '/content/gallery.json'];
    for(const u of urls){
      try { const r = await fetch(u, {cache:'no-store'}); if(r.ok) return r.json(); } catch{}
    }
    return [];
  }

  function el(tag, attrs={}, html=""){
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => { if(v!=null) e.setAttribute(k,v); });
    if(html) e.innerHTML = html;
    return e;
  }

  function yearOf(item){
    if(item.year) return String(item.year);
    if(item.date && /\d{4}/.test(item.date)) return item.date.slice(0,4);
    // Check for archive folder first
    if((item.src||'').includes('/gallery/archive/')) return 'Archive';
    // Then check for 4-digit year
    const m = (item.src||'').match(/\/gallery\/(\d{4})\//); if(m) return m[1];
    return 'Unknown';
  }

  // Lightbox functionality with navigation
  function createLightbox(){
    const lightbox = el('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;align-items:center;justify-content:center;';
    
    const img = el('img');
    img.id = 'lightbox-img';
    img.style.cssText = 'max-width:80%;max-height:90vh;object-fit:contain;border-radius:8px;';
    img.addEventListener('click', (e) => e.stopPropagation());
    
    const close = el('div', {}, '×');
    close.style.cssText = 'position:absolute;top:20px;right:40px;color:white;font-size:60px;font-weight:bold;cursor:pointer;user-select:none;z-index:10001;';
    close.title = 'Close (Esc)';
    
    const prevBtn = el('div', {}, '‹');
    prevBtn.id = 'lightbox-prev';
    prevBtn.style.cssText = 'position:absolute;left:20px;top:50%;transform:translateY(-50%);color:white;font-size:80px;font-weight:bold;cursor:pointer;user-select:none;padding:20px;z-index:10001;transition:opacity 0.2s;';
    prevBtn.title = 'Previous (←)';
    
    const nextBtn = el('div', {}, '›');
    nextBtn.id = 'lightbox-next';
    nextBtn.style.cssText = 'position:absolute;right:20px;top:50%;transform:translateY(-50%);color:white;font-size:80px;font-weight:bold;cursor:pointer;user-select:none;padding:20px;z-index:10001;transition:opacity 0.2s;';
    nextBtn.title = 'Next (→)';
    
    const counter = el('div');
    counter.id = 'lightbox-counter';
    counter.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:white;font-size:18px;background:rgba(0,0,0,0.5);padding:10px 20px;border-radius:20px;';
    
    lightbox.appendChild(img);
    lightbox.appendChild(close);
    lightbox.appendChild(prevBtn);
    lightbox.appendChild(nextBtn);
    lightbox.appendChild(counter);
    document.body.appendChild(lightbox);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) closeLightbox();
    });
    close.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
    
    // Navigation
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });
    
    // Hover effects
    prevBtn.addEventListener('mouseenter', () => prevBtn.style.opacity = '0.7');
    prevBtn.addEventListener('mouseleave', () => prevBtn.style.opacity = '1');
    nextBtn.addEventListener('mouseenter', () => nextBtn.style.opacity = '0.7');
    nextBtn.addEventListener('mouseleave', () => nextBtn.style.opacity = '1');
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if(lightbox.style.display !== 'flex') return;
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowLeft') showPrevImage();
      if(e.key === 'ArrowRight') showNextImage();
    });
    
    return lightbox;
  }

  function updateCounter(){
    const counter = document.getElementById('lightbox-counter');
    if(counter && currentImages.length > 0){
      counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    }
  }

  function showPrevImage(){
    if(currentImages.length === 0) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    const img = document.getElementById('lightbox-img');
    img.src = currentImages[currentIndex];
    updateCounter();
  }

  function showNextImage(){
    if(currentImages.length === 0) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    const img = document.getElementById('lightbox-img');
    img.src = currentImages[currentIndex];
    updateCounter();
  }

  function openLightbox(src, images){
    currentImages = images || [src];
    currentIndex = currentImages.indexOf(src);
    if(currentIndex === -1) currentIndex = 0;
    
    const lightbox = document.getElementById('lightbox') || createLightbox();
    const img = document.getElementById('lightbox-img');
    img.src = currentImages[currentIndex];
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateCounter();
    
    // Hide arrows if only one image
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    if(prevBtn && nextBtn){
      const hideArrows = currentImages.length <= 1;
      prevBtn.style.display = hideArrows ? 'none' : 'block';
      nextBtn.style.display = hideArrows ? 'none' : 'block';
    }
  }

  function closeLightbox(){
    const lightbox = document.getElementById('lightbox');
    if(lightbox){
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function cardFor(item, allImages){
    const fig = el('figure'); 
    fig.className = 'card'; 
    fig.style.padding = '8px';
    
    if(item.type === 'video'){
      const v = el('video', {controls:'', playsinline:'', preload:'metadata', style:'width:100%;max-height:400px;object-fit:contain;border-radius:8px;background:#f5f5f5'});
      if(item.poster) v.setAttribute('poster', item.poster);
      const src = el('source', {src:item.src, type:'video/mp4'});
      v.appendChild(src); 
      fig.appendChild(v);
    } else {
      const link = el('a');
      link.href = '#';
      link.style.cssText = 'cursor:pointer;display:block;';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(item.src, allImages);
      });
      
      const img = el('img', {src:item.src, alt:item.alt||''});
      img.style.cssText = 'width:100%;height:auto;border-radius:8px;display:block;transition:opacity 0.2s;';
      img.title = 'Click to enlarge';
      
      // Hover effect
      link.addEventListener('mouseenter', () => img.style.opacity = '0.85');
      link.addEventListener('mouseleave', () => img.style.opacity = '1');
      
      link.appendChild(img);
      fig.appendChild(link);
    }
    
    const cap = el('figcaption'); 
    cap.style.marginTop = '.5rem';
    cap.innerHTML = `
      <div><strong>${item.caption||''}</strong></div>
      <div class="small" style="color:#5b6777">${[item.credit||'', item.date||''].filter(Boolean).join(' • ')}</div>
    `;
    fig.appendChild(cap);
    return fig;
  }

  function buildYearFilter(years, selected){
    const container = document.getElementById('gallery-filter');
    if(!container) return;
    container.innerHTML = '';
    const select = el('select', {id:'year-select', style:'padding:.5rem;border:1px solid var(--border-color);border-radius:6px'});
    select.appendChild(el('option', {value:''}, 'All years'));
    years.forEach(y => select.appendChild(el('option', {value:String(y), selected: String(y)===String(selected) ? '' : null}, String(y))));
    select.addEventListener('change', () => {
      const y = select.value; const url = new URL(location.href); if(y) url.searchParams.set('year', y); else url.searchParams.delete('year'); location.href = url.toString();
    });
    container.appendChild(select);
  }

  async function render(){
    const grid = document.getElementById('gallery-grid'); if(!grid) return;
    grid.innerHTML = '';
    const params = new URLSearchParams(location.search);
    const wantYear = params.get('year');
    let items = await loadJSON();
    if(!Array.isArray(items)) items = [];
    const years = Array.from(new Set(items.map(yearOf))).filter(y=>y && y!=='Unknown').sort((a,b)=>b.localeCompare(a));
    buildYearFilter(years, wantYear);
    // Also render quick links if container present
    const links = document.getElementById('year-links');
    if(links){
      links.innerHTML='';
      years.forEach(y => {
        const a = el('a',{href:`?year=${y}`, class:'small', style:'margin-right:8px'}, y);
        links.appendChild(a);
      });
    }
    const filtered = wantYear ? items.filter(it => yearOf(it)===wantYear) : items;
    // Get all image sources for lightbox navigation
    const allImages = filtered.filter(it => it.type !== 'video').map(it => it.src);
    filtered.forEach(it => grid.appendChild(cardFor(it, allImages)));
    if(!filtered.length){
      grid.appendChild(el('div', {class:'small', style:'color:#8a5300'}, 'No items for the selected year.'));
    }
  }

  document.addEventListener('DOMContentLoaded', render);
})();
