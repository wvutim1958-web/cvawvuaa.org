/**
 * Payment Tracking System
 * Displays all payments from all members in a single table
 */

let paymentDb = null;
let allPayments = [];
let filteredPayments = [];
let currentSort = { column: 'date', direction: 'desc' };

/**
 * Initialize when page loads
 */
window.addEventListener('load', async () => {
    console.log('Payment tracking page loaded');
    
    // Wait for Firebase to initialize
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        showError('Firebase not loaded. Please refresh the page.');
        return;
    }
    
    // Get Firebase instance
    setTimeout(async () => {
        paymentDb = firebase.firestore();
        await loadAllPayments();
    }, 500);
    
    // Set up event listeners
    document.getElementById('searchInput').addEventListener('input', filterPayments);
    document.getElementById('typeFilter').addEventListener('change', filterPayments);
    document.getElementById('methodFilter').addEventListener('change', filterPayments);
});

/**
 * Load all payments from all members
 */
async function loadAllPayments() {
    try {
        console.log('Loading payments...');
        document.getElementById('loadingMessage').style.display = 'block';
        document.getElementById('paymentTable').style.display = 'none';
        document.getElementById('emptyState').style.display = 'none';
        
        allPayments = [];
        
        // Get all members
        const membersSnapshot = await paymentDb.collection('members').get();
        
        if (membersSnapshot.empty) {
            console.log('No members found');
            showEmptyState();
            return;
        }
        
        // Extract payments from each member
        let membersWithPayments = 0;
        membersSnapshot.forEach(doc => {
            const member = doc.data();
            const payments = member.payments || [];
            
            if (payments.length > 0) {
                membersWithPayments++;
                console.log(`Member "${member.name}" has ${payments.length} payment(s)`);
            }
            
            payments.forEach(payment => {
                allPayments.push({
                    memberName: member.name,
                    memberId: doc.id,
                    date: payment.date.toDate ? payment.date.toDate() : new Date(payment.date),
                    type: payment.type,
                    expectedAmount: payment.expectedAmount,
                    actualReceived: payment.actualReceived,
                    paymentMethod: payment.paymentMethod,
                    notes: payment.notes || '',
                    recordedDate: payment.recordedDate
                });
            });
        });
        
        console.log(`Loaded ${allPayments.length} payments from ${membersSnapshot.size} members (${membersWithPayments} members have payments)`);
        
        if (allPayments.length === 0) {
            showEmptyState();
        } else {
            filteredPayments = [...allPayments];
            sortTable('date'); // Default sort by date descending
            renderPayments();
            updateStatistics();
        }
        
    } catch (error) {
        console.error('Error loading payments:', error);
        showError('Failed to load payments: ' + error.message);
    }
}

/**
 * Filter payments based on search and filters
 */
function filterPayments() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const methodFilter = document.getElementById('methodFilter').value;
    
    filteredPayments = allPayments.filter(payment => {
        // Search filter
        const memberName = payment.memberName || '';
        const matchesSearch = memberName.toLowerCase().includes(searchTerm);
        
        // Type filter
        const matchesType = typeFilter === 'all' || payment.type === typeFilter;
        
        // Method filter
        const paymentMethod = payment.paymentMethod || '';
        const matchesMethod = methodFilter === 'all' || paymentMethod === methodFilter;
        
        return matchesSearch && matchesType && matchesMethod;
    });
    
    renderPayments();
    updateStatistics();
}

/**
 * Sort table by column
 */
