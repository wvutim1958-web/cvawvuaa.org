// Bulk Payment Recording - Record multiple membership payments efficiently

let paymentRowCounter = 0;
let members = [];

// Load members on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadMembers();
    addPaymentRow(); // Start with one row
});

// Load all members
async function loadMembers() {
    try {
        const membersSnapshot = await db.collection('members')
            .orderBy('name')
            .get();
        
        members = [];
        membersSnapshot.forEach(doc => {
            members.push({
                id: doc.id,
                ...doc.data()
            });
        });
    } catch (error) {
        console.error('Error loading members:', error);
        alert('Error loading member list');
    }
}

// Add payment row
function addPaymentRow() {
    const container = document.getElementById('paymentsList');
    const rowId = `payment-${paymentRowCounter++}`;
    
    const row = document.createElement('div');
    row.className = 'payment-row';
    row.id = rowId;
    
    row.innerHTML = `
        <div class="form-group">
            <label>Member</label>
            <select class="member-select" onchange="updateSummary()">
                <option value="">-- Select Member --</option>
                ${members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Amount</label>
            <input type="number" class="amount-input" step="0.01" min="0" placeholder="50.00" onchange="updateSummary()">
        </div>
        <div class="form-group">
            <label>Payment Method</label>
            <select class="method-select" onchange="calculateFees('${rowId}')">
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Venmo">Venmo</option>
            </select>
        </div>
        <div class="form-group">
            <label>Processing Fee</label>
            <input type="number" class="fee-input" step="0.01" min="0" value="0.00" readonly>
        </div>
        <div class="form-group">
            <button class="btn btn-danger" onclick="removePaymentRow('${rowId}')">🗑️</button>
        </div>
    `;
    
    container.appendChild(row);
    updateSummary();
}

// Remove payment row
function removePaymentRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        updateSummary();
    }
}

// Calculate processing fees based on payment method
function calculateFees(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    
    const method = row.querySelector('.method-select').value;
    const amountInput = row.querySelector('.amount-input');
    const feeInput = row.querySelector('.fee-input');
    
    const amount = parseFloat(amountInput.value) || 0;
    let fee = 0;
    
    // Calculate fees (typical rates)
    switch (method) {
        case 'Credit Card':
            fee = amount * 0.029 + 0.30; // 2.9% + $0.30
            break;
        case 'PayPal':
            fee = amount * 0.0349 + 0.49; // 3.49% + $0.49
            break;
        case 'Venmo':
            fee = amount * 0.019; // 1.9% for business
            break;
        default:
            fee = 0; // Cash and Check have no fees
    }
    
    feeInput.value = fee.toFixed(2);
    updateSummary();
}

// Update summary panel
function updateSummary() {
    const rows = document.querySelectorAll('.payment-row');
    let count = 0;
    let totalAmount = 0;
    let totalFees = 0;
    
    rows.forEach(row => {
        const memberSelect = row.querySelector('.member-select');
        const amountInput = row.querySelector('.amount-input');
        const feeInput = row.querySelector('.fee-input');
        
        if (memberSelect.value && amountInput.value) {
            count++;
            totalAmount += parseFloat(amountInput.value) || 0;
            totalFees += parseFloat(feeInput.value) || 0;
        }
    });
    
    document.getElementById('paymentCount').textContent = count;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    document.getElementById('totalFees').textContent = `$${totalFees.toFixed(2)}`;
}

// Save all payments
async function saveAllPayments() {
    const rows = document.querySelectorAll('.payment-row');
    const payments = [];
    
    // Collect and validate all payments
    for (const row of rows) {
        const memberSelect = row.querySelector('.member-select');
        const amountInput = row.querySelector('.amount-input');
        const methodSelect = row.querySelector('.method-select');
        const feeInput = row.querySelector('.fee-input');
        
        const memberId = memberSelect.value;
        const amount = parseFloat(amountInput.value);
        
        if (!memberId) continue; // Skip empty rows
        
        if (!amount || amount <= 0) {
            alert('Please enter valid amounts for all payments');
            amountInput.focus();
            return;
        }
        
        const member = members.find(m => m.id === memberId);
        const fee = parseFloat(feeInput.value) || 0;
        
        payments.push({
            memberId: memberId,
            memberName: member.name,
            amount: amount,
            method: methodSelect.value,
            fee: fee,
            actualReceived: amount - fee
        });
    }
    
    if (payments.length === 0) {
        alert('Please add at least one payment');
        return;
    }
    
    // Confirm before saving
    const confirmation = confirm(
        `Save ${payments.length} payment${payments.length !== 1 ? 's' : ''}?\n\n` +
        `Total: $${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}\n` +
        `Net (after fees): $${payments.reduce((sum, p) => sum + p.actualReceived, 0).toFixed(2)}`
    );
    
    if (!confirmation) return;
    
    try {
        // Process all payments
        const batch = db.batch();
        const recordedDate = firebase.firestore.Timestamp.now();
        
        for (const payment of payments) {
            const memberRef = db.collection('members').doc(payment.memberId);
            
            // Add payment to member's payments array
            batch.update(memberRef, {
                payments: firebase.firestore.FieldValue.arrayUnion({
                    expectedAmount: payment.amount,
                    actualReceived: payment.actualReceived,
                    method: payment.method,
                    processingFee: payment.fee,
                    recordedDate: recordedDate,
                    receiptSent: false,
                    receiptSentDate: null
                })
            });
            
            // Log to communications
            const commRef = db.collection('communications').doc();
            batch.set(commRef, {
                memberId: payment.memberId,
                memberName: payment.memberName,
                type: 'Payment',
                subject: 'Membership Payment Recorded',
                message: `Payment of $${payment.amount.toFixed(2)} received via ${payment.method}`,
                date: recordedDate,
                sentBy: 'Admin'
            });
        }
        
        // Commit batch
        await batch.commit();
        
        alert(`✅ Successfully saved ${payments.length} payment${payments.length !== 1 ? 's' : ''}!`);
        
        // Clear all
        clearAll();
        
    } catch (error) {
        console.error('Error saving payments:', error);
        alert('Error saving payments: ' + error.message);
    }
}

// Clear all payment rows
function clearAll() {
    if (!confirm('Clear all payments? This cannot be undone.')) {
        return;
    }
    
    const container = document.getElementById('paymentsList');
    container.innerHTML = '';
    paymentRowCounter = 0;
    addPaymentRow();
    updateSummary();
}
