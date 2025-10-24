// Firebase is already initialized in firebase-config.js
// db is already available globally

let allEvents = [];

// Load all events
async function loadEvents() {
    try {
        const snapshot = await db.collection('events').orderBy('date', 'desc').get();
        
        allEvents = await Promise.all(snapshot.docs.map(async doc => {
            const event = {
                id: doc.id,
                ...doc.data()
            };
            
            // Load RSVP counts
            const rsvpSnapshot = await db.collection('events').doc(doc.id).collection('rsvps').get();
            const rsvps = rsvpSnapshot.docs.map(rsvpDoc => rsvpDoc.data());
            
            event.rsvpCounts = {
                yes: rsvps.filter(r => r.status === 'yes').length,
                no: rsvps.filter(r => r.status === 'no').length,
                maybe: rsvps.filter(r => r.status === 'maybe').length,
                total: rsvps.length
            };
            
            return event;
        }));
        
        console.log(`Loaded ${allEvents.length} events`);
        renderEvents();
        
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('eventsContainer').innerHTML = 
            '<div class="no-data">Error loading events. Please refresh the page.</div>';
    }
}

// Render events
function renderEvents() {
    const container = document.getElementById('eventsContainer');
    
    if (allEvents.length === 0) {
        container.innerHTML = '<div class="no-data">No events yet. Create your first event to get started!</div>';
        return;
    }
    
    const now = new Date();
    
    container.innerHTML = '<div class="events-grid">' + allEvents.map(event => {
        const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
        const isPast = eventDate < now;
        const dateStr = formatEventDate(eventDate);
        
        return `
            <div class="event-card ${isPast ? 'past' : 'upcoming'}">
                <div class="event-header">
                    <div>
                        <h3 class="event-title">${escapeHtml(event.name)}</h3>
                        <div class="event-date">📅 ${dateStr}</div>
                        <div class="event-location">📍 ${escapeHtml(event.location)}</div>
                    </div>
                    <span style="font-size: 0.85rem; color: ${isPast ? '#6b7280' : '#10b981'}; font-weight: 600;">
                        ${isPast ? 'PAST EVENT' : 'UPCOMING'}
                    </span>
                </div>
                
                <div class="event-description">${escapeHtml(event.description)}</div>
                
                ${event.capacity ? `<div style="color: #666; font-size: 0.9rem;">Capacity: ${event.capacity}</div>` : ''}
                
                <div class="event-stats">
                    <div class="stat-item">
                        <div class="stat-label">Yes</div>
                        <div class="stat-value yes">${event.rsvpCounts.yes}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Maybe</div>
                        <div class="stat-value maybe">${event.rsvpCounts.maybe}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">No</div>
                        <div class="stat-value no">${event.rsvpCounts.no}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Total RSVPs</div>
                        <div class="stat-value">${event.rsvpCounts.total}</div>
                    </div>
                </div>
                
                <div class="event-actions">
                    <button class="btn-small btn-view" onclick="viewRSVPs('${event.id}')">👥 View RSVPs</button>
                    <button class="btn-small btn-reminders" onclick="sendReminders('${event.id}')">📧 Send Reminders</button>
                    <button class="btn-small btn-edit" onclick="editEvent('${event.id}')">✏️ Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteEvent('${event.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('') + '</div>';
}

// Open create modal
function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Create Event';
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    document.getElementById('eventModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('eventModal').classList.remove('active');
}

// Save event
async function saveEvent(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('eventId').value;
    const name = document.getElementById('eventName').value;
    const dateStr = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const capacity = document.getElementById('eventCapacity').value;
    
    const eventData = {
        name,
        date: firebase.firestore.Timestamp.fromDate(new Date(dateStr)),
        location,
        description,
        capacity: capacity ? parseInt(capacity) : null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (eventId) {
            // Update existing event
            await db.collection('events').doc(eventId).update(eventData);
            alert('Event updated successfully!');
        } else {
            // Create new event
            eventData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('events').add(eventData);
            alert('Event created successfully!');
        }
        
        closeModal();
        loadEvents();
        
    } catch (error) {
        console.error('Error saving event:', error);
        alert('Error saving event. Please try again.');
    }
}

// Edit event
async function editEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('eventId').value = eventId;
    document.getElementById('eventName').value = event.name;
    
    const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
    const dateStr = eventDate.toISOString().slice(0, 16);
    document.getElementById('eventDate').value = dateStr;
    
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventCapacity').value = event.capacity || '';
    
    document.getElementById('eventModal').classList.add('active');
}

// Delete event
async function deleteEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const confirmed = confirm(`Are you sure you want to delete "${event.name}"?\n\nThis will also delete all RSVPs for this event.`);
    if (!confirmed) return;
    
    try {
        // Delete all RSVPs first
        const rsvpSnapshot = await db.collection('events').doc(eventId).collection('rsvps').get();
        const batch = db.batch();
        rsvpSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        // Delete event
        await db.collection('events').doc(eventId).delete();
        
        alert('Event deleted successfully!');
        loadEvents();
        
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
    }
}

// View RSVPs
function viewRSVPs(eventId) {
    window.location.href = `event-rsvps.html?eventId=${eventId}`;
}

// Send reminders
async function sendReminders(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    try {
        // Get all members who said "yes" or "maybe"
        const rsvpSnapshot = await db.collection('events').doc(eventId).collection('rsvps').get();
        const confirmedRsvps = rsvpSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(rsvp => rsvp.status === 'yes' || rsvp.status === 'maybe');
        
        if (confirmedRsvps.length === 0) {
            alert('No confirmed RSVPs to send reminders to.');
            return;
        }
        
        // Get member details
        const memberIds = confirmedRsvps.map(rsvp => rsvp.memberId);
        const membersSnapshot = await db.collection('members').where(firebase.firestore.FieldPath.documentId(), 'in', memberIds).get();
        const members = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const emails = members.filter(m => m.email).map(m => m.email);
        
        if (emails.length === 0) {
            alert('No members have email addresses on file.');
            return;
        }
        
        const eventDate = event.date.toDate ? event.date.toDate() : new Date(event.date);
        const dateStr = formatEventDate(eventDate);
        
        const subject = encodeURIComponent(`Reminder: ${event.name}`);
        const body = encodeURIComponent(
            `Dear Member,\n\n` +
            `This is a friendly reminder about the upcoming event:\n\n` +
            `Event: ${event.name}\n` +
            `Date: ${dateStr}\n` +
            `Location: ${event.location}\n\n` +
            `${event.description}\n\n` +
            `We look forward to seeing you there!\n\n` +
            `Let's Go! Mountaineers!!!!\n\n` +
            `Central Virginia Chapter\n` +
            `West Virginia University Alumni Association`
        );
        
        const mailtoLink = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
        
        // Log communications
        for (const member of members.filter(m => m.email)) {
            await db.collection('communications').add({
                memberId: member.id,
                type: 'reminder',
                details: `Event reminder sent: ${event.name}`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                sentBy: 'Admin User',
                method: 'Email',
                metadata: {
                    eventId: eventId,
                    eventName: event.name,
                    eventDate: event.date
                }
            });
        }
        
        console.log(`Logged ${members.filter(m => m.email).length} event reminder communications`);
        
    } catch (error) {
        console.error('Error sending reminders:', error);
        alert('Error sending reminders. Please try again.');
    }
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load events on page load
loadEvents();

// Close modal when clicking outside
document.getElementById('eventModal').addEventListener('click', (e) => {
    if (e.target.id === 'eventModal') {
        closeModal();
    }
});
