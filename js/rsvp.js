// RSVP helper: local JSON store + admin view
(function(){
  const FORM_ID = 'rsvp-form';
  const STORAGE_KEY = 'rsvps';

  function readLocal(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }
  function writeLocal(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  function nowISO(){ return new Date().toISOString(); }

  function getFormData(form){
    const data = Object.fromEntries(new FormData(form).entries());
    // normalize - handle both old and new field names
    return {
      timestamp: nowISO(),
      Name: (data.Name||'').trim(),
      Email: (data.Email||'').trim(),
      Event: (data.Event||data.Game||'').trim(),
      Attending: (data.Attending||'').trim(),
      Number_of_Guests: Number(data.Number_of_Guests||data.guests||0),
      Comments: (data.Comments||data.comments||data.Requests||'').trim(),
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
    rows.sort((a,b) => ((a.timestamp||a.ts) < (b.timestamp||b.ts) ? 1 : -1));
    for(const r of rows){
      const tr = document.createElement('tr');
      const timestamp = r.timestamp || r.ts || '';
      const name = r.Name || r.name || '';
      const email = r.Email || r.email || '';
      const event = r.Event || r.game || '';
      const attending = r.Attending || '';
      const guests = r.Number_of_Guests || r.count || 0;
      const comments = r.Comments || r.requests || '';
      
      tr.innerHTML = `
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${timestamp ? new Date(timestamp).toLocaleString() : ''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${attending}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${guests}</td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--border-color)">${comments}</td>`;
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
        const emails = Array.from(new Set(rows.map(r => ((r.Email||r.email)||'').trim()).filter(Boolean)));
        const blob = new Blob([emails.join('\n')], {type:'text/plain'});
        const url = URL.createObjectURL(blob);
        const a=document.createElement('a'); a.href=url; a.download='emails.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      });
    }
    if(exportCsvBtn){
      exportCsvBtn.addEventListener('click', () => {
        const rows = readLocal();
        const header = 'Timestamp,Name,Attending,Guests,Comments,Event';
        const toCsv = v => '"'+String(v ?? '').replaceAll('"','""')+'"';
        const body = rows.map(r => {
          const timestamp = r.timestamp || r.ts || '';
          const name = r.Name || r.name || '';
          const attending = r.Attending || '';
          const guests = r.Number_of_Guests || r.count || 0;
          const comments = r.Comments || r.requests || '';
          const event = r.Event || r.game || '';
          return [timestamp, name, attending, guests, comments, event].map(toCsv).join(',');
        }).join('\n');
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
    const form = document.getElementById(FORM_ID);
    if(!form) return;

    form.addEventListener('submit', (e) => {
      // Basic validation; let browser handle required fields
      const record = getFormData(form);
      // Also capture eventId from URL if present
      const params = new URLSearchParams(location.search);
      const eid = params.get('event') || params.get('eventId');
      if(eid){ record.eventId = eid; }
      // Save locally (non-blocking)
      const list = readLocal(); list.push(record); writeLocal(list);
      console.log('RSVP saved locally:', record);
      // continue to FormSubmit for email delivery
    });

    bindAdminControls();
    renderTable();
  }

  document.addEventListener('DOMContentLoaded', attach);
})();
