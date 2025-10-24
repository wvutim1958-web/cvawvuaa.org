/**
 * Outstanding Dues Report
 * Shows members who haven't paid current year dues
 */

let duesDb = null;
let membersOwingDues = [];
const currentYear = new Date().getFullYear();
const currentMembershipYear = getCurrentMembershipYear();

/**
 * Get current membership year (July 1 - June 30)
 */
function getCurrentMembershipYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    
    // If before July (month 6), membership year is previous July to this June
    // If July or after, membership year is this July to next June
    if (month < 6) { // Jan-June
        return `${year - 1}-${year}`;
    } else { // July-Dec
        return `${year}-${year + 1}`;
    }
}

/**
 * Initialize when page loads
 */
window.addEventListener('load', async () => {
    console.log('Outstanding Dues Report loading...');
    
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        showError('Firebase not loaded. Please refresh the page.');
        return;
    }
    
    setTimeout(async () => {
        duesDb = firebase.firestore();
        await loadOutstandingDues();
    }, 500);
});

/**
 * Load members with outstanding dues
 */
async function loadOutstandingDues() {
    try {
        console.log('Loading members with outstanding dues...');
        document.getElementById('loadingMessage').style.display = 'block';
        document.getElementById('duesTable').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
        
        membersOwingDues = [];
        
        // Get all members
        const membersSnapshot = await duesDb.collection('members').get();
        
        if (membersSnapshot.empty) {
            console.log('No members found');
            showEmptyState();
            return;
        }
        
        // Check each member for current year payment
        membersSnapshot.forEach(doc => {
            const member = doc.data();
            const payments = member.payments || [];
            
            // Filter for dues payments in current membership year
            const currentYearDuesPayments = payments.filter(payment => {
                if (payment.type !== 'dues') return false;
                
                const paymentDate = payment.date.toDate ? payment.date.toDate() : new Date(payment.date);
                const paymentYear = paymentDate.getFullYear();
                const paymentMonth = paymentDate.getMonth();
                
                // Check if payment is in current membership year (July 1 - June 30)
                const membershipYearStart = currentMembershipYear.split('-')[0];
                const membershipYearEnd = currentMembershipYear.split('-')[1];
                
                if (paymentYear == membershipYearStart && paymentMonth >= 6) return true; // July-Dec of start year
                if (paymentYear == membershipYearEnd && paymentMonth < 6) return true; // Jan-June of end year
                
                return false;
            });
            
            // If no current year payment, add to owing list
            if (currentYearDuesPayments.length === 0) {
                const amountDue = member.membershipType === 'family' ? 40.00 : 25.00;
                
                membersOwingDues.push({
                    id: doc.id,
                    name: member.name,
                    membershipType: member.membershipType,
                    familyMemberName: member.familyMemberName || '',
                    email: member.email || '',
                    address: member.address || '',
                    city: member.city || '',
                    zip: member.zip || '',
                    phone: member.phone || '',
                    amountDue: amountDue,
                    hasEmail: !!(member.email && member.email.trim()),
                    hasAddress: !!(member.address && member.address.trim())
                });
            }
        });
        
        console.log(`Found ${membersOwingDues.length} members owing dues for ${currentMembershipYear}`);
        
        if (membersOwingDues.length === 0) {
            showEmptyState();
        } else {
            renderDuesTable();
            updateStatistics();
        }
        
    } catch (error) {
        console.error('Error loading outstanding dues:', error);
        showError('Failed to load outstanding dues: ' + error.message);
    }
}

/**
 * Render dues table
 */
