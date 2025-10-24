// Tax Receipt Generator - Generate official 501(c)(3) tax-deductible donation receipts

let currentReceipt = null;

// Load members on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadMembers();
    setDefaultDate();
});

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('donationDate').value = today;
}

// Load all members into dropdown
async function loadMembers() {
    try {
        const membersSnapshot = await db.collection('members')
            .orderBy('name')
            .get();
        
        const select = document.getElementById('donorSelect');
        select.innerHTML = '<option value="">-- Select Member --</option>';
        
        membersSnapshot.forEach(doc => {
            const member = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = member.name;
            option.dataset.email = member.email || '';
            option.dataset.address = member.address || '';
            option.dataset.city = member.city || '';
            option.dataset.state = member.state || '';
            option.dataset.zip = member.zip || '';
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading members:', error);
        alert('Error loading member list');
    }
}

// Generate receipt number (format: TAX-YYYY-NNNNNN)
async function generateReceiptNumber() {
    const year = new Date().getFullYear();
    
    try {
        // Get all receipts for this year
        const receiptsSnapshot = await db.collection('taxReceipts')
            .where('receiptNumber', '>=', `TAX-${year}-`)
            .where('receiptNumber', '<', `TAX-${year + 1}-`)
            .orderBy('receiptNumber', 'desc')
            .limit(1)
            .get();
        
        let nextNumber = 1;
        
        if (!receiptsSnapshot.empty) {
            const lastReceipt = receiptsSnapshot.docs[0].data();
            const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2]);
            nextNumber = lastNumber + 1;
        }
        
        return `TAX-${year}-${String(nextNumber).padStart(6, '0')}`;
    } catch (error) {
        console.error('Error generating receipt number:', error);
        // Fallback to timestamp-based number
        return `TAX-${year}-${Date.now().toString().slice(-6)}`;
    }
}

// Generate receipt preview
async function generateReceipt() {
    // Validate form
    const donorSelect = document.getElementById('donorSelect');
    const donationDate = document.getElementById('donationDate');
    const donationType = document.getElementById('donationType');
    const donationAmount = document.getElementById('donationAmount');
    const donationMethod = document.getElementById('donationMethod');
    const donationNotes = document.getElementById('donationNotes');
    
    if (!donorSelect.value) {
        alert('Please select a donor');
        donorSelect.focus();
        return;
    }
    
    if (!donationDate.value) {
        alert('Please enter donation date');
        donationDate.focus();
        return;
    }
    
    if (!donationType.value) {
        alert('Please select donation type');
        donationType.focus();
        return;
    }
    
    const amount = parseFloat(donationAmount.value);
    if (!amount || amount <= 0) {
        alert('Please enter a valid donation amount');
        donationAmount.focus();
        return;
    }
    
    // Get donor info
    const selectedOption = donorSelect.options[donorSelect.selectedIndex];
    const donorName = selectedOption.textContent;
    const donorEmail = selectedOption.dataset.email;
    const donorAddress = selectedOption.dataset.address;
    const donorCity = selectedOption.dataset.city;
    const donorState = selectedOption.dataset.state;
    const donorZip = selectedOption.dataset.zip;
    
    // Generate receipt number
    const receiptNumber = await generateReceiptNumber();
    
    // Format address
    let fullAddress = donorAddress;
    if (donorCity || donorState || donorZip) {
        fullAddress += `\n${donorCity}, ${donorState} ${donorZip}`;
    }
    if (!fullAddress.trim()) {
        fullAddress = 'Address not on file';
    }
    
    // Store current receipt data
    currentReceipt = {
        receiptNumber: receiptNumber,
        memberId: donorSelect.value,
        memberName: donorName,
        memberEmail: donorEmail,
        memberAddress: fullAddress,
        donationType: donationType.value,
        donationAmount: amount,
        donationDate: donationDate.value,
        paymentMethod: donationMethod.value,
        notes: donationNotes.value,
        createdDate: new Date().toISOString()
    };
    
    // Update receipt preview
    document.getElementById('receiptNumber').textContent = receiptNumber;
    document.getElementById('receiptDate').textContent = formatDate(new Date());
    document.getElementById('receiptDonor').textContent = donorName;
    document.getElementById('receiptAddress').textContent = fullAddress.replace('\n', ', ');
    document.getElementById('receiptType').textContent = donationType.value;
    document.getElementById('receiptAmount').textContent = `$${amount.toFixed(2)}`;
    document.getElementById('receiptMethod').textContent = donationMethod.value;
    document.getElementById('signatureDate').textContent = formatDate(new Date());
    
    // Show notes if any
    const notesElement = document.getElementById('receiptNotes');
    if (donationNotes.value.trim()) {
        notesElement.textContent = `Notes: ${donationNotes.value}`;
        notesElement.style.display = 'block';
    } else {
        notesElement.style.display = 'none';
    }
    
    // Show receipt preview
    document.getElementById('receiptPreview').classList.add('active');
    document.getElementById('receiptPreview').scrollIntoView({ behavior: 'smooth' });
}

