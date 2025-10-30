// Firebase is initialized by firebase-config.js
// db is already declared there

// Get event ID from URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventId');

let event = null;
let allRSVPs = [];
let filteredRSVPs = [];
let currentFilter = 'all';

// Load event and RSVPs
async function loadEventData() {
    if (!eventId) {
        // Show list of all events to choose from
        await showEventList();
        return;
    }
    
    try {
        // Load event details
        const eventDoc = await db.collection('events').doc(eventId).get();
        
        if (!eventDoc.exists) {
            document.getElementById('eventInfo').innerHTML = '<div class="no-data">Event not found.</div>';
            return;
        }
        
        event = { id: eventDoc.id, ...eventDoc.data() };
        
        // Load RSVPs from eventRSVPs collection
        const rsvpSnapshot = await db.collection('eventRSVPs')
            .where('eventId', '==', eventId)
            .get();
        allRSVPs = rsvpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log(`Loaded event with ${allRSVPs.length} RSVPs`);
        
        renderEventInfo();
        filterRSVPs('all');
        
    } catch (error) {
        console.error('Error loading event data:', error);
        document.getElementById('eventInfo').innerHTML = '<div class="no-data">Error loading event data.</div>';
    }
}

// Render event info
function renderEventInfo() {
    const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
    const dateStr = formatEventDate(eventDate);
    
    const yesCnt = allRSVPs.filter(r => (r.response || r.status) === 'yes').length;
    const maybeCnt = allRSVPs.filter(r => (r.response || r.status) === 'maybe').length;
    const noCnt = allRSVPs.filter(r => (r.response || r.status) === 'no').length;
    
    document.getElementById('eventTitle').textContent = event.name;
    
    document.getElementById('eventInfo').innerHTML = `
        <h2>${escapeHtml(event.name)}</h2>
        <div class="event-details">
            <div class="detail-item">
                <div class="detail-label">Date & Time</div>
                <div class="detail-value">${dateStr}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Location</div>
                <div class="detail-value">${escapeHtml(event.location)}</div>
            </div>
            ${event.capacity ? `
                <div class="detail-item">
                    <div class="detail-label">Capacity</div>
                    <div class="detail-value">${event.capacity} ${yesCnt >= event.capacity ? '(FULL)' : ''}</div>
                </div>
            ` : ''}
        </div>
        <div class="detail-item">
            <div class="detail-label">Description</div>
            <div class="detail-value">${escapeHtml(event.description)}</div>
        </div>
        <div class="stats-row">
            <div class="stat-card yes">
                <div class="stat-label">Attending</div>
                <div class="stat-value">${yesCnt}</div>
            </div>
            <div class="stat-card maybe">
                <div class="stat-label">Maybe</div>
                <div class="stat-value">${maybeCnt}</div>
            </div>
            <div class="stat-card no">
                <div class="stat-label">Not Attending</div>
                <div class="stat-value">${noCnt}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total RSVPs</div>
                <div class="stat-value">${allRSVPs.length}</div>
            </div>
        </div>
    `;
    
    // Update filter counts
    document.getElementById('countAll').textContent = allRSVPs.length;
    document.getElementById('countYes').textContent = yesCnt;
    document.getElementById('countMaybe').textContent = maybeCnt;
    document.getElementById('countNo').textContent = noCnt;
}

// Filter RSVPs
function filterRSVPs(status) {
    currentFilter = status;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === status);
    });
    
    // Filter RSVPs
    if (status === 'all') {
        filteredRSVPs = [...allRSVPs];
    } else {
        filteredRSVPs = allRSVPs.filter(rsvp => rsvp.status === status);
    }
    
    renderRSVPTable();
}