function renderDuesTable() {
    const tbody = document.getElementById('duesTableBody');
    
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('duesTable').style.display = 'table';
    
    tbody.innerHTML = membersOwingDues.map(member => {
        const typeClass = member.membershipType === 'family' ? 'type-family' : 'type-individual';
        const typeLabel = member.membershipType === 'family' ? 'Family' : 'Individual';
        
        return `
            <tr>
                <td class="member-name">${escapeHtml(member.name)}</td>
                <td><span class="membership-type ${typeClass}">${typeLabel}</span></td>
                <td class="amount-due">$${member.amountDue.toFixed(2)}</td>
                <td class="contact-info">
                    ${member.hasEmail ? `📧 ${escapeHtml(member.email)}` : '<span style="color: #c62828;">No email</span>'}
                </td>
                <td class="contact-info">
                    ${member.hasAddress ? `📮 ${escapeHtml(member.address)}<br>${escapeHtml(member.city)}, WV ${escapeHtml(member.zip)}` : '<span style="color: #c62828;">No address</span>'}
                </td>
                <td class="contact-info">${member.phone ? `📞 ${escapeHtml(member.phone)}` : '-'}</td>
                <td class="actions">
                    <button class="btn-action btn-generate-invoice" onclick="generateInvoice('${member.id}')">
                        📄 Invoice
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update statistics
 */
function updateStatistics() {
    const totalOwing = membersOwingDues.length;
    const totalAmount = membersOwingDues.reduce((sum, m) => sum + m.amountDue, 0);
    const withEmail = membersOwingDues.filter(m => m.hasEmail).length;
    const withAddress = membersOwingDues.filter(m => m.hasAddress).length;
    
    document.getElementById('totalOwing').textContent = totalOwing;
    document.getElementById('totalAmountDue').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('withEmail').textContent = withEmail;
    document.getElementById('withAddress').textContent = withAddress;
}

/**
 * Export to CSV
 */
function exportToCSV() {
    if (membersOwingDues.length === 0) {
        alert('No outstanding dues to export');
        return;
    }
    
    const headers = ['Name', 'Membership Type', 'Amount Due', 'Email', 'Address', 'City', 'ZIP', 'Phone'];
    const rows = membersOwingDues.map(member => [
        member.name,
        member.membershipType === 'family' ? 'Family' : 'Individual',
        member.amountDue.toFixed(2),
        member.email,
        member.address,
        member.city,
        member.zip,
        member.phone
    ].map(csvEscape).join(','));
    
    const csv = [headers.map(csvEscape).join(','), ...rows].join('\n');
    downloadCSV(csv, `outstanding-dues-${currentMembershipYear}.csv`);
}

/**
 * Export email list
 */
function exportEmailList() {
    const withEmail = membersOwingDues.filter(m => m.hasEmail);
    
    if (withEmail.length === 0) {
        alert('No members with email addresses');
        return;
    }
    
    const headers = ['Name', 'Email', 'Amount Due'];
    const rows = withEmail.map(member => [
        member.name,
        member.email,
        member.amountDue.toFixed(2)
    ].map(csvEscape).join(','));
    
    const csv = [headers.map(csvEscape).join(','), ...rows].join('\n');
    downloadCSV(csv, `outstanding-dues-emails-${currentMembershipYear}.csv`);
}

/**
 * Export for Gmail Mail Merge
 */
function exportMailMerge() {
    const withEmail = membersOwingDues.filter(m => m.hasEmail);
    
    if (withEmail.length === 0) {
        alert('No members with email addresses');
        return;
    }
    
    // Split name into first and last
    const headers = ['Email', 'FirstName', 'LastName', 'FullName', 'MembershipType', 'AmountDue', 'InvoiceURL'];
    const rows = withEmail.map(member => {
        const nameParts = member.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const invoiceURL = `https://cvawvuaa.org/admin/invoice-generator.html?memberId=${member.id}`;
        
        return [
            member.email,
            firstName,
            lastName,
            member.name,
            member.membershipType === 'family' ? 'Family' : 'Individual',
            `$${member.amountDue.toFixed(2)}`,
            invoiceURL
        ].map(csvEscape).join(',');
    });
    
    const csv = [headers.map(csvEscape).join(','), ...rows].join('\n');
    downloadCSV(csv, `mail-merge-outstanding-dues-${currentMembershipYear}.csv`);
    
    // Log communication for each member
    logMailMergeReminders(withEmail);
    
    // Open instructions in new tab
    setTimeout(() => {
        window.open('mail-merge-instructions.html', '_blank');
    }, 500);
}

/**
 * Log mail merge reminders to communication history
 */
async function logMailMergeReminders(members) {
    try {
        const batch = [];
        
        for (const member of members) {
            batch.push(
                db.collection('communications').add({
                    memberId: member.id,
                    type: 'reminder',
                    details: `Dues reminder sent via mail merge - Amount due: $${member.amountDue.toFixed(2)}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    sentBy: 'Admin User',
                    method: 'Email',
                    amount: member.amountDue,
                    metadata: {
                        membershipYear: currentMembershipYear,
                        membershipType: member.membershipType,
                        exportType: 'mail-merge'
                    }
                })
            );
        }
        
        await Promise.all(batch);
        console.log(`Logged ${members.length} mail merge reminders`);
        
    } catch (error) {
        console.error('Error logging mail merge reminders:', error);
    }
}

/**
 * Export mailing list
 */
function exportMailingList() {
    const withAddress = membersOwingDues.filter(m => m.hasAddress);
    
    if (withAddress.length === 0) {
        alert('No members with mailing addresses');
        return;
    }
    
    const headers = ['Name', 'Address', 'City', 'State', 'ZIP', 'Amount Due'];
    const rows = withAddress.map(member => [
        member.name,
        member.address,
        member.city,
        'WV',
        member.zip,
        member.amountDue.toFixed(2)
    ].map(csvEscape).join(','));
    
    const csv = [headers.map(csvEscape).join(','), ...rows].join('\n');
    downloadCSV(csv, `outstanding-dues-mailing-${currentMembershipYear}.csv`);
}

/**
 * Download CSV helper
 */
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/**
 * Generate invoice for single member
 */
function generateInvoice(memberId) {
    window.open(`/admin/invoice-generator.html?memberId=${memberId}`, '_blank');
}

/**
 * Generate all invoices
 */
function generateAllInvoices() {
    if (membersOwingDues.length === 0) {
        alert('No outstanding dues to invoice');
        return;
    }
    
    if (confirm(`Generate invoices for all ${membersOwingDues.length} members?\n\nThis will open multiple browser tabs.`)) {
        membersOwingDues.forEach((member, index) => {
            setTimeout(() => {
                generateInvoice(member.id);
            }, index * 500); // Stagger by 500ms to avoid browser blocking
        });
    }
}

/**
 * Show empty state
 */
function showEmptyState() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('duesTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    updateStatistics();
}

/**
 * Show error
 */
function showError(message) {
    document.getElementById('loadingMessage').innerHTML = `
        <div style="color: #c62828;">❌ ${message}</div>
    `;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * CSV escape
 */
function csvEscape(value) {
    if (!value) return '""';
    const stringValue = value.toString();
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
}
