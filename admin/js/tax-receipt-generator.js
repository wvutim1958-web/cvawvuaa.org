// Firebase is already initialized in firebase-config.js
// db is already available globally

let allMembers = [];
let currentReceipt = null;

// Load members
async function loadMembers() {
    try {
        const snapshot = await db.collection('members').get();
        allMembers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
        
        // Populate donor dropdown
        const select = document.getElementById('donorSelect');
        select.innerHTML = '<option value="">-- Select Member --</option>';
        allMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name || 'Unnamed Member';
            select.appendChild(option);
        });
        
        console.log(`Loaded ${allMembers.length} members`);
        
    } catch (error) {
        console.error('Error loading members:', error);
        alert('Error loading members. Please refresh the page.');
    }
}

// Generate receipt
function generateReceipt() {
    // Validate form
    const donorId = document.getElementById('donorSelect').value;
    const donationDate = document.getElementById('donationDate').value;
    const donationType = document.getElementById('donationType').value;
    const donationAmount = parseFloat(document.getElementById('donationAmount').value);
    const donationMethod = document.getElementById('donationMethod').value;
    const donationNotes = document.getElementById('donationNotes').value;
    
    if (!donorId) {
        alert('Please select a donor.');
        return;
    }
    
    if (!donationDate) {
        alert('Please enter a donation date.');
        return;
    }
    
    if (!donationType) {
        alert('Please select a donation type.');
        return;
    }
    
    if (!donationAmount || donationAmount <= 0) {
        alert('Please enter a valid donation amount.');
        return;
    }
    
    // Get donor info
    const donor = allMembers.find(m => m.id === donorId);
    if (!donor) {
        alert('Donor not found.');
        return;
    }
    
    // Generate receipt number
    const receiptNumber = `TAX-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    // Create receipt data
    currentReceipt = {
        receiptNumber,
        donorId: donor.id,
        donorName: donor.name || 'Unknown Donor',
        donorEmail: donor.email || '',
        donorAddress: formatAddress(donor),
        donationDate,
        donationType,
        donationAmount,
        donationMethod,
        donationNotes,
        generatedDate: new Date().toISOString(),
        generatedBy: 'Admin User'
    };
    
    // Populate receipt
    document.getElementById('receiptNumber').textContent = receiptNumber;
    document.getElementById('receiptDate').textContent = formatDate(new Date(donationDate));
    document.getElementById('receiptDonor').textContent = currentReceipt.donorName;
    document.getElementById('receiptAddress').textContent = currentReceipt.donorAddress;
    document.getElementById('receiptType').textContent = donationType;
    document.getElementById('receiptAmount').textContent = formatCurrency(donationAmount);
    document.getElementById('receiptMethod').textContent = donationMethod;
    document.getElementById('signatureDate').textContent = formatDate(new Date());
    
    const notesElement = document.getElementById('receiptNotes');
    if (donationNotes) {
        notesElement.textContent = `Note: ${donationNotes}`;
        notesElement.style.display = 'block';
    } else {
        notesElement.style.display = 'none';
    }
    
    // Show receipt
    document.getElementById('receiptPreview').classList.add('active');
    document.getElementById('receiptPreview').scrollIntoView({ behavior: 'smooth' });
}

// Hide receipt
function hideReceipt() {
    document.getElementById('receiptPreview').classList.remove('active');
    currentReceipt = null;
}

// Save receipt to records
async function saveReceipt() {
    if (!currentReceipt) {
        alert('No receipt to save.');
        return;
    }
    
    try {
        // Save to tax receipts collection
        await db.collection('taxReceipts').add({
            ...currentReceipt,
            savedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Add to member's payment history
        const donor = allMembers.find(m => m.id === currentReceipt.donorId);
        if (donor) {
            const payments = donor.payments || [];
            payments.push({
                date: currentReceipt.donationDate,
                expectedAmount: currentReceipt.donationAmount,
                actualReceived: currentReceipt.donationAmount,
                type: currentReceipt.donationType,
                paymentMethod: currentReceipt.donationMethod,
                recordedDate: firebase.firestore.Timestamp.now(),
                notes: `Tax receipt ${currentReceipt.receiptNumber}. ${currentReceipt.donationNotes || ''}`,
                taxReceipt: true,
                receiptNumber: currentReceipt.receiptNumber
            });
            
            await db.collection('members').doc(currentReceipt.donorId).update({
                payments: payments,
                lastModified: new Date()
            });
        }
        
        // Log communication
        await db.collection('communications').add({
            memberId: currentReceipt.donorId,
            type: 'receipt',
            details: `Tax receipt ${currentReceipt.receiptNumber} generated for ${currentReceipt.donationType} donation of $${currentReceipt.donationAmount.toFixed(2)}`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            sentBy: 'Admin User',
            method: 'Tax Receipt',
            amount: currentReceipt.donationAmount,
            metadata: {
                receiptNumber: currentReceipt.receiptNumber,
                donationType: currentReceipt.donationType,
                taxDeductible: true
            }
        });
        
        alert('✅ Receipt saved to records successfully!');
        
        // Reset form
        document.getElementById('donorSelect').value = '';
        document.getElementById('donationDate').value = '';
        document.getElementById('donationType').value = '';
        document.getElementById('donationAmount').value = '';
        document.getElementById('donationNotes').value = '';
        
        hideReceipt();
        
    } catch (error) {
        console.error('Error saving receipt:', error);
        alert('Error saving receipt: ' + error.message);
    }
}

// Format address
function formatAddress(member) {
    const parts = [];
    
    if (member.address) {
        parts.push(member.address);
    }
    
    if (member.city || member.zip) {
        const cityState = [member.city, 'VA', member.zip].filter(Boolean).join(', ');
        if (cityState) {
            parts.push(cityState);
        }
    }
    
    return parts.join(', ') || 'Address not on file';
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Email receipt
function emailReceipt() {
    if (!currentReceipt) {
        alert('No receipt to email. Please generate a receipt first.');
        return;
    }
    
    const subject = `Tax-Deductible Donation Receipt - ${currentReceipt.receiptNumber}`;
    const body = `Dear ${currentReceipt.donorName},

Thank you for your generous donation to the Central Virginia Chapter of the WVU Alumni Association!

OFFICIAL TAX RECEIPT
Receipt Number: ${currentReceipt.receiptNumber}

Donor Information:
${currentReceipt.donorName}
${currentReceipt.donorAddress}

Donation Details:
Date: ${formatDate(new Date(currentReceipt.donationDate))}
Type: ${currentReceipt.donationType}
Amount: $${currentReceipt.donationAmount.toFixed(2)}
Payment Method: ${currentReceipt.paymentMethod}

Tax Deduction Information:
The Central Virginia Chapter of the WVU Alumni Association is recognized as a 501(c)(3) tax-exempt organization. Your contribution is tax-deductible to the extent allowed by law.

EIN: 54-1991299

No goods or services were provided in exchange for this donation.

${currentReceipt.notes ? `Notes: ${currentReceipt.notes}\n\n` : ''}Thank you for your generous support of the Central Virginia Chapter WVU Alumni Association!

Best regards,
CVCWVUAA Treasurer
cvcwvuaa@gmail.com
https://cvawvuaa.org`;
    
    const mailtoLink = `mailto:${currentReceipt.donorEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    alert('📧 Email client opened! Please review and send the receipt email.');
}

// Set default date to today
document.getElementById('donationDate').valueAsDate = new Date();

// Load members on page load
loadMembers();