// Render RSVP table
function renderRSVPTable() {
    const container = document.getElementById('rsvpTableContainer');
    
    if (filteredRSVPs.length === 0) {
        container.innerHTML = '<div class="no-data">No RSVPs found for this filter.</div>';
        return;
    }
    
    // Sort by timestamp (newest first)
    const sorted = filteredRSVPs.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return bTime - aTime;
    });
    
    container.innerHTML = `
        <table class="rsvp-table">
            <thead>
                <tr>
                    <th>Member Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>RSVP Date</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(rsvp => {
                    const memberName = rsvp.name || 'Unknown';
                    const email = rsvp.email || 'N/A';
                    const status = rsvp.response || rsvp.status || 'unknown';
                    const rsvpDate = rsvp.submittedAt?.toDate ? rsvp.submittedAt.toDate() : (rsvp.timestamp?.toDate ? rsvp.timestamp.toDate() : new Date());
                    
                    return `
                        <tr>
                            <td>${escapeHtml(memberName)}</td>
                            <td>${escapeHtml(email)}</td>
                            <td><span class="status-badge ${status}">${status}</span></td>
                            <td>${formatDate(rsvpDate)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Export RSVPs to CSV
function exportRSVPs() {
    if (filteredRSVPs.length === 0) {
        alert('No RSVPs to export.');
        return;
    }
    
    const headers = ['Name', 'Email', 'Status', 'RSVP Date'];
    const rows = filteredRSVPs.map(rsvp => {
        const memberName = rsvp.name || 'Unknown';
        const email = rsvp.email || '';
        const status = rsvp.response || rsvp.status || 'unknown';
        const rsvpDate = rsvp.submittedAt?.toDate ? rsvp.submittedAt.toDate() : (rsvp.timestamp?.toDate ? rsvp.timestamp.toDate() : new Date());
        
        return [
            memberName,
            email,
            status,
            formatDate(rsvpDate)
        ];
    });
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `event-rsvps-${event.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper functions
function formatEventDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export HTML for social media and email
function showExportHTMLModal() {
    if (!event) {
        alert('Event data not loaded yet. Please wait and try again.');
        return;
    }
    
    const yesCount = allRSVPs.filter(r => (r.response || r.status) === 'yes').length;
    const eventDate = event.date ? new Date(event.date.seconds * 1000) : null;
    const dateStr = eventDate ? eventDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }) : 'Date TBA';
    
    // Generate beautiful HTML for social media and email
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #002855 0%, #0039a6 100%); padding: 30px; border-radius: 15px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #EAAA00 0%, #ffd700 100%); padding: 10px 25px; border-radius: 50px; margin-bottom: 15px;">
            <span style="font-size: 1.1rem; font-weight: bold; color: #002855;">🏈 UPCOMING EVENT</span>
        </div>
        <h1 style="color: white; font-size: 2rem; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${escapeHtml(event.title || 'Chapter Event')}</h1>
    </div>
    
    <!-- Event Details Card -->
    <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
        ${event.description ? `<p style="font-size: 1.05rem; line-height: 1.6; color: #333; margin: 0 0 20px 0;">${escapeHtml(event.description)}</p>` : ''}
        
        <!-- Date & Time -->
        <div style="background: linear-gradient(135deg, #002855 0%, #0d3d6f 100%); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
            <div style="color: #EAAA00; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">📅 WHEN</div>
            <div style="color: white; font-size: 1.2rem; font-weight: bold;">${dateStr}</div>
        </div>
        
        ${event.location ? `
        <!-- Location -->
        <div style="background: linear-gradient(135deg, #002855 0%, #0d3d6f 100%); padding: 20px; border-radius: 10px; margin-bottom: 15px;">
            <div style="color: #EAAA00; font-size: 0.9rem; font-weight: bold; margin-bottom: 5px;">📍 WHERE</div>
            <div style="color: white; font-size: 1.2rem; font-weight: bold;">${escapeHtml(event.location)}</div>
        </div>
        ` : ''}
        
        ${yesCount > 0 ? `
        <!-- RSVP Count -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 15px; border-radius: 10px; text-align: center; margin-top: 20px;">
            <div style="color: white; font-size: 1.1rem;">
                <strong>${yesCount}</strong> Mountaineer${yesCount !== 1 ? 's' : ''} attending! 
            </div>
        </div>
        ` : ''}
        
        <!-- Call to Action -->
        <div style="text-align: center; margin-top: 25px;">
            <p style="color: #002855; font-size: 1.1rem; font-weight: bold; margin: 0 0 15px 0;">
                Join your fellow alumni and let's go Mountaineers! 💛💙
            </p>
            <a href="https://cvawvuaa.org/events.html" style="display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #EAAA00 0%, #FFC72C 100%); color: #002855; text-decoration: none; border-radius: 30px; font-size: 1.1rem; font-weight: bold; box-shadow: 0 6px 20px rgba(234,170,0,0.4);">
                View Event & RSVP
            </a>
        </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; color: rgba(255,255,255,0.8); font-size: 0.9rem;">
        <p style="margin: 0;">Central Virginia Chapter - WVU Alumni Association</p>
        <p style="margin: 5px 0 0;">
            <a href="https://cvawvuaa.org" style="color: #EAAA00; text-decoration: none;">cvawvuaa.org</a>
        </p>
    </div>
</div>
`.trim();
    
    // Show modal
    document.getElementById('htmlPreview').innerHTML = html;
    document.getElementById('htmlCode').value = html;
    document.getElementById('htmlExportModal').style.display = 'flex';
}

function copyHTMLCode() {
    const codeTextarea = document.getElementById('htmlCode');
    codeTextarea.select();
    codeTextarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        alert('✅ HTML code copied to clipboard! You can now paste it into Facebook, Instagram, or your email.');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(codeTextarea.value).then(() => {
            alert('✅ HTML code copied to clipboard! You can now paste it into Facebook, Instagram, or your email.');
        }).catch(() => {
            alert('Please manually copy the code from the text area.');
        });
    }
}

function closeHTMLModal() {
    document.getElementById('htmlExportModal').style.display = 'none';
}

// Show event list when no eventId is provided
async function showEventList() {
    try {
        const eventsSnapshot = await db.collection('events').orderBy('date', 'desc').limit(20).get();
        const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        document.getElementById('eventInfo').innerHTML = `
            <h2 style="margin: 0 0 1rem;">Select an Event to View RSVPs</h2>
            <p style="color: #666; margin-bottom: 1.5rem;">Choose an event below to see its RSVP details:</p>
        `;
        
        const container = document.getElementById('rsvpTableContainer');
        if (events.length === 0) {
            container.innerHTML = '<div class="no-data">No events found.</div>';
            return;
        }
        
        container.innerHTML = events.map(evt => {
            const date = evt.date?.toDate ? evt.date.toDate() : new Date(evt.date);
            const dateStr = date.toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
            });
            
            return `
                <div style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #e0e0e0; cursor: pointer; transition: all 0.2s;" 
                     onclick="window.location.href='event-rsvps.html?eventId=${evt.id}'"
                     onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                     onmouseout="this.style.boxShadow='none'">
                    <h3 style="margin: 0 0 10px; color: #003057;">${escapeHtml(evt.name || evt.title || 'Untitled Event')}</h3>
                    <p style="margin: 0; color: #666;">📅 ${dateStr}</p>
                    ${evt.location ? `<p style="margin: 5px 0 0; color: #666;">📍 ${escapeHtml(evt.location)}</p>` : ''}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        document.getElementById('eventInfo').innerHTML = '<div class="no-data">Error loading events: ' + error.message + '</div>';
    }
}

// Load data on page load
loadEventData();
