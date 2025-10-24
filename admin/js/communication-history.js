// Communication History - Track and view all member communications

let allCommunications = [];
let filteredCommunications = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCommunications();
    await loadMembersFilter();
    updateStats();
    displayTimeline();
});

// Load all communications from Firestore
async function loadCommunications() {
    try {
        const commsSnapshot = await db.collection('communications')
            .orderBy('date', 'desc')
            .get();
        
        allCommunications = [];
        commsSnapshot.forEach(doc => {
            const comm = doc.data();
            allCommunications.push({
                id: doc.id,
                ...comm,
                date: comm.date.toDate() // Convert Firestore timestamp to JS Date
            });
        });
        
        filteredCommunications = [...allCommunications];
    } catch (error) {
        console.error('Error loading communications:', error);
        alert('Error loading communication history');
    }
}

// Load members for filter dropdown
async function loadMembersFilter() {
    try {
        const membersSnapshot = await db.collection('members')
            .orderBy('name')
            .get();
        
        const select = document.getElementById('filterMember');
        select.innerHTML = '<option value="">All Members</option>';
        
        membersSnapshot.forEach(doc => {
            const member = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = member.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Update statistics
function updateStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Total communications
    document.getElementById('totalComms').textContent = filteredCommunications.length;
    
    // This month
    const monthCount = filteredCommunications.filter(c => c.date >= monthStart).length;
    document.getElementById('monthComms').textContent = monthCount;
    
    // Last 7 days
    const weekCount = filteredCommunications.filter(c => c.date >= weekAgo).length;
    document.getElementById('weekComms').textContent = weekCount;
    
    // Unique members
    const uniqueIds = new Set(filteredCommunications.map(c => c.memberId));
    document.getElementById('uniqueMembers').textContent = uniqueIds.size;
}

// Display timeline
function displayTimeline() {
    const timeline = document.getElementById('timeline');
    
    if (filteredCommunications.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No communications found</p>
            </div>
        `;
        return;
    }
    
    timeline.innerHTML = '';
    
    filteredCommunications.forEach(comm => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const typeClass = getTypeClass(comm.type);
        
        item.innerHTML = `
            <div class="timeline-date">${formatDateTime(comm.date)}</div>
            <div class="timeline-content">
                <div class="timeline-type ${typeClass}">${comm.type}</div>
                <div class="timeline-subject">${comm.subject || 'No Subject'}</div>
                <div class="timeline-message">${comm.message || ''}</div>
                <div class="timeline-member">👤 ${comm.memberName || 'Unknown Member'}</div>
            </div>
        `;
        
        timeline.appendChild(item);
    });
}

// Get CSS class for communication type
function getTypeClass(type) {
    if (type.toLowerCase().includes('reminder')) return 'type-reminder';
    if (type.toLowerCase().includes('receipt')) return 'type-receipt';
    if (type.toLowerCase().includes('event')) return 'type-event';
    return 'type-email';
}

// Apply filters
async function applyFilters() {
    const memberId = document.getElementById('filterMember').value;
    const type = document.getElementById('filterType').value;
    const fromDate = document.getElementById('filterFromDate').value;
    const toDate = document.getElementById('filterToDate').value;
    
    filteredCommunications = [...allCommunications];
    
    // Filter by member
    if (memberId) {
        filteredCommunications = filteredCommunications.filter(c => c.memberId === memberId);
    }
    
    // Filter by type
    if (type) {
        filteredCommunications = filteredCommunications.filter(c => c.type === type);
    }
    
    // Filter by date range
    if (fromDate) {
        const from = new Date(fromDate);
        filteredCommunications = filteredCommunications.filter(c => c.date >= from);
    }
    
    if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        filteredCommunications = filteredCommunications.filter(c => c.date <= to);
    }
    
    updateStats();
    displayTimeline();
}

// Clear all filters
async function clearFilters() {
    document.getElementById('filterMember').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterFromDate').value = '';
    document.getElementById('filterToDate').value = '';
    
    filteredCommunications = [...allCommunications];
    updateStats();
    displayTimeline();
}

// Export to CSV
function exportCSV() {
    if (filteredCommunications.length === 0) {
        alert('No communications to export');
        return;
    }
    
    // CSV headers
    let csv = 'Date,Time,Member Name,Type,Subject,Message\n';
    
    // CSV rows
    filteredCommunications.forEach(comm => {
        const date = formatDate(comm.date);
        const time = formatTime(comm.date);
        const name = (comm.memberName || '').replace(/,/g, ';');
        const type = (comm.type || '').replace(/,/g, ';');
        const subject = (comm.subject || '').replace(/,/g, ';');
        const message = (comm.message || '').replace(/,/g, ';').replace(/\n/g, ' ');
        
        csv += `"${date}","${time}","${name}","${type}","${subject}","${message}"\n`;
    });
    
    // Create download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-history-${formatDateForFilename(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Format date and time helpers
function formatDateTime(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
    const options = { hour: 'numeric', minute: '2-digit' };
    return date.toLocaleTimeString('en-US', options);
}

function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