function sortTable(column) {
    // Toggle direction if clicking same column
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = column === 'date' ? 'desc' : 'asc'; // Default date to descending
    }
    
    // Sort the filtered payments
    filteredPayments.sort((a, b) => {
        let aVal, bVal;
        
        switch (column) {
            case 'date':
                aVal = a.date.getTime();
                bVal = b.date.getTime();
                break;
            case 'member':
                aVal = a.memberName.toLowerCase();
                bVal = b.memberName.toLowerCase();
                break;
            case 'type':
                aVal = a.type;
                bVal = b.type;
                break;
            case 'gross':
                aVal = a.expectedAmount;
                bVal = b.expectedAmount;
                break;
            case 'net':
                aVal = a.actualReceived;
                bVal = b.actualReceived;
                break;
            case 'method':
                aVal = a.paymentMethod;
                bVal = b.paymentMethod;
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Update sort indicators
    document.querySelectorAll('.sort-indicator').forEach(el => el.textContent = '');
    const indicator = document.getElementById(`sort-${column}`);
    if (indicator) {
        indicator.textContent = currentSort.direction === 'asc' ? '▲' : '▼';
    }
    
    renderPayments();
}

/**
 * Render payments to table
 */
function renderPayments() {
    const tbody = document.getElementById('paymentTableBody');
    
    if (filteredPayments.length === 0) {
        showEmptyState();
        return;
    }
    
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('paymentTable').style.display = 'table';
    
    tbody.innerHTML = filteredPayments.map(payment => {
        const expectedAmount = parseFloat(payment.expectedAmount) || 0;
        const actualReceived = parseFloat(payment.actualReceived) || 0;
        const fee = expectedAmount - actualReceived;
        const typeLabel = {
            'dues': 'Dues',
            'chapter': 'Chapter',
            'scholarship': 'Scholarship'
        }[payment.type] || payment.type;
        
        // Get timestamp for receipt link
        const timestamp = payment.recordedDate && payment.recordedDate.toMillis 
            ? payment.recordedDate.toMillis() 
            : Date.now();
        
        return `
            <tr>
                <td>${formatDate(payment.date)}</td>
                <td><strong>${escapeHtml(payment.memberName)}</strong></td>
                <td><span class="payment-type ${payment.type}">${typeLabel}</span></td>
                <td class="amount gross">$${expectedAmount.toFixed(2)}</td>
                <td>
                    <span class="amount net">$${actualReceived.toFixed(2)}</span>
                    ${fee > 0 ? `<br><span class="fee">-$${fee.toFixed(2)} fee</span>` : ''}
                </td>
                <td>${escapeHtml(payment.paymentMethod || '')}</td>
                <td>${escapeHtml(payment.notes || '')}</td>
                <td style="text-align: center; white-space: nowrap;">
                    <button onclick="window.open('/admin/receipt-viewer.html?memberId=${payment.memberId}&timestamp=${timestamp}', '_blank')" 
                            style="background: #4a90e2; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 13px; margin-right: 5px;">
                        📄 Receipt
                    </button>
                    <button onclick="editPayment('${payment.memberId}', ${timestamp})" 
                            style="background: #4a90e2; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 13px; margin-right: 5px;">
                        ✏️ Edit
                    </button>
                    <button onclick="deletePayment('${payment.memberId}', ${timestamp})" 
                            style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 13px;">
                        🗑️ Delete
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
    const totalPayments = filteredPayments.length;
    const grossTotal = filteredPayments.reduce((sum, p) => sum + p.expectedAmount, 0);
    const netTotal = filteredPayments.reduce((sum, p) => sum + p.actualReceived, 0);
    const totalFees = grossTotal - netTotal;
    
    document.getElementById('totalPayments').textContent = totalPayments;
    document.getElementById('grossTotal').textContent = `$${grossTotal.toFixed(2)}`;
    document.getElementById('netTotal').textContent = `$${netTotal.toFixed(2)}`;
    document.getElementById('totalFees').textContent = `$${totalFees.toFixed(2)}`;
}

/**
 * Export to CSV
 */
function exportToCSV() {
    if (filteredPayments.length === 0) {
        alert('No payments to export');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Member Name', 'Type', 'Gross Amount', 'Net Amount', 'Fee', 'Payment Method', 'Notes'];
    const rows = filteredPayments.map(payment => {
        const fee = payment.expectedAmount - payment.actualReceived;
        const typeLabel = {
            'dues': 'Dues',
            'chapter': 'Chapter Donation',
            'scholarship': 'Scholarship Donation'
        }[payment.type] || payment.type;
        
        return [
            formatDate(payment.date),
            payment.memberName,
            typeLabel,
            payment.expectedAmount.toFixed(2),
            payment.actualReceived.toFixed(2),
            fee.toFixed(2),
            payment.paymentMethod,
            payment.notes
        ].map(csvEscape).join(',');
    });
    
    const csv = [headers.map(csvEscape).join(','), ...rows].join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-tracking-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('Exported', filteredPayments.length, 'payments to CSV');
}

/**
 * Show empty state
 */
function showEmptyState() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('paymentTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    updateStatistics();
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('loadingMessage').innerHTML = `
        <div style="color: #c62828;">
            ❌ ${message}
        </div>
    `;
}

/**
 * Format date
 */
function formatDate(date) {
    if (!date) return 'N/A';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Edit a payment
 */
function editPayment(memberId, timestamp) {
    // Redirect to member database to edit the payment
    window.location.href = `/admin/member-database.html?id=${memberId}&editPayment=${timestamp}`;
}

/**
 * Delete a payment from a member's record
 */
async function deletePayment(memberId, timestamp) {
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
        return;
    }
    
    try {
        console.log(`Deleting payment for member ${memberId} with timestamp ${timestamp}`);
        
        // Get the member document
        const memberRef = paymentDb.collection('members').doc(memberId);
        const memberDoc = await memberRef.get();
        
        if (!memberDoc.exists) {
            alert('Error: Member not found');
            return;
        }
        
        const memberData = memberDoc.data();
        const payments = memberData.payments || [];
        
        // Find and remove the payment with matching timestamp
        const updatedPayments = payments.filter(payment => {
            const paymentTimestamp = payment.recordedDate && payment.recordedDate.toMillis 
                ? payment.recordedDate.toMillis() 
                : Date.now();
            return paymentTimestamp !== timestamp;
        });
        
        if (updatedPayments.length === payments.length) {
            alert('Error: Payment not found');
            return;
        }
        
        // Update the member document
        await memberRef.update({
            payments: updatedPayments
        });
        
        console.log('Payment deleted successfully');
        alert('✅ Payment deleted successfully!');
        
        // Reload all payments to refresh the display
        await loadAllPayments();
        
    } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error deleting payment: ' + error.message);
    }
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
 * Escape CSV values
 */
function csvEscape(value) {
    if (!value) return '""';
    const stringValue = value.toString();
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
}
