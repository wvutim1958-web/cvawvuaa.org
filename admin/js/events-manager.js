// Events Manager - Create and manage chapter events with RSVP tracking

let currentEventId = null;
let allEvents = [];

// Load events on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadEvents();
    displayEvents();
});

// Load all events from Firestore
async function loadEvents() {
    try {
        const eventsSnapshot = await db.collection('events')
            .orderBy('date', 'asc')
            .get();
        
        allEvents = [];
        eventsSnapshot.forEach(doc => {
            const event = doc.data();
            allEvents.push({
                id: doc.id,
                ...event,
                date: event.date.toDate() // Convert Firestore timestamp to JS Date
            });
        });
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Error loading events');
    }
}

// Display all events
function displayEvents() {
    const container = document.getElementById('eventsList');
    
    if (allEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p>No events yet. Create your first event!</p>
            </div>
        `;
        return;
    }
    
    const now = new Date();
    const upcoming = allEvents.filter(e => e.date >= now);
    const past = allEvents.filter(e => e.date < now);
    
    container.innerHTML = '';
    
    // Display upcoming events
    if (upcoming.length > 0) {
        const upcomingHeader = document.createElement('h3');
        upcomingHeader.textContent = '🔜 Upcoming Events';
        upcomingHeader.style.marginBottom = '1rem';
        container.appendChild(upcomingHeader);
        
        upcoming.forEach(event => {
            container.appendChild(createEventCard(event, false));
        });
    }
    
    // Display past events
    if (past.length > 0) {
        const pastHeader = document.createElement('h3');
        pastHeader.textContent = '📚 Past Events';
        pastHeader.style.marginTop = '2rem';
        pastHeader.style.marginBottom = '1rem';
        container.appendChild(pastHeader);
        
        past.slice(0, 10).forEach(event => { // Show only last 10 past events
            container.appendChild(createEventCard(event, true));
        });
    }
}

// Create event card element
function createEventCard(event, isPast) {
    const card = document.createElement('div');
    card.className = `event-card ${isPast ? 'past' : ''}`;
    
    const rsvpCount = event.rsvps ? event.rsvps.length : 0;
    const capacityText = event.capacity ? ` / ${event.capacity}` : '';
    
    card.innerHTML = `
        <div class="event-header">
            <div>
                <div class="event-title">${event.title}</div>
                <span class="event-status ${isPast ? 'status-past' : 'status-upcoming'}">
                    ${isPast ? 'Past' : 'Upcoming'}
                </span>
            </div>
        </div>
        <div class="event-details">
            <p>📅 ${formatEventDate(event.date)} at ${formatEventTime(event.date)}</p>
            <p>📍 ${event.location}</p>
            ${event.description ? `<p>📝 ${event.description}</p>` : ''}
        </div>
        <div class="rsvp-section">
            <div class="rsvp-count">👥 ${rsvpCount} RSVP${rsvpCount !== 1 ? 's' : ''}${capacityText}</div>
            ${rsvpCount > 0 ? `
                <div class="rsvp-list">
                    ${event.rsvps.map(rsvp => `<span class="rsvp-badge">${rsvp.name}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="event-actions">
            <button class="btn btn-primary btn-small" onclick="editEvent('${event.id}')">✏️ Edit</button>
            <button class="btn btn-success btn-small" onclick="manageRSVPs('${event.id}')">👥 Manage RSVPs</button>
            <button class="btn btn-danger btn-small" onclick="deleteEvent('${event.id}')">🗑️ Delete</button>
        </div>
    `;
    
    return card;
}

// Save event (create or update)
async function saveEvent() {
    // Validate form
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const capacity = document.getElementById('eventCapacity').value;
    
    if (!title) {
        alert('Please enter event title');
        document.getElementById('eventTitle').focus();
        return;
    }
    
    if (!date) {
        alert('Please select event date');
        document.getElementById('eventDate').focus();
        return;
    }
    
    if (!time) {
        alert('Please select event time');
        document.getElementById('eventTime').focus();
        return;
    }
    
    if (!location) {
        alert('Please enter event location');
        document.getElementById('eventLocation').focus();
        return;
    }
    
    // Combine date and time
    const eventDateTime = new Date(`${date}T${time}`);
    
    // Prepare event data
    const eventData = {
        title: title,
        date: firebase.firestore.Timestamp.fromDate(eventDateTime),
        location: location,
        description: description,
        capacity: capacity ? parseInt(capacity) : null,
        rsvps: currentEventId ? undefined : [], // Keep existing RSVPs on edit
        createdDate: currentEventId ? undefined : firebase.firestore.Timestamp.now()
    };
    
    // Remove undefined fields
    Object.keys(eventData).forEach(key => eventData[key] === undefined && delete eventData[key]);
    
    try {
        if (currentEventId) {
            // Update existing event
            await db.collection('events').doc(currentEventId).update(eventData);
            alert('Event updated successfully!');
        } else {
            // Create new event
            await db.collection('events').add(eventData);
            alert('Event created successfully!');
        }
        
        // Reload and reset
        await loadEvents();
        displayEvents();
        cancelEdit();
        
    } catch (error) {
        console.error('Error saving event:', error);
        alert('Error saving event: ' + error.message);
    }
}

// Edit event
async function editEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    currentEventId = eventId;
    
    // Populate form
    document.getElementById('formTitle').textContent = '✏️ Edit Event';
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date.toISOString().split('T')[0];
    document.getElementById('eventTime').value = event.date.toTimeString().slice(0, 5);
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventCapacity').value = event.capacity || '';
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cancel edit
function cancelEdit() {
    currentEventId = null;
    document.getElementById('formTitle').textContent = '📅 Create New Event';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventCapacity').value = '';
}

// Delete event
async function deleteEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) {
        return;
    }
    
    try {
        await db.collection('events').doc(eventId).delete();
        alert('Event deleted successfully');
        
        await loadEvents();
        displayEvents();
        
        if (currentEventId === eventId) {
            cancelEdit();
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event: ' + error.message);
    }
}

// Manage RSVPs
async function manageRSVPs(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const currentRSVPs = event.rsvps || [];
    const rsvpNames = currentRSVPs.map(r => r.name).join('\n');
    
    const newRSVPs = prompt(
        `Manage RSVPs for "${event.title}"\n\n` +
        `Current RSVPs (${currentRSVPs.length}):\n` +
        `${rsvpNames || 'None yet'}\n\n` +
        `Enter member names (one per line) to update RSVP list:`,
        rsvpNames
    );
    
    if (newRSVPs === null) return; // Cancelled
    
    // Parse names
    const names = newRSVPs.split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
    
    // Create RSVP objects
    const rsvps = names.map(name => ({
        name: name,
        timestamp: firebase.firestore.Timestamp.now()
    }));
    
    try {
        await db.collection('events').doc(eventId).update({ rsvps: rsvps });
        alert(`RSVPs updated! Total: ${rsvps.length}`);
        
        await loadEvents();
        displayEvents();
    } catch (error) {
        console.error('Error updating RSVPs:', error);
        alert('Error updating RSVPs: ' + error.message);
    }
}

// Format helpers
function formatEventDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatEventTime(date) {
    const options = { hour: 'numeric', minute: '2-digit' };
    return date.toLocaleTimeString('en-US', options);
}
