(function(){
  const el = (t,a={},h='')=>{ const e=document.createElement(t); Object.entries(a).forEach(([k,v])=>{if(v!=null)e.setAttribute(k,v)}); if(h) e.innerHTML=h; return e; };
  async function load(){
    const urls=['/newsletters/posts.json','newsletters/posts.json'];
    for(const u of urls){ try{ const r=await fetch(u,{cache:'no-store'}); if(r.ok) return r.json(); }catch(e){} }
    return [];
  }
  async function render(){
    const list = document.getElementById('posts'); if(!list) return;
    let posts = await load(); if(!Array.isArray(posts)) posts=[];
    posts.sort((a,b)=> (a.date<b.date?1:-1));
    if(!posts.length){ list.appendChild(el('div',{class:'small',style:'color:#8a5300'},'Add items in newsletters/posts.json')); return; }
    posts.forEach(p=>{
      const card = el('article',{class:'card post-item'});
      const title = el('h3',{}, `<a href="${p.url||'#'}">${p.title||'Untitled'}</a>`);
      const meta = el('div',{class:'small',style:'color:#5b6777'}, new Date(p.date).toLocaleDateString());
      const sum = el('p',{}, p.summary||'');
      const attachments = p.attachment? el('div',{}, `<a class="btn" href="${p.attachment}">Attachment</a>`): null;
      card.appendChild(title); card.appendChild(meta); card.appendChild(sum); if(attachments) card.appendChild(attachments);
      list.appendChild(card);
    })
  }
  document.addEventListener('DOMContentLoaded', render);
})();