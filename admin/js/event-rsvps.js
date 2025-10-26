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
        document.getElementById('eventInfo').innerHTML = '<div class="no-data">No event ID provided.</div>';
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
        
        // Load RSVPs with member details
        const rsvpSnapshot = await db.collection('events').doc(eventId).collection('rsvps').get();
        const rsvpData = rsvpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get all member details
        if (rsvpData.length > 0) {
            const memberIds = rsvpData.map(rsvp => rsvp.memberId);
            const membersSnapshot = await db.collection('members').where(firebase.firestore.FieldPath.documentId(), 'in', memberIds).get();
            const membersMap = {};
            membersSnapshot.docs.forEach(doc => {
                membersMap[doc.id] = { id: doc.id, ...doc.data() };
            });
            
            allRSVPs = rsvpData.map(rsvp => ({
                ...rsvp,
                member: membersMap[rsvp.memberId] || null
            }));
        } else {
            allRSVPs = [];
        }
        
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
    
    const yesCnt = allRSVPs.filter(r => r.status === 'yes').length;
    const maybeCnt = allRSVPs.filter(r => r.status === 'maybe').length;
    const noCnt = allRSVPs.filter(r => r.status === 'no').length;
    
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
                    const member = rsvp.member;
                    const memberName = member ? `${member.firstName} ${member.lastName}` : 'Unknown Member';
                    const email = member?.email || 'N/A';
                    const rsvpDate = rsvp.timestamp?.toDate ? rsvp.timestamp.toDate() : new Date(rsvp.timestamp);
                    
                    return `
                        <tr>
                            <td>${escapeHtml(memberName)}</td>
                            <td>${escapeHtml(email)}</td>
                            <td><span class="status-badge ${rsvp.status}">${rsvp.status}</span></td>
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
        const member = rsvp.member;
        const memberName = member ? `${member.firstName} ${member.lastName}` : 'Unknown';
        const email = member?.email || '';
        const rsvpDate = rsvp.timestamp?.toDate ? rsvp.timestamp.toDate() : new Date(rsvp.timestamp);
        
        return [
            memberName,
            email,
            rsvp.status,
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

// Load data on page load
loadEventData();
