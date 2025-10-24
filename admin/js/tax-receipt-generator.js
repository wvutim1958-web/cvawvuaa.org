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
    let donationNotes = document.getElementById('donationNotes').value;
    
    // Automatically add scholarship note if donation type is Scholarship Fund
    if (donationType === 'Scholarship Fund') {
        const scholarshipNote = 'Blake E. Fought Memorial Scholarship/3S844';
        if (donationNotes) {
            // Add scholarship note if not already present
            if (!donationNotes.includes(scholarshipNote)) {
                donationNotes = scholarshipNote + ' - ' + donationNotes;
            }
        } else {
            donationNotes = scholarshipNote;
        }
    }
    
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
    
    // Create receipt URL (we'll save to Firebase and create a viewer)
    const receiptURL = `https://cvawvuaa.org/admin/tax-receipt-viewer.html?receipt=${currentReceipt.receiptNumber}`;
    
    const subject = encodeURIComponent(`Tax-Deductible Donation Receipt - ${currentReceipt.receiptNumber}`);
    
    // Create both plain text and HTML-friendly email
    const emailBody = encodeURIComponent(
        `Dear ${currentReceipt.donorName},\n\n` +
        `Thank you for your generous donation to the Central Virginia Chapter of the WVU Alumni Association!\n\n` +
        `Your official tax-deductible receipt is available at:\n` +
        `${receiptURL}\n\n` +
        `RECEIPT SUMMARY\n` +
        `Receipt Number: ${currentReceipt.receiptNumber}\n` +
        `Date: ${formatDate(new Date(currentReceipt.donationDate))}\n` +
        `Donation Type: ${currentReceipt.donationType}\n` +
        `Amount: $${currentReceipt.donationAmount.toFixed(2)}\n` +
        `Payment Method: ${currentReceipt.paymentMethod}\n\n` +
        `TAX INFORMATION\n` +
        `The Central Virginia Chapter of the WVU Alumni Association is recognized as a 501(c)(3) tax-exempt organization.\n` +
        `EIN: 54-1991299\n` +
        `Your contribution is tax-deductible to the extent allowed by law.\n` +
        `No goods or services were provided in exchange for this donation.\n\n` +
        `${currentReceipt.donationNotes ? `Notes: ${currentReceipt.donationNotes}\n\n` : ''}` +
        `You can view, print, or save your official receipt using the link above.\n\n` +
        `Thank you for your generous support!\n\n` +
        `Let's Go! Mountaineers!!!!\n\n` +
        `Central Virginia Chapter\n` +
        `West Virginia University Alumni Association\n` +
        `cvcwvuaa@gmail.com\n` +
        `https://cvawvuaa.org`
    );
    
    const mailtoLink = `mailto:${currentReceipt.donorEmail || ''}?subject=${subject}&body=${emailBody}`;
    
    // Save receipt to Firebase for URL access
    saveReceiptToFirebase();
    
    window.location.href = mailtoLink;
    
    alert('📧 Email client opened!\n\n⚠️ IMPORTANT: Please send this email from cvcwvuaa@gmail.com\n\nThe email includes:\n✓ Link to official receipt\n✓ Receipt summary\n✓ Tax information\n\nReview and click Send.');
}

