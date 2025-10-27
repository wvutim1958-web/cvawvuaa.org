// Firebase is already initialized in firebase-config.js
// db is already available globally

let allReminders = [];
let allMembers = [];
let settings = {
    firstReminder: 30,
    secondReminder: 60,
    thirdReminder: 90
};

// Get current membership year boundaries
function getCurrentMembershipYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const julyFirst = new Date(currentYear, 6, 1); // Month is 0-indexed, so 6 = July
    
    if (now >= julyFirst) {
        return {
            start: julyFirst,
            end: new Date(currentYear + 1, 5, 30), // June 30 next year
            label: `${currentYear}-${currentYear + 1}`
        };
    } else {
        return {
            start: new Date(currentYear - 1, 6, 1),
            end: new Date(currentYear, 5, 30),
            label: `${currentYear - 1}-${currentYear}`
        };
    }
}

// Load settings
async function loadSettings() {
    try {
        const doc = await db.collection('settings').doc('duesReminders').get();
        if (doc.exists) {
            settings = doc.data();
            document.getElementById('firstReminder').value = settings.firstReminder;
            document.getElementById('secondReminder').value = settings.secondReminder;
            document.getElementById('thirdReminder').value = settings.thirdReminder;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings
async function saveSettings() {
    try {
        settings = {
            firstReminder: parseInt(document.getElementById('firstReminder').value),
            secondReminder: parseInt(document.getElementById('secondReminder').value),
            thirdReminder: parseInt(document.getElementById('thirdReminder').value),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('settings').doc('duesReminders').set(settings);
        alert('Settings saved successfully!');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings. Please try again.');
    }
}

// Load all data
async function loadAllData() {
    try {
        // Load reminders, members, and settings in parallel
        const [remindersSnapshot, membersSnapshot] = await Promise.all([
            db.collection('duesReminders').orderBy('scheduledDate', 'desc').get(),
            db.collection('members').get()
        ]);
        
        allReminders = remindersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        allMembers = membersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        await loadSettings();
        
        console.log(`Loaded ${allReminders.length} reminders, ${allMembers.length} members`);
        
        // Debug: Show sample member data structure
        if (allMembers.length > 0) {
            console.log('Sample member object:', allMembers[0]);
            console.log('Member email fields:', Object.keys(allMembers[0]).filter(k => k.toLowerCase().includes('email')));
        }
        
        renderReminders();
        updateStatistics();
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('remindersContainer').innerHTML = 
            '<div class="no-data">Error loading reminders. Please refresh the page.</div>';
    }
}

// Update statistics
function updateStatistics() {
    const pending = allReminders.filter(r => r.status === 'pending').length;
    
    // Count sent this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sentThisMonth = allReminders.filter(r => {
        if (r.status !== 'sent' || !r.sentDate) return false;
        const sentDate = r.sentDate.toDate ? r.sentDate.toDate() : new Date(r.sentDate);
        return sentDate >= firstOfMonth;
    }).length;
    
    const failed = allReminders.filter(r => r.status === 'failed').length;
    
    // Count members who need payment for current year
    const year = getCurrentMembershipYear();
    const needPayment = allMembers.filter(member => {
        const payments = member.payments || [];
        const hasCurrentYearPayment = payments.some(p => {
            const paymentDate = new Date(p.date);
            return paymentDate >= year.start && paymentDate <= year.end;
        });
        return !hasCurrentYearPayment;
    }).length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('sentCount').textContent = sentThisMonth;
    document.getElementById('failedCount').textContent = failed;
    document.getElementById('needPaymentCount').textContent = needPayment;
}

// Render reminders
function renderReminders() {
    const container = document.getElementById('remindersContainer');
    
    if (allReminders.length === 0) {
        container.innerHTML = '<div class="no-data">No reminders scheduled. Click "Generate New Reminders" to create them.</div>';
        return;
    }
    
    container.innerHTML = allReminders.map(reminder => {
        const member = allMembers.find(m => m.id === reminder.memberId);
        const memberName = member ? `${member.firstName} ${member.lastName}` : 'Unknown Member';
        const memberEmail = member?.email || 'No email';
        
        const scheduledDate = reminder.scheduledDate.toDate ? reminder.scheduledDate.toDate() : new Date(reminder.scheduledDate);
        const isPast = scheduledDate < new Date();
        
        return `
            <div class="reminder-item ${reminder.status}">
                <div class="reminder-header">
                    <div class="reminder-member">${escapeHtml(memberName)}</div>
                    <span class="reminder-status ${reminder.status}">${reminder.status}</span>
                </div>
                <div class="reminder-details">
                    <strong>Email:</strong> ${escapeHtml(memberEmail)}<br>
                    <strong>Type:</strong> ${reminder.reminderType || 'Standard'} Reminder<br>
                    <strong>Scheduled:</strong> ${formatDate(scheduledDate)} ${isPast && reminder.status === 'pending' ? '<span style="color: #ef4444;">(Overdue)</span>' : ''}<br>
                    ${reminder.sentDate ? `<strong>Sent:</strong> ${formatDate(reminder.sentDate.toDate ? reminder.sentDate.toDate() : new Date(reminder.sentDate))}<br>` : ''}
                    ${reminder.amountDue ? `<strong>Amount Due:</strong> $${reminder.amountDue.toFixed(2)}<br>` : ''}
                    ${reminder.error ? `<strong>Error:</strong> <span style="color: #ef4444;">${escapeHtml(reminder.error)}</span><br>` : ''}
                </div>
                <div class="reminder-actions">
                    ${reminder.status === 'pending' ? `
                        <button class="btn btn-small btn-success" onclick="sendReminder('${reminder.id}')">📧 Send Now</button>
                    ` : ''}
                    ${reminder.status === 'failed' ? `
                        <button class="btn btn-small btn-success" onclick="retryReminder('${reminder.id}')">🔄 Retry</button>
                    ` : ''}
                    <button class="btn btn-small btn-danger" onclick="deleteReminder('${reminder.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Generate new reminders
async function generateReminders() {
    if (!confirm('This will create reminders for all members with outstanding dues. Continue?')) {
        return;
    }
    
    try {
        const year = getCurrentMembershipYear();
        const yearStart = year.start;
        
        // Find members who haven't paid for current year
        const membersNeedingPayment = allMembers.filter(member => {
            const payments = member.payments || [];
            const hasCurrentYearPayment = payments.some(p => {
                const paymentDate = new Date(p.date);
                return paymentDate >= year.start && paymentDate <= year.end;
            });
            return !hasCurrentYearPayment && member.email;
        });
        
        if (membersNeedingPayment.length === 0) {
            alert('No members need reminders. All current members have paid!');
            return;
        }
        
        let created = 0;
        const batch = [];
        
        for (const member of membersNeedingPayment) {
            // Check if reminder already exists for this member this year
            const existingReminder = allReminders.find(r => 
                r.memberId === member.id && 
                r.membershipYear === year.label &&
                r.status === 'pending'
            );
            
            if (existingReminder) {
                continue; // Skip if already has pending reminder
            }
            
            // Determine reminder type based on time since year start
            const daysSinceStart = Math.floor((new Date() - yearStart) / (1000 * 60 * 60 * 24));
            let reminderType = 'First';
            let scheduledDays = settings.firstReminder;
            
            if (daysSinceStart >= settings.thirdReminder) {
                reminderType = 'Final';
                scheduledDays = settings.thirdReminder;
            } else if (daysSinceStart >= settings.secondReminder) {
                reminderType = 'Second';
                scheduledDays = settings.secondReminder;
            }
            
            const scheduledDate = new Date(yearStart);
            scheduledDate.setDate(scheduledDate.getDate() + scheduledDays);
            
            // Create reminder
            batch.push(
                db.collection('duesReminders').add({
                    memberId: member.id,
                    memberName: `${member.firstName} ${member.lastName}`,
                    memberEmail: member.email,
                    membershipYear: year.label,
                    reminderType: reminderType,
                    scheduledDate: firebase.firestore.Timestamp.fromDate(scheduledDate),
                    status: 'pending',
                    amountDue: member.membershipType === 'Life' ? 500 : (member.membershipType === 'Individual' ? 50 : 0),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            );
            
            created++;
        }
        
        await Promise.all(batch);
        
        alert(`✅ Created ${created} new reminders!`);
        loadAllData();
        
    } catch (error) {
        console.error('Error generating reminders:', error);
        alert('Error generating reminders. Please try again.');
    }
}

// Send single reminder
async function sendReminder(reminderId) {
    try {
        const reminder = allReminders.find(r => r.id === reminderId);
        if (!reminder) {
            throw new Error('Reminder not found');
        }
        
        const member = allMembers.find(m => m.id === reminder.memberId);
        if (!member || !member.email) {
            throw new Error('Member email not found');
        }
        
        // Create email content
        const firstName = member.firstName;
        const subject = encodeURIComponent(`${reminder.reminderType} Reminder: CVCWVUAA Membership Dues`);
        const body = encodeURIComponent(
            `Dear ${firstName},\n\n` +
            `This is a ${reminder.reminderType.toLowerCase()} reminder that your Central Virginia Chapter WVU Alumni Association membership dues are outstanding.\n\n` +
            `Amount Due: $${reminder.amountDue.toFixed(2)}\n` +
            `Membership Year: ${reminder.membershipYear}\n\n` +
            `You can pay online at: https://cvawvuaa.org/pay.html\n\n` +
            `Or mail a check to:\n` +
            `Central Virginia Chapter WVUAA\n` +
            `4701 Stoney Creek Parkway\n` +
            `Chester, VA 23831\n\n` +
            `Your continued support helps us provide scholarships and build our WVU community in Central Virginia.\n\n` +
            `If you have already paid, please disregard this reminder.\n\n` +
            `Let's Go! Mountaineers!!!!\n\n` +
            `Central Virginia Chapter\n` +
            `West Virginia University Alumni Association\n` +
            `cvcwvuaa@gmail.com`
        );
        
        // Open email client
        window.location.href = `mailto:${member.email}?subject=${subject}&body=${body}`;
        
        // Mark as sent
        await db.collection('duesReminders').doc(reminderId).update({
            status: 'sent',
            sentDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Log communication
        await db.collection('communications').add({
            memberId: member.id,
            type: 'reminder',
            details: `${reminder.reminderType} dues reminder sent for ${reminder.membershipYear}`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            sentBy: 'Admin User',
            method: 'Email',
            amount: reminder.amountDue,
            metadata: {
                reminderType: reminder.reminderType,
                membershipYear: reminder.membershipYear
            }
        });
        
        alert('✅ Reminder email opened. Marked as sent.');
        loadAllData();
        
    } catch (error) {
        console.error('Error sending reminder:', error);
        
        // Mark as failed
        await db.collection('duesReminders').doc(reminderId).update({
            status: 'failed',
            error: error.message,
            lastAttempt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Error sending reminder: ' + error.message);
        loadAllData();
    }
}

// Send all pending reminders
async function sendPendingReminders() {
    const pending = allReminders.filter(r => r.status === 'pending');
    
    if (pending.length === 0) {
        alert('No pending reminders to send.');
        return;
    }
    
    if (!confirm(`Send ${pending.length} pending reminders?`)) {
        return;
    }
    
    // Get all email addresses
    const emails = [];
    for (const reminder of pending) {
        const member = allMembers.find(m => m.id === reminder.memberId);
        if (member && member.email) {
            emails.push(member.email);
        }
    }
    
    if (emails.length === 0) {
        alert('No valid email addresses found.');
        return;
    }
    
    // Create batch email
    const subject = encodeURIComponent('Reminder: CVCWVUAA Membership Dues');
    const body = encodeURIComponent(
        `Dear Member,\n\n` +
        `This is a reminder that your Central Virginia Chapter WVU Alumni Association membership dues are outstanding.\n\n` +
        `You can pay online at: https://cvawvuaa.org/pay.html\n\n` +
        `Or mail a check to:\n` +
        `Central Virginia Chapter WVUAA\n` +
        `4701 Stoney Creek Parkway\n` +
        `Chester, VA 23831\n\n` +
        `Let's Go! Mountaineers!!!!\n\n` +
        `Central Virginia Chapter\n` +
        `West Virginia University Alumni Association`
    );
    
    window.location.href = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`;
    
    // Mark all as sent
    const batch = [];
    for (const reminder of pending) {
        batch.push(
            db.collection('duesReminders').doc(reminder.id).update({
                status: 'sent',
                sentDate: firebase.firestore.FieldValue.serverTimestamp()
            })
        );
        
        // Log communication
        const member = allMembers.find(m => m.id === reminder.memberId);
        if (member) {
            batch.push(
                db.collection('communications').add({
                    memberId: member.id,
                    type: 'reminder',
                    details: `Bulk dues reminder sent for ${reminder.membershipYear}`,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    sentBy: 'Admin User',
                    method: 'Email',
                    amount: reminder.amountDue,
                    metadata: {
                        reminderType: reminder.reminderType,
                        membershipYear: reminder.membershipYear,
                        bulkSend: true
                    }
                })
            );
        }
    }
    
    await Promise.all(batch);
    
    alert(`✅ Sent ${pending.length} reminders!`);
    loadAllData();
}

// Retry failed reminder
async function retryReminder(reminderId) {
    try {
        await db.collection('duesReminders').doc(reminderId).update({
            status: 'pending',
            error: null
        });
        
        alert('Reminder reset to pending. You can now send it again.');
        loadAllData();
        
    } catch (error) {
        console.error('Error retrying reminder:', error);
        alert('Error retrying reminder. Please try again.');
    }
}

// Delete reminder
async function deleteReminder(reminderId) {
    if (!confirm('Delete this reminder?')) {
        return;
    }
    
    try {
        await db.collection('duesReminders').doc(reminderId).delete();
        alert('Reminder deleted.');
        loadAllData();
        
    } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Error deleting reminder. Please try again.');
    }
}

// Show/hide custom email panel
function showCustomEmailPanel() {
    document.getElementById('customEmailPanel').style.display = 'block';
}

function hideCustomEmailPanel() {
    document.getElementById('customEmailPanel').style.display = 'none';
    document.getElementById('customEmailList').value = '';
}

// Send reminders to custom email list
async function sendToCustomEmails() {
    const emailText = document.getElementById('customEmailList').value.trim();
    
    if (!emailText) {
        alert('Please enter email addresses');
        return;
    }
    
    // Parse emails
    const emails = emailText
        .split(/[\n,]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.includes('@'));
    
    if (emails.length === 0) {
        alert('No valid email addresses found');
        return;
    }
    
    const confirmed = confirm(`Send dues reminders to ${emails.length} email address(es)?`);
    if (!confirmed) return;
    
    try {
        let sent = 0;
        let failed = 0;
        
        for (const email of emails) {
            // Find member in database
            const member = allMembers.find(m => m.email && m.email.toLowerCase() === email);
            
            if (!member) {
                console.log(`Member not found for email: ${email}`);
                failed++;
                continue;
            }
            
            // Create reminder document
            const reminder = {
                memberId: member.id,
                memberName: member.name || email,
                memberEmail: email,
                type: 'manual',
                scheduledDate: new Date(),
                sentDate: new Date(),
                status: 'sent',
                createdBy: 'admin',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('duesReminders').add(reminder);
            sent++;
        }
        
        alert(`Successfully sent ${sent} reminder(s).\n${failed > 0 ? `Failed: ${failed} (not in database)` : ''}`);
        hideCustomEmailPanel();
        loadAllData(); // Refresh the list
        
    } catch (error) {
        console.error('Error sending reminders:', error);
        alert('Error sending reminders: ' + error.message);
    }
}

// Helper functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data on page load
loadAllData();

