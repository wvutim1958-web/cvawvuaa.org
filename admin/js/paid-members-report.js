/**
 * Paid Members Report
 * Shows members who HAVE paid their current year dues
 */

let reportDb = null;
let paidMembers = [];
let currentSort = { column: 'name', ascending: true };

/**
 * Initialize
 */
window.addEventListener('load', async () => {
    console.log('Paid Members Report loaded');
    
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        document.getElementById('loading').innerHTML = '<p style="color: #c62828;">❌ Firebase not loaded. Please refresh.</p>';
        return;
    }
    
    setTimeout(async () => {
        reportDb = firebase.firestore();
        await loadPaidMembers();
    }, 500);
});

/**
 * Get current membership year (July 1 - June 30)
 */
function getCurrentMembershipYear() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    
    if (currentMonth < 6) {
        // Before July: previous year to current year
        return {
            startYear: currentYear - 1,
            endYear: currentYear,
            startDate: new Date(currentYear - 1, 6, 1), // July 1 of last year
            endDate: new Date(currentYear, 5, 30) // June 30 of this year
        };
    } else {
        // July or later: current year to next year
        return {
            startYear: currentYear,
            endYear: currentYear + 1,
            startDate: new Date(currentYear, 6, 1), // July 1 of this year
            endDate: new Date(currentYear + 1, 5, 30) // June 30 of next year
        };
    }
}

/**
 * Check if member has paid current year dues
 */
function hasPaidCurrentYear(payments, membershipYear) {
    if (!payments || payments.length === 0) return null;
    
    // Find dues payments in current membership year
    const duesPayments = payments.filter(payment => {
        if (payment.type !== 'dues') return false;
        
        let paymentDate;
        if (payment.date && payment.date.toDate) {
            paymentDate = payment.date.toDate();
        } else if (payment.date instanceof Date) {
            paymentDate = payment.date;
        } else {
            paymentDate = new Date(payment.date);
        }
        
        return paymentDate >= membershipYear.startDate && paymentDate <= membershipYear.endDate;
    });
    
    // Return most recent payment if any
    if (duesPayments.length > 0) {
        return duesPayments[duesPayments.length - 1];
    }
    
    return null;
}

/**
 * Load paid members
 */
async function loadPaidMembers() {
    try {
        const membershipYear = getCurrentMembershipYear();
        document.getElementById('membershipYearDisplay').textContent = 
            `Membership Year: July 1, ${membershipYear.startYear} - June 30, ${membershipYear.endYear}`;
        
        const snapshot = await reportDb.collection('members').get();
        
        if (snapshot.empty) {
            document.getElementById('loading').innerHTML = '<p style="color: #666;">No members found.</p>';
            return;
        }
        
        paidMembers = [];
        let totalReceived = 0;
        let individualCount = 0;
        let familyCount = 0;
        
        snapshot.forEach(doc => {
            const member = doc.data();
            const payment = hasPaidCurrentYear(member.payments, membershipYear);
            
            if (payment) {
                paidMembers.push({
                    id: doc.id,
                    name: member.name,
                    email: member.email || '',
                    address: member.address || '',
                    city: member.city || '',
                    zip: member.zip || '',
                    membershipType: member.membershipType || 'individual',
                    familyMemberName: member.familyMemberName || '',
                    payment: payment,
                    paymentTimestamp: payment.recordedDate ? payment.recordedDate.toMillis() : Date.now()
                });
                
                totalReceived += payment.actualReceived || 0;
                
                if (member.membershipType === 'family') {
                    familyCount++;
                } else {
                    individualCount++;
                }
            }
        });
        
        // Update statistics
        document.getElementById('paidCount').textContent = paidMembers.length;
        document.getElementById('totalReceived').textContent = '$' + totalReceived.toFixed(2);
        document.getElementById('individualCount').textContent = individualCount;
        document.getElementById('familyCount').textContent = familyCount;
        
        // Render table
        renderTable();
        updateSortIndicators();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('membersTable').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading paid members:', error);
        document.getElementById('loading').innerHTML = 
            `<p style="color: #c62828;">❌ Error: ${error.message}</p>`;
    }
}

/**
 * Sort members by column
 */
