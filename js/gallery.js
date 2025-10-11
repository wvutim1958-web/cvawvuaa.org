// Gallery renderer with optional year filter and lightbox
(function(){
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
    const m = (item.src||'').match(/\/gallery\/(\d{4})\//); if(m) return m[1];
    return 'Unknown';
  }

  // Lightbox functionality
  function createLightbox(){
    const lightbox = el('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;cursor:pointer;align-items:center;justify-content:center;';
    
    const img = el('img');
    img.id = 'lightbox-img';
    img.style.cssText = 'max-width:90%;max-height:90vh;object-fit:contain;border-radius:8px;';
    
    const close = el('div', {}, '×');
    close.style.cssText = 'position:absolute;top:20px;right:40px;color:white;font-size:60px;font-weight:bold;cursor:pointer;user-select:none;';
    close.title = 'Close (Esc)';
    
    lightbox.appendChild(img);
    lightbox.appendChild(close);
    document.body.appendChild(lightbox);
    
    // Close on click
    lightbox.addEventListener('click', () => closeLightbox());
    close.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
    
    // Close on Esc key
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
    });
    
    return lightbox;
  }

  function openLightbox(src){
    const lightbox = document.getElementById('lightbox') || createLightbox();
    const img = document.getElementById('lightbox-img');
    img.src = src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    const lightbox = document.getElementById('lightbox');
    if(lightbox){
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function cardFor(item){
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
        openLightbox(item.src);
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
    filtered.forEach(it => grid.appendChild(cardFor(it)));
    if(!filtered.length){
      grid.appendChild(el('div', {class:'small', style:'color:#8a5300'}, 'No items for the selected year.'));
    }
  }

  document.addEventListener('DOMContentLoaded', render);
})();
