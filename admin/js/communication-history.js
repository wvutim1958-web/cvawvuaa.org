// Firebase is already initialized in firebase-config.js
// db is already available globally

let allCommunications = [];
let filteredCommunications = [];
let allMembers = [];

// Load all data on page load
async function loadAllData() {
    try {
        // Load members and communications in parallel
        const [membersSnapshot, commsSnapshot] = await Promise.all([
            db.collection('members').get(),
            db.collection('communications').orderBy('timestamp', 'desc').get()
        ]);
        
        // Process members
        allMembers = membersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        // Process communications
        allCommunications = commsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`Loaded ${allMembers.length} members, ${allCommunications.length} communications`);
        
        // Populate member filter dropdown
        populateMemberFilter();
        
        // Display all communications
        filteredCommunications = [...allCommunications];
        renderTimeline();
        updateStatistics();
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('timelineContent').innerHTML = 
            '<div class="no-data">Error loading communication history. Please refresh the page.</div>';
    }
}

// Populate member filter dropdown
function populateMemberFilter() {
    const select = document.getElementById('memberFilter');
    select.innerHTML = '<option value="">All Members</option>';
    
    allMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name || 'Unnamed Member';
        select.appendChild(option);
    });
}

// Render timeline
function renderTimeline() {
    const container = document.getElementById('timelineContent');
    
    if (filteredCommunications.length === 0) {
        container.innerHTML = '<div class="no-data">No communications found matching your filters.</div>';
        return;
    }
    
    const timeline = document.createElement('div');
    timeline.className = 'timeline';
    
    filteredCommunications.forEach(comm => {
        const member = allMembers.find(m => m.id === comm.memberId);
        const memberName = member ? member.name : 'Unknown Member';
        
        const item = document.createElement('div');
        item.className = `timeline-item ${comm.type}`;
        item.innerHTML = `
            <div class="timeline-header">
                <span class="timeline-type ${comm.type}">${comm.type}</span>
                <span class="timeline-date">${formatDate(comm.timestamp)}</span>
            </div>
            <div class="timeline-member">${escapeHtml(memberName)}</div>
            <div class="timeline-details">${escapeHtml(comm.details || 'No details provided')}</div>
            ${comm.sentBy ? `
                <div class="timeline-meta">
                    Sent by: ${escapeHtml(comm.sentBy)}
                    ${comm.method ? ` • Method: ${escapeHtml(comm.method)}` : ''}
                    ${comm.amount ? ` • Amount: ${formatCurrency(comm.amount)}` : ''}
                </div>
            ` : ''}
        `;
        
        timeline.appendChild(item);
    });
    
    container.innerHTML = '';
    container.appendChild(timeline);
}

// Update statistics
function updateStatistics() {
    const totalComms = filteredCommunications.length;
    
    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentComms = filteredCommunications.filter(comm => {
        const commDate = comm.timestamp.toDate ? comm.timestamp.toDate() : new Date(comm.timestamp);
        return commDate >= thirtyDaysAgo;
    }).length;
    
    // Unique members contacted
    const uniqueMembers = new Set(filteredCommunications.map(comm => comm.memberId));
    const membersContacted = uniqueMembers.size;
    
    // Pending follow-ups (reminders sent but no recent payment)
    const pendingFollowups = calculatePendingFollowups();
    
    document.getElementById('totalComms').textContent = totalComms;
    document.getElementById('recentComms').textContent = recentComms;
    document.getElementById('membersContacted').textContent = membersContacted;
    document.getElementById('pendingFollowups').textContent = pendingFollowups;
}

// Calculate pending follow-ups
function calculatePendingFollowups() {
    // Members who received reminders but haven't paid yet
    const reminders = filteredCommunications.filter(comm => comm.type === 'reminder');
    const receipts = filteredCommunications.filter(comm => comm.type === 'receipt');
    
    const remindedMembers = new Set(reminders.map(r => r.memberId));
    const paidMembers = new Set(receipts.map(r => r.memberId));
    
    let pending = 0;
    remindedMembers.forEach(memberId => {
        if (!paidMembers.has(memberId)) {
            pending++;
        }
    });
    
    return pending;
}

// Apply filters
function applyFilters() {
    const memberFilter = document.getElementById('memberFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    filteredCommunications = allCommunications.filter(comm => {
        // Member filter
        if (memberFilter && comm.memberId !== memberFilter) {
            return false;
        }
        
        // Type filter
        if (typeFilter && comm.type !== typeFilter) {
            return false;
        }
        
        // Date filters
        const commDate = comm.timestamp.toDate ? comm.timestamp.toDate() : new Date(comm.timestamp);
        
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            if (commDate < fromDate) {
                return false;
            }
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            if (commDate > toDate) {
                return false;
            }
        }
        
        return true;
    });
    
    renderTimeline();
    updateStatistics();
}

// Reset filters
function resetFilters() {
    document.getElementById('memberFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    
    filteredCommunications = [...allCommunications];
    renderTimeline();
    updateStatistics();
}

// Export to CSV
function exportToCSV() {
    if (filteredCommunications.length === 0) {
        alert('No communications to export.');
        return;
    }
    
    // Build CSV content
    const headers = ['Date', 'Type', 'Member', 'Email', 'Details', 'Sent By', 'Method', 'Amount'];
    const rows = filteredCommunications.map(comm => {
        const member = allMembers.find(m => m.id === comm.memberId);
        const memberName = member ? member.name : 'Unknown';
        const memberEmail = member?.email || '';
        
        return [
            formatDate(comm.timestamp),
            comm.type,
            memberName,
            memberEmail,
            comm.details || '',
            comm.sentBy || '',
            comm.method || '',
            comm.amount ? comm.amount.toFixed(2) : ''
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
    link.setAttribute('download', `communication-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Log communication (helper function for other pages to use)
async function logCommunication(memberId, type, details, options = {}) {
    try {
        const commData = {
            memberId,
            type, // 'invoice', 'receipt', 'reminder', 'email', 'other'
            details,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            sentBy: options.sentBy || 'System',
            method: options.method || '', // 'Email', 'Phone', 'Mail', etc.
            amount: options.amount || null,
            metadata: options.metadata || {}
        };
        
        await db.collection('communications').add(commData);
        console.log(`Logged ${type} communication for member ${memberId}`);
        
        return true;
        
    } catch (error) {
        console.error('Error logging communication:', error);
        return false;
    }
}

// Helper functions
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data on page load
loadAllData();

// Make logCommunication available globally for other pages
window.logCommunication = logCommunication;