function sortBy(column) {
    // Toggle direction if clicking same column
    if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = column;
        currentSort.ascending = true;
    }
    
    // Sort the array
    paidMembers.sort((a, b) => {
        let aVal, bVal;
        
        switch(column) {
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'type':
                aVal = a.membershipType;
                bVal = b.membershipType;
                break;
            case 'date':
                aVal = a.payment.date && a.payment.date.toDate 
                    ? a.payment.date.toDate().getTime()
                    : new Date(a.payment.date).getTime();
                bVal = b.payment.date && b.payment.date.toDate 
                    ? b.payment.date.toDate().getTime()
                    : new Date(b.payment.date).getTime();
                break;
            case 'amount':
                aVal = a.payment.actualReceived;
                bVal = b.payment.actualReceived;
                break;
            case 'method':
                aVal = a.payment.paymentMethod.toLowerCase();
                bVal = b.payment.paymentMethod.toLowerCase();
                break;
            case 'email':
                aVal = a.email.toLowerCase();
                bVal = b.email.toLowerCase();
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
    });
    
    // Re-render table
    renderTable();
    
    // Update sort indicators
    updateSortIndicators();
}

/**
 * Update sort indicators in table headers
 */
function updateSortIndicators() {
    // Remove all existing indicators
    document.querySelectorAll('.sort-indicator').forEach(el => el.remove());
    
    // Add indicator to current sort column
    const header = document.querySelector(`th[data-sort="${currentSort.column}"]`);
    if (header) {
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.textContent = currentSort.ascending ? ' ▲' : ' ▼';
        indicator.style.marginLeft = '5px';
        indicator.style.fontSize = '12px';
        header.appendChild(indicator);
    }
}

/**
 * Render members table
 */
function renderTable() {
    const tbody = document.getElementById('membersTableBody');
    
    if (paidMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #666;">No members have paid current year dues yet.</td></tr>';
        return;
    }
    
    tbody.innerHTML = paidMembers.map(member => {
        const payment = member.payment;
        const paymentDate = payment.date && payment.date.toDate 
            ? payment.date.toDate() 
            : new Date(payment.date);
        const formattedDate = paymentDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const membershipTypeLabel = member.membershipType === 'family' ? 'Family' : 'Individual';
        const familyInfo = member.familyMemberName ? ` (${member.familyMemberName})` : '';
        
        return `
            <tr>
                <td>
                    <strong>${escapeHtml(member.name)}</strong>
                    ${familyInfo ? `<br><span style="color: #666; font-size: 13px;">${escapeHtml(familyInfo)}</span>` : ''}
                </td>
                <td><span class="membership-type">${membershipTypeLabel}</span></td>
                <td class="payment-date">${formattedDate}</td>
                <td class="amount">$${payment.actualReceived.toFixed(2)}</td>
                <td>${escapeHtml(payment.paymentMethod)}</td>
                <td>${member.email ? escapeHtml(member.email) : '<span style="color: #999;">No email</span>'}</td>
                <td>
                    <button class="btn btn-primary" onclick="viewReceipt('${member.id}', ${member.paymentTimestamp})" style="padding: 8px 16px; font-size: 13px;">
                        📄 Receipt
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * View receipt for member
 */
function viewReceipt(memberId, timestamp) {
    window.open(`/admin/receipt-viewer.html?memberId=${memberId}&timestamp=${timestamp}`, '_blank');
}

/**
 * Export full CSV
 */
function exportFullCSV() {
    if (paidMembers.length === 0) {
        alert('No paid members to export');
        return;
    }
    
    const headers = ['Name', 'Membership Type', 'Family Member', 'Payment Date', 'Amount', 'Method', 'Email', 'Address', 'City', 'ZIP'];
    const rows = paidMembers.map(member => {
        const payment = member.payment;
        const paymentDate = payment.date && payment.date.toDate 
            ? payment.date.toDate() 
            : new Date(payment.date);
        const formattedDate = paymentDate.toLocaleDateString('en-US');
        
        return [
            member.name,
            member.membershipType,
            member.familyMemberName || '',
            formattedDate,
            payment.actualReceived.toFixed(2),
            payment.paymentMethod,
            member.email,
            member.address,
            member.city,
            member.zip
        ];
    });
    
    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    downloadCSV(csv, 'paid-members-report.csv');
}

/**
 * Export email list only
 */
function exportEmailList() {
    const membersWithEmail = paidMembers.filter(m => m.email);
    
    if (membersWithEmail.length === 0) {
        alert('No members with email addresses');
        return;
    }
    
    const emails = membersWithEmail.map(m => m.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paid-members-emails.txt';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Print all receipts (opens in new windows)
 */
function printReceipts() {
    if (paidMembers.length === 0) {
        alert('No paid members to print receipts for');
        return;
    }
    
    if (!confirm(`This will open ${paidMembers.length} receipt windows. Continue?`)) {
        return;
    }
    
    paidMembers.forEach((member, index) => {
        setTimeout(() => {
            window.open(`/admin/receipt-viewer.html?memberId=${member.id}&timestamp=${member.paymentTimestamp}`, '_blank');
        }, index * 500); // Stagger by 500ms to avoid browser blocking
    });
}

/**
 * Download CSV helper
 */
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