// Show HTML Email Code Modal
function showHTMLEmail() {
    if (!currentReceipt) {
        alert('No receipt to generate HTML for. Please generate a receipt first.');
        return;
    }
    
    const receiptURL = `https://cvawvuaa.org/admin/tax-receipt-viewer.html?receipt=${currentReceipt.receiptNumber}`;
    
    const htmlCode = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax-Deductible Donation Receipt</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #003057, #1e40af); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                            <h1 style="margin: 0 0 10px; font-size: 24px;">Central Virginia Chapter</h1>
                            <p style="margin: 0; font-size: 16px;">West Virginia University Alumni Association</p>
                            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Official Tax-Deductible Donation Receipt</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Dear ${currentReceipt.donorName},</p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #333;">Thank you for your generous donation to the Central Virginia Chapter of the WVU Alumni Association!</p>
                            
                            <!-- Receipt Number Box -->
                            <div style="background: #f8f9fa; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; color: #666; font-weight: 600;">RECEIPT NUMBER</p>
                                <p style="margin: 5px 0 0; font-size: 18px; color: #003057; font-weight: bold;">${currentReceipt.receiptNumber}</p>
                            </div>
                            
                            <!-- Donation Details Table -->
                            <table width="100%" cellpadding="10" cellspacing="0" border="0" style="margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 8px;">
                                <tr style="background-color: #f8f9fa;">
                                    <td colspan="2" style="padding: 15px; border-bottom: 2px solid #003057;">
                                        <h3 style="margin: 0; color: #003057; font-size: 16px;">Donation Details</h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #333; width: 40%;">Date:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666;">${formatDate(new Date(currentReceipt.donationDate))}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #333;">Donation Type:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #666;">${currentReceipt.donationType}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #333;">Amount:</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; color: #10b981; font-size: 20px; font-weight: bold;">$${currentReceipt.donationAmount.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; font-weight: 600; color: #333;">Payment Method:</td>
                                    <td style="padding: 10px; color: #666;">${currentReceipt.paymentMethod}</td>
                                </tr>
                                ${currentReceipt.donationNotes ? `
                                <tr>
                                    <td style="padding: 10px; font-weight: 600; color: #333; vertical-align: top;">Notes:</td>
                                    <td style="padding: 10px; color: #666;">${currentReceipt.donationNotes}</td>
                                </tr>
                                ` : ''}
                            </table>
                            
                            <!-- Tax Information -->
                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 10px; font-weight: 600; color: #856404; font-size: 14px;">IRS Tax Deduction Information</p>
                                <p style="margin: 0 0 10px; font-size: 14px; color: #333; line-height: 1.6;">
                                    The Central Virginia Chapter of the WVU Alumni Association is recognized as a 501(c)(3) tax-exempt organization. 
                                    Your contribution is tax-deductible to the extent allowed by law.
                                </p>
                                <p style="margin: 0 0 10px; font-size: 14px; color: #333;"><strong>EIN: 54-1991299</strong></p>
                                <p style="margin: 0; font-size: 14px; color: #333;">No goods or services were provided in exchange for this donation.</p>
                            </div>
                            
                            <!-- View Receipt Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${receiptURL}" style="display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    📄 View Official Receipt
                                </a>
                                <p style="margin: 10px 0 0; font-size: 12px; color: #666;">Click to view, print, or save your official tax receipt</p>
                            </div>
                            
                            <p style="margin: 30px 0 10px; font-size: 16px; color: #333;">Thank you for your generous support! Your contribution helps us provide scholarships to deserving students and build a strong WVU community in Central Virginia.</p>
                            
                            <p style="margin: 20px 0 0; font-size: 16px; color: #003057; font-weight: bold;">Let's Go! Mountaineers!!!!</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 5px; font-size: 14px; color: #666; font-weight: 600;">Central Virginia Chapter</p>
                            <p style="margin: 0 0 5px; font-size: 14px; color: #666;">West Virginia University Alumni Association</p>
                            <p style="margin: 0 0 10px; font-size: 14px; color: #666;">Richmond, Virginia</p>
                            <p style="margin: 0; font-size: 14px; color: #10b981;">
                                <a href="mailto:cvcwvuaa@gmail.com" style="color: #10b981; text-decoration: none;">cvcwvuaa@gmail.com</a> | 
                                <a href="https://cvawvuaa.org" style="color: #10b981; text-decoration: none;">cvawvuaa.org</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    
    // Save receipt to Firebase first
    saveReceiptToFirebase();
    
    // Display in modal
    document.getElementById('htmlCodeTextarea').value = htmlCode;
    document.getElementById('htmlEmailModal').style.display = 'block';
}

// Copy HTML code to clipboard
function copyHTMLCode() {
    const textarea = document.getElementById('htmlCodeTextarea');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        alert('✅ HTML code copied to clipboard!\n\nYou can now paste it into your email client.');
    } catch (err) {
        alert('❌ Failed to copy. Please manually select and copy the code.');
    }
}

// Close HTML modal
function closeHTMLModal() {
    document.getElementById('htmlEmailModal').style.display = 'none';
}

// Save receipt to Firebase for URL-based viewing
async function saveReceiptToFirebase() {
    if (!currentReceipt) return;
    
    try {
        await db.collection('taxReceipts').doc(currentReceipt.receiptNumber).set({
            ...currentReceipt,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: 'Admin'
        });
        console.log('Receipt saved to Firebase:', currentReceipt.receiptNumber);
    } catch (error) {
        console.error('Error saving receipt to Firebase:', error);
    }
}

// Set default date to today
document.getElementById('donationDate').valueAsDate = new Date();

// Load members on page load
loadMembers();