// Hide receipt preview
function hideReceipt() {
    document.getElementById('receiptPreview').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Save receipt to Firestore
async function saveReceipt() {
    if (!currentReceipt) {
        alert('No receipt to save');
        return;
    }
    
    if (!confirm('Save this receipt to permanent records?')) {
        return;
    }
    
    try {
        // Save to taxReceipts collection
        await db.collection('taxReceipts').add(currentReceipt);
        
        // Add to member's payments array with proper structure
        const memberRef = db.collection('members').doc(currentReceipt.memberId);
        const memberDoc = await memberRef.get();
        const currentPayments = memberDoc.data().payments || [];
        
        currentPayments.push({
            type: 'Donation',
            expectedAmount: currentReceipt.donationAmount,
            actualReceived: currentReceipt.donationAmount,
            paymentMethod: currentReceipt.paymentMethod,
            date: firebase.firestore.Timestamp.fromDate(new Date(currentReceipt.donationDate)),
            recordedDate: firebase.firestore.Timestamp.now(),
            notes: `Tax Receipt ${currentReceipt.receiptNumber} - ${currentReceipt.donationType}`,
            receiptSent: false,
            receiptSentDate: null,
            taxReceiptNumber: currentReceipt.receiptNumber
        });
        
        await memberRef.update({
            payments: currentPayments
        });
        
        // Log to communications
        await db.collection('communications').add({
            memberId: currentReceipt.memberId,
            memberName: currentReceipt.memberName,
            memberEmail: currentReceipt.memberEmail || '',
            type: 'tax_receipt',
            subject: `Tax Receipt ${currentReceipt.receiptNumber}`,
            details: `Tax-deductible donation receipt issued for $${currentReceipt.donationAmount.toFixed(2)} (${currentReceipt.donationType})`,
            timestamp: firebase.firestore.Timestamp.now(),
            sentBy: 'Admin',
            method: 'generated',
            taxDeductible: true,
            receiptNumber: currentReceipt.receiptNumber
        });
        
        alert(`✅ Receipt ${currentReceipt.receiptNumber} saved successfully!\n\nPayment has been added to member's record and will appear in Payment Tracking.`);
        
        // Reset form
        resetForm();
        hideReceipt();
        
    } catch (error) {
        console.error('Error saving receipt:', error);
        alert('Error saving receipt: ' + error.message);
    }
}

// Email receipt
function emailReceipt() {
    if (!currentReceipt) {
        alert('No receipt to email');
        return;
    }
    
    const subject = `Tax-Deductible Donation Receipt - ${currentReceipt.receiptNumber}`;
    const body = `Dear ${currentReceipt.memberName},

Thank you for your generous donation to the Central Virginia Chapter of the WVU Alumni Association!

OFFICIAL TAX RECEIPT
Receipt Number: ${currentReceipt.receiptNumber}

Donor Information:
${currentReceipt.memberName}
${currentReceipt.memberAddress}

Donation Details:
Date: ${formatDate(new Date(currentReceipt.donationDate))}
Type: ${currentReceipt.donationType}
Amount: $${currentReceipt.donationAmount.toFixed(2)}
Payment Method: ${currentReceipt.paymentMethod}

Tax Deduction Information:
The Central Virginia Chapter of the WVU Alumni Association is recognized as a 501(c)(3) tax-exempt organization. Your contribution is tax-deductible to the extent allowed by law.

EIN: 54-1991299

No goods or services were provided in exchange for this donation.

Thank you for your generous support of the Central Virginia Chapter WVU Alumni Association!

Best regards,
CVCWVUAA Treasurer`;
    
    const mailtoLink = `mailto:${currentReceipt.memberEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    alert('📧 Email client opened! Please send the receipt email.');
}

// Reset form
function resetForm() {
    document.getElementById('donorSelect').value = '';
    document.getElementById('donationType').value = '';
    document.getElementById('donationAmount').value = '';
    document.getElementById('donationMethod').value = 'Check';
    document.getElementById('donationNotes').value = '';
    setDefaultDate();
    currentReceipt = null;
}

// Format date helper
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
