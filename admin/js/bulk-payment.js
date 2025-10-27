// Firebase is initialized by firebase-config.js
// db is already declared there

let allMembers = [];
let paymentRowCounter = 0;

// Load all members on page load
async function loadMembers() {
    try {
        const snapshot = await db.collection('members').get();
        allMembers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Sort alphabetically
        allMembers.sort((a, b) => {
            const nameA = `${a.lastName}, ${a.firstName}`.toLowerCase();
            const nameB = `${b.lastName}, ${b.firstName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        console.log(`Loaded ${allMembers.length} members`);
        
        // Add first payment row
        addPaymentRow();
        
    } catch (error) {
        console.error('Error loading members:', error);
        alert('Error loading members. Please refresh the page.');
    }
}

// Add a new payment row
function addPaymentRow() {
    if (allMembers.length === 0) {
        alert('Members are still loading. Please wait a moment.');
        return;
    }
    
    paymentRowCounter++;
    const rowId = `row-${paymentRowCounter}`;
    
    const container = document.getElementById('paymentsContainer');
    const row = document.createElement('div');
    row.className = 'payment-row';
    row.id = rowId;
    row.innerHTML = `
        <div class="member-select">
            <input 
                type="text" 
                placeholder="Search member name..." 
                id="${rowId}-search"
                autocomplete="off"
                oninput="filterMembers('${rowId}')"
                onfocus="showSuggestions('${rowId}')"
            >
            <div class="member-suggestions" id="${rowId}-suggestions"></div>
            <input type="hidden" id="${rowId}-memberId">
        </div>
        
        <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.25rem;">Membership Type</label>
            <select id="${rowId}-type" onchange="updateExpectedAmount('${rowId}')">
                <option value="">Select Type</option>
                <option value="Individual" data-amount="50">Individual ($50)</option>
                <option value="Life" data-amount="500">Life ($500)</option>
                <option value="Chapter Donation" data-amount="0">Chapter Donation</option>
                <option value="Scholarship Donation" data-amount="0">Scholarship Donation</option>
            </select>
        </div>
        
        <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.25rem;">Amount</label>
            <input 
                type="number" 
                id="${rowId}-amount" 
                placeholder="0.00" 
                step="0.01"
                oninput="updateSummary()"
            >
        </div>
        
        <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.25rem;">Fee</label>
            <input 
                type="number" 
                id="${rowId}-fee" 
                placeholder="0.00" 
                step="0.01"
                oninput="updateSummary()"
            >
        </div>
        
        <div>
            <label style="display: block; font-size: 0.85rem; margin-bottom: 0.25rem;">Received</label>
            <input 
                type="number" 
                id="${rowId}-received" 
                placeholder="0.00" 
                step="0.01"
                readonly
                style="background: #e9ecef;"
            >
        </div>
        
        <button class="btn-remove" onclick="removePaymentRow('${rowId}')">🗑️</button>
    `;
    
    container.appendChild(row);
    updateSummary();
}

// Remove a payment row
function removePaymentRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
        updateSummary();
    }
}

// Filter members based on search input
function filterMembers(rowId) {
    const searchInput = document.getElementById(`${rowId}-search`);
    const searchTerm = searchInput.value.toLowerCase();
    const suggestionsDiv = document.getElementById(`${rowId}-suggestions`);
    
    if (searchTerm.length === 0) {
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.classList.remove('active');
        return;
    }
    
    const filtered = allMembers.filter(member => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const reverseName = `${member.lastName} ${member.firstName}`.toLowerCase();
        return fullName.includes(searchTerm) || reverseName.includes(searchTerm);
    });
    
    if (filtered.length === 0) {
        suggestionsDiv.innerHTML = '<div class="suggestion-item" style="color: #999;">No members found</div>';
        suggestionsDiv.classList.add('active');
        return;
    }
    
    suggestionsDiv.innerHTML = filtered.map(member => `
        <div class="suggestion-item" onclick="selectMember('${rowId}', '${member.id}')">
            ${escapeHtml(member.firstName)} ${escapeHtml(member.lastName)} - ${escapeHtml(member.email || 'No email')}
        </div>
    `).join('');
    
    suggestionsDiv.classList.add('active');
}

// Show all members when focusing on search
function showSuggestions(rowId) {
    const searchInput = document.getElementById(`${rowId}-search`);
    if (searchInput.value.length === 0) {
        const suggestionsDiv = document.getElementById(`${rowId}-suggestions`);
        suggestionsDiv.innerHTML = allMembers.slice(0, 10).map(member => `
            <div class="suggestion-item" onclick="selectMember('${rowId}', '${member.id}')">
                ${escapeHtml(member.firstName)} ${escapeHtml(member.lastName)} - ${escapeHtml(member.email || 'No email')}
            </div>
        `).join('');
        suggestionsDiv.classList.add('active');
    }
}

// Select a member from suggestions
function selectMember(rowId, memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Set the search input to member name
    document.getElementById(`${rowId}-search`).value = `${member.firstName} ${member.lastName}`;
    
    // Store member ID
    document.getElementById(`${rowId}-memberId`).value = memberId;
    
    // Hide suggestions
    document.getElementById(`${rowId}-suggestions`).classList.remove('active');
    
    // Set membership type if available
    const typeSelect = document.getElementById(`${rowId}-type`);
    if (member.membershipType) {
        typeSelect.value = member.membershipType;
        updateExpectedAmount(rowId);
    }
}

// Update expected amount when membership type changes
function updateExpectedAmount(rowId) {
    const typeSelect = document.getElementById(`${rowId}-type`);
    const amountInput = document.getElementById(`${rowId}-amount`);
    
    const selectedOption = typeSelect.options[typeSelect.selectedIndex];
    const expectedAmount = selectedOption.getAttribute('data-amount');
    
    if (expectedAmount && parseFloat(expectedAmount) > 0) {
        amountInput.value = expectedAmount;
        
        // Calculate fee (PayPal: 2.89% + $0.49)
        const amount = parseFloat(expectedAmount);
        const paymentMethod = document.getElementById('paymentMethod').value;
        let fee = 0;
        
        if (paymentMethod === 'PayPal' || paymentMethod === 'Venmo') {
            fee = (amount * 0.0289) + 0.49;
        }
        
        const feeInput = document.getElementById(`${rowId}-fee`);
        feeInput.value = fee.toFixed(2);
        
        // Calculate received amount
        const receivedInput = document.getElementById(`${rowId}-received`);
        receivedInput.value = (amount - fee).toFixed(2);
    }
    
    updateSummary();
}

// Update summary totals
function updateSummary() {
    const rows = document.querySelectorAll('.payment-row');
    let totalExpected = 0;
    let totalFees = 0;
    let totalReceived = 0;
    
    rows.forEach(row => {
        const rowId = row.id;
        const amountInput = document.getElementById(`${rowId}-amount`);
        const feeInput = document.getElementById(`${rowId}-fee`);
        const receivedInput = document.getElementById(`${rowId}-received`);
        
        const amount = parseFloat(amountInput?.value || 0);
        const fee = parseFloat(feeInput?.value || 0);
        
        totalExpected += amount;
        totalFees += fee;
        
        // Auto-calculate received amount
        const received = amount - fee;
        if (receivedInput) {
            receivedInput.value = received.toFixed(2);
        }
        totalReceived += received;
    });
    
    document.getElementById('totalExpected').textContent = formatCurrency(totalExpected);
    document.getElementById('totalFees').textContent = formatCurrency(totalFees);
    document.getElementById('totalReceived').textContent = formatCurrency(totalReceived);
    document.getElementById('paymentsCount').textContent = rows.length;
    
    // Check if total received matches deposit
    const depositInput = document.getElementById('totalDeposit');
    const depositAmount = parseFloat(depositInput.value || 0);
    
    if (depositAmount > 0 && Math.abs(totalReceived - depositAmount) > 0.01) {
        depositInput.style.borderColor = '#dc3545';
        depositInput.style.background = '#fff3cd';
    } else if (depositAmount > 0) {
        depositInput.style.borderColor = '#28a745';
        depositInput.style.background = '#d4edda';
    } else {
        depositInput.style.borderColor = '#ddd';
        depositInput.style.background = 'white';
    }
}

// Save all payments
async function saveAllPayments() {
    // Validate form
    const depositDate = document.getElementById('depositDate').value;
    const totalDeposit = parseFloat(document.getElementById('totalDeposit').value || 0);
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!depositDate) {
        alert('Please enter a deposit date.');
        return;
    }
    
    if (totalDeposit <= 0) {
        alert('Please enter a valid total deposit amount.');
        return;
    }
    
    // Get all payment rows
    const rows = document.querySelectorAll('.payment-row');
    if (rows.length === 0) {
        alert('Please add at least one member payment.');
        return;
    }
    
    const payments = [];
    let hasErrors = false;
    
    rows.forEach((row, index) => {
        const rowId = row.id;
        const memberId = document.getElementById(`${rowId}-memberId`).value;
        const memberName = document.getElementById(`${rowId}-search`).value;
        const type = document.getElementById(`${rowId}-type`).value;
        const amount = parseFloat(document.getElementById(`${rowId}-amount`).value || 0);
        const fee = parseFloat(document.getElementById(`${rowId}-fee`).value || 0);
        const received = parseFloat(document.getElementById(`${rowId}-received`).value || 0);
        
        if (!memberId) {
            alert(`Row ${index + 1}: Please select a member.`);
            hasErrors = true;
            return;
        }
        
        if (!type) {
            alert(`Row ${index + 1}: Please select a membership type.`);
            hasErrors = true;
            return;
        }
        
        if (amount <= 0) {
            alert(`Row ${index + 1}: Please enter a valid amount.`);
            hasErrors = true;
            return;
        }
        
        payments.push({
            memberId,
            memberName,
            type,
            amount,
            fee,
            received,
            date: depositDate,
            method: paymentMethod
        });
    });
    
    if (hasErrors) {
        return;
    }
    
    // Check total
    const totalReceived = payments.reduce((sum, p) => sum + p.received, 0);
    if (Math.abs(totalReceived - totalDeposit) > 0.01) {
        const proceed = confirm(
            `Warning: Total received ($${totalReceived.toFixed(2)}) does not match deposit ($${totalDeposit.toFixed(2)}).\n\n` +
            `Difference: $${Math.abs(totalReceived - totalDeposit).toFixed(2)}\n\n` +
            `Do you want to proceed anyway?`
        );
        if (!proceed) {
            return;
        }
    }
    
    // Save payments
    try {
        const saveButton = event.target;
        saveButton.disabled = true;
        saveButton.textContent = '💾 Saving...';
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        for (const payment of payments) {
            try {
                const memberRef = db.collection('members').doc(payment.memberId);
                const memberDoc = await memberRef.get();
                
                if (!memberDoc.exists) {
                    throw new Error(`Member ${payment.memberName} not found`);
                }
                
                const memberData = memberDoc.data();
                const currentPayments = memberData.payments || [];
                
                // Create payment record (matching member database format)
                const paymentRecord = {
                    date: payment.date,
                    expectedAmount: payment.amount,
                    actualReceived: payment.received,
                    type: payment.type,
                    paymentMethod: payment.method,
                    recordedDate: firebase.firestore.Timestamp.now(),
                    receiptSent: false,
                    receiptSentDate: null,
                    notes: `Bulk payment entry via ${payment.method}`
                };
                
                // Add to member's payments array
                await memberRef.update({
                    payments: firebase.firestore.FieldValue.arrayUnion(paymentRecord),
                    lastPaymentDate: payment.date,
                    membershipStatus: 'Active'
                });
                
                // Log communication
                try {
                    await db.collection('communications').add({
                        memberId: payment.memberId,
                        type: 'receipt',
                        details: `Payment received: ${payment.type} - $${payment.amount.toFixed(2)} via ${payment.method}`,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        sentBy: 'Bulk Payment System',
                        method: payment.method,
                        amount: payment.amount,
                        metadata: {
                            receiptUrl: paymentRecord.receiptUrl,
                            processingFee: payment.fee,
                            netAmount: payment.received
                        }
                    });
                } catch (commError) {
                    console.error('Error logging communication:', commError);
                }
                
                successCount++;
                console.log(`Saved payment for ${payment.memberName}`);
                
            } catch (error) {
                console.error(`Error saving payment for ${payment.memberName}:`, error);
                errors.push(`${payment.memberName}: ${error.message}`);
                errorCount++;
            }
        }
        
        // Show results
        if (errorCount === 0) {
            alert(`✅ Success! Saved ${successCount} payments.`);
            
            // Ask about emailing receipts
            const emailReceipts = confirm('Would you like to email receipts to all members?');
            if (emailReceipts) {
                emailAllReceipts(payments);
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            alert(
                `⚠️ Partially complete:\n\n` +
                `✅ Saved: ${successCount}\n` +
                `❌ Failed: ${errorCount}\n\n` +
                `Errors:\n${errors.join('\n')}`
            );
        }
        
    } catch (error) {
        console.error('Error saving payments:', error);
        alert('Error saving payments. Please try again.');
        
    } finally {
        const saveButton = event.target;
        saveButton.disabled = false;
        saveButton.textContent = '💾 Save All Payments';
    }
}

// Email all receipts
function emailAllReceipts(payments) {
    const recipients = [];
    
    payments.forEach(payment => {
        const member = allMembers.find(m => m.id === payment.memberId);
        if (member && member.email) {
            recipients.push(member.email);
        }
    });
    
    if (recipients.length === 0) {
        alert('No members have email addresses on file.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    const subject = encodeURIComponent('Your Payment Receipt - Central Virginia Chapter WVUAA');
    const body = encodeURIComponent(
        `Dear Member,\n\n` +
        `Thank you for your payment to the Central Virginia Chapter of the WVU Alumni Association.\n\n` +
        `Your receipt is available in our member system. If you need a copy, please contact us.\n\n` +
        `Thank you for your continued support!\n\n` +
        `Let's Go! Mountaineers!!!!\n\n` +
        `Central Virginia Chapter\n` +
        `West Virginia University Alumni Association`
    );
    
    const mailtoLink = `mailto:${recipients.join(',')}?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

// Helper functions
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

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.member-select')) {
        document.querySelectorAll('.member-suggestions').forEach(div => {
            div.classList.remove('active');
        });
    }
});

// Set default date to today
document.getElementById('depositDate').valueAsDate = new Date();

// Load members on page load
loadMembers();

// Update summary when payment method changes (affects fees)
document.getElementById('paymentMethod').addEventListener('change', () => {
    const rows = document.querySelectorAll('.payment-row');
    rows.forEach(row => {
        const rowId = row.id;
        updateExpectedAmount(rowId);
    });
});

// Update summary when total deposit changes
document.getElementById('totalDeposit').addEventListener('input', updateSummary);
