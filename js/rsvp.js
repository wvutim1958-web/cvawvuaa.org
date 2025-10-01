// RSVP helper: local JSON store + admin view
(function(){
  const FORM_ID = 'rsvp-form';
  const STORAGE_KEY = 'cvcwvuaa-rsvps';

  function readLocal(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function writeLocal(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function nowISO(){ return new Date().toISOString(); }

  function getFormData(form){
    const data = Object.fromEntries(new FormData(form).entries());
    // normalize
    return {
      ts: nowISO(),
      name: (data.Name||'').trim(),
      email: (data.Email||'').trim(),
      game: (data.Game||'').trim(),
      count: Number(data.Count||1),
      requests: (data.Requests||'').trim(),
      eventId: (data.eventId||'').trim()
    };
  }

  function renderTable(){
    const admin = document.getElementById('rsvp-admin');
    if(!admin) return;
    const params = new URLSearchParams(location.search);
    const show = params.get('admin') === '1';
    admin.style.display = show ? '' : 'none';
    if(!show) return;

  const tbody = document.querySelector('#rsvp-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
  const table = document.getElementById('rsvp-table');
  if(table){ table.style.border = '1px solid var(--border-color)'; table.style.borderRadius = '8px'; }
  let rows = readLocal();
  const filterEvent = params.get('eventId');
  if(filterEvent){ rows = rows.filter(r => (r.eventId||'') === filterEvent); }
    rows.sort((a,b) => (a.ts < b.ts ? 1 : -1));
    for(const r of rows){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${new Date(r.ts).toLocaleString()}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${r.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)"><a href="mailto:${r.email}">${r.email}</a></td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${r.game}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${r.count}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${r.requests}</td>`;
      tbody.appendChild(tr);
    }
  }

  function bindAdminControls(){
    const exportBtn = document.getElementById('export-json');
    const exportCsvBtn = document.getElementById('export-csv');
    const exportEmailsBtn = document.getElementById('export-emails');
    const importInput = document.getElementById('import-json');
    const clearBtn = document.getElementById('clear-local');
    if(exportBtn){
      exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(readLocal(), null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `rsvps-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      });
    }
    if(exportEmailsBtn){
      exportEmailsBtn.addEventListener('click', () => {
        const params = new URLSearchParams(location.search);
        const filterEvent = params.get('eventId');
        let rows = readLocal();
        if(filterEvent){ rows = rows.filter(r => (r.eventId||'') === filterEvent); }
        const emails = Array.from(new Set(rows.map(r => (r.email||'').trim()).filter(Boolean)));
        const blob = new Blob([emails.join('\n')], {type:'text/plain'});
        const url = URL.createObjectURL(blob);
        const a=document.createElement('a'); a.href=url; a.download='emails.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      });
    }
    if(exportCsvBtn){
      exportCsvBtn.addEventListener('click', () => {
        const rows = readLocal();
        const cols = ['ts','name','email','game','count','requests'];
        const header = cols.join(',');
        const toCsv = v => '"'+String(v ?? '').replaceAll('"','""')+'"';
        const body = rows.map(r => cols.map(c => toCsv(r[c])).join(',')).join('\n');
        const csv = header + '\n' + body;
        const blob = new Blob([csv], {type:'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download='rsvps.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      });
    }
    if(importInput){
      importInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if(!file) return;
        const text = await file.text();
        try{
          const data = JSON.parse(text);
          if(Array.isArray(data)){
            writeLocal(data);
            renderTable();
            alert('Imported RSVPs from JSON');
          } else alert('Invalid JSON format');
        }catch(err){
          alert('Error parsing JSON');
        }
      });
    }
    if(clearBtn){
      clearBtn.addEventListener('click', () => {
        if(confirm('Clear local RSVPs from this browser?')){
          writeLocal([]);
          renderTable();
        }
      });
    }
  }

  function attach(){
    // Populate game from query param
    const params = new URLSearchParams(location.search);
    const g = params.get('game');
    if(g){ const input = document.getElementById('game'); input && (input.value = g); }

    const form = document.getElementById(FORM_ID);
    if(!form) return;

    form.addEventListener('submit', (e) => {
      // Basic validation; let browser handle required fields
      const record = getFormData(form);
      // Also capture eventId from URL if present
      const params = new URLSearchParams(location.search);
      const eid = params.get('eventId');
      if(eid){ record.eventId = eid; }
      // Save locally (non-blocking)
      const list = readLocal(); list.push(record); writeLocal(list);
      // continue to FormSubmit for email delivery
    });

    bindAdminControls();
    renderTable();
  }

  document.addEventListener('DOMContentLoaded', attach);
})();
