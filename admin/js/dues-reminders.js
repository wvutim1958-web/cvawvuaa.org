// Firebase is already initialized in firebase-config.js
// db is already available globally

let allReminders = [];
let allMembers = [];
let settings = {
    firstReminder: 30,
    secondReminder: 60,
    thirdReminder: 90
};

// Load all data on page load
async function loadAllData() {
    try {
        await Promise.all([
            loadSettings(),
            loadMembers(),
            loadReminders()
        ]);
        
        updateStats();
        displayReminders();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data. Please refresh the page.');
    }
}

// Get current membership year (July 1 - June 30)
function getCurrentMembershipYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const julyFirst = new Date(currentYear, 6, 1); // Month is 0-indexed
    
    let yearStart, yearEnd, yearLabel;
    
    if (now >= julyFirst) {
        // After July 1, we're in the current-next year
        yearStart = new Date(currentYear, 6, 1);
        yearEnd = new Date(currentYear + 1, 5, 30);
        yearLabel = `${currentYear}-${currentYear + 1}`;
    } else {
        // Before July 1, we're in the previous-current year
        yearStart = new Date(currentYear - 1, 6, 1);
        yearEnd = new Date(currentYear, 5, 30);
        yearLabel = `${currentYear - 1}-${currentYear}`;
    }
    
    return { yearStart, yearEnd, yearLabel };
}

// Load settings
async function loadSettings() {
    try {
        const doc = await db.collection('settings').doc('duesReminders').get();
        if (doc.exists) {
            settings = doc.data();
            document.getElementById('firstReminder').value = settings.firstReminder || 30;
            document.getElementById('secondReminder').value = settings.secondReminder || 60;
            document.getElementById('thirdReminder').value = settings.thirdReminder || 90;
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
            thirdReminder: parseInt(document.getElementById('thirdReminder').value)
        };
        
        await db.collection('settings').doc('duesReminders').set(settings);
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings. Please try again.');
    }
}

// Load members
async function loadMembers() {
    try {
        const snapshot = await db.collection('members').get();
        allMembers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Load reminders
async function loadReminders() {
    try {
        const { yearLabel } = getCurrentMembershipYear();
        const snapshot = await db.collection('duesReminders')
            .where('membershipYear', '==', yearLabel)
            .get();
        
        allReminders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => {
            // Sort by status (pending first), then by scheduled date
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        });
    } catch (error) {
        console.error('Error loading reminders:', error);
    }
}

// Generate reminders for members who haven't paid
async function generateReminders() {
    if (!confirm('Generate reminders for all members who haven\'t paid current year dues?')) {
        return;
    }
    
    try {
        const { yearStart, yearLabel } = getCurrentMembershipYear();
        const now = new Date();
        const daysSinceYearStart = Math.floor((now - yearStart) / (1000 * 60 * 60 * 24));
        
        // Find members who haven't paid for current year
        const unpaidMembers = allMembers.filter(member => {
            if (!member.payments || member.payments.length === 0) return true;
            
            // Check if they have a payment for current year
            const hasPaidThisYear = member.payments.some(payment => {
                const paymentDate = payment.recordedDate?.toDate?.() || new Date(payment.recordedDate);
                return paymentDate >= yearStart && payment.type === 'Dues';
            });
            
            return !hasPaidThisYear;
        });
        
        let created = 0;
        
        for (const member of unpaidMembers) {
            // Determine which reminder to send based on days since year start
            let reminderType, scheduledDate;
            
            if (daysSinceYearStart >= settings.thirdReminder) {
                reminderType = 'Final';
                scheduledDate = new Date(yearStart);
                scheduledDate.setDate(scheduledDate.getDate() + settings.thirdReminder);
            } else if (daysSinceYearStart >= settings.secondReminder) {
                reminderType = 'Second';
                scheduledDate = new Date(yearStart);
                scheduledDate.setDate(scheduledDate.getDate() + settings.secondReminder);
            } else if (daysSinceYearStart >= settings.firstReminder) {
                reminderType = 'First';
                scheduledDate = new Date(yearStart);
                scheduledDate.setDate(scheduledDate.getDate() + settings.firstReminder);
            } else {
                continue; // Not time for any reminder yet
            }
            
            // Check if reminder already exists
            const existingReminder = allReminders.find(r => 
                r.memberId === member.id && 
                r.reminderType === reminderType &&
                r.membershipYear === yearLabel
            );
            
            if (existingReminder) continue;
            
            // Create reminder
            const reminder = {
                memberId: member.id,
                memberEmail: member.email,
                memberName: member.name,
                membershipYear: yearLabel,
                reminderType: reminderType,
                scheduledDate: scheduledDate.toISOString(),
                status: 'pending',
                amountDue: 40.00,
                createdDate: new Date().toISOString()
            };
            
            await db.collection('duesReminders').add(reminder);
            created++;
        }
        
        alert(`Created ${created} new reminders`);
        await loadReminders();
        updateStats();
        displayReminders();
        
    } catch (error) {
        console.error('Error generating reminders:', error);
        alert('Error generating reminders. Please try again.');
    }
}

// Send a single reminder
async function sendReminder(id) {
    try {
        const reminder = allReminders.find(r => r.id === id);
        if (!reminder) return;
        
        const member = allMembers.find(m => m.id === reminder.memberId);
        if (!member) {
            alert('Member not found');
            return;
        }
        
        // Compose email
        const subject = `CVCWVUAA Dues Reminder - ${reminder.reminderType}`;
        const body = `Dear ${member.name},

This is a ${reminder.reminderType.toLowerCase()} reminder that your ${reminder.membershipYear} membership dues for the Central Virginia Chapter of the WVU Alumni Association are due.

Amount Due: $${reminder.amountDue.toFixed(2)}

Please visit https://cvawvuaa.org/pay.html to pay your dues online.

Your continued membership helps us support scholarships, community service, and Mountaineer spirit in Central Virginia.

Thank you for being part of CVCWVUAA!

Go Mountaineers!
CVCWVUAA Board`;
        
        // Open mailto link
        window.open(`mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        
        // Mark as sent
        await db.collection('duesReminders').doc(id).update({
            status: 'sent',
            sentDate: new Date().toISOString()
        });
        
        // Log to communications
        await db.collection('communications').add({
            memberId: member.id,
            type: 'dues_reminder',
            details: `${reminder.reminderType} reminder sent`,
            timestamp: new Date(),
            sentBy: 'Admin',
            method: 'Email'
        });
        
        await loadReminders();
        updateStats();
        displayReminders();
        
    } catch (error) {
        console.error('Error sending reminder:', error);
        alert('Error sending reminder. Please try again.');
    }
}

// Send all pending reminders
async function sendPendingReminders() {
    const pending = allReminders.filter(r => r.status === 'pending');
    
    if (pending.length === 0) {
        alert('No pending reminders to send');
        return;
    }
    
    if (!confirm(`Send ${pending.length} pending reminders?`)) {
        return;
    }
    
    try {
        // Build mailto with all recipients
        const emails = pending.map(r => r.memberEmail).join(',');
        const subject = 'CVCWVUAA Membership Dues Reminder';
        const body = `Dear CVCWVUAA Members,

This is a reminder that your membership dues for the current year are due.

Amount Due: $40.00

Please visit https://cvawvuaa.org/pay.html to pay your dues online.

Your continued membership helps us support scholarships, community service, and Mountaineer spirit in Central Virginia.

Thank you for being part of CVCWVUAA!

Go Mountaineers!
CVCWVUAA Board`;
        
        window.open(`mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        
        // Mark all as sent
        const batch = db.batch();
        pending.forEach(reminder => {
            const ref = db.collection('duesReminders').doc(reminder.id);
            batch.update(ref, {
                status: 'sent',
                sentDate: new Date().toISOString()
            });
        });
        await batch.commit();
        
        // Log communications
        for (const reminder of pending) {
            const member = allMembers.find(m => m.id === reminder.memberId);
            if (member) {
                await db.collection('communications').add({
                    memberId: member.id,
                    type: 'dues_reminder',
                    details: `${reminder.reminderType} reminder sent (batch)`,
                    timestamp: new Date(),
                    sentBy: 'Admin',
                    method: 'Email'
                });
            }
        }
        
        await loadReminders();
        updateStats();
        displayReminders();
        
        alert(`${pending.length} reminders sent!`);
        
    } catch (error) {
        console.error('Error sending reminders:', error);
        alert('Error sending reminders. Please try again.');
    }
}

// Retry failed reminder
async function retryReminder(id) {
    try {
        await db.collection('duesReminders').doc(id).update({
            status: 'pending'
        });
        
        await loadReminders();
        updateStats();
        displayReminders();
    } catch (error) {
        console.error('Error retrying reminder:', error);
        alert('Error retrying reminder. Please try again.');
    }
}

// Delete reminder
async function deleteReminder(id) {
    if (!confirm('Delete this reminder?')) return;
    
    try {
        await db.collection('duesReminders').doc(id).delete();
        await loadReminders();
        updateStats();
        displayReminders();
    } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('Error deleting reminder. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const pending = allReminders.filter(r => r.status === 'pending').length;
    const sent = allReminders.filter(r => {
        if (r.status !== 'sent') return false;
        const sentDate = new Date(r.sentDate);
        const now = new Date();
        return sentDate.getMonth() === now.getMonth() && sentDate.getFullYear() === now.getFullYear();
    }).length;
    const failed = allReminders.filter(r => r.status === 'failed').length;
    
    const { yearStart } = getCurrentMembershipYear();
    const needsPayment = allMembers.filter(member => {
        if (!member.payments || member.payments.length === 0) return true;
        
        const hasPaidThisYear = member.payments.some(payment => {
            const paymentDate = payment.recordedDate?.toDate?.() || new Date(payment.recordedDate);
            return paymentDate >= yearStart && payment.type === 'Dues';
        });
        
        return !hasPaidThisYear;
    }).length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('sentCount').textContent = sent;
    document.getElementById('failedCount').textContent = failed;
    document.getElementById('needsPaymentCount').textContent = needsPayment;
}

// Display reminders
function displayReminders() {
    const container = document.getElementById('reminderList');
    
    if (allReminders.length === 0) {
        container.innerHTML = '<div class="loading">No reminders found. Click "Generate Reminders" to create them.</div>';
        return;
    }
    
    container.innerHTML = allReminders.map(reminder => {
        const scheduledDate = new Date(reminder.scheduledDate).toLocaleDateString();
        const sentDate = reminder.sentDate ? new Date(reminder.sentDate).toLocaleDateString() : null;
        
        return `
            <div class="reminder-item ${reminder.status}">
                <div class="reminder-header">
                    <h3>${reminder.memberName}</h3>
                    <span class="status-badge ${reminder.status}">${reminder.status.toUpperCase()}</span>
                </div>
                <div class="reminder-details">
                    <div><strong>Email:</strong> ${reminder.memberEmail}</div>
                    <div><strong>Type:</strong> ${reminder.reminderType} Reminder</div>
                    <div><strong>Scheduled:</strong> ${scheduledDate}</div>
                    ${sentDate ? `<div><strong>Sent:</strong> ${sentDate}</div>` : ''}
                    <div><strong>Amount Due:</strong> $${reminder.amountDue.toFixed(2)}</div>
                </div>
                <div class="reminder-actions">
                    ${reminder.status === 'pending' ? `
                        <button class="btn btn-success btn-small" onclick="sendReminder('${reminder.id}')">📧 Send</button>
                    ` : ''}
                    ${reminder.status === 'failed' ? `
                        <button class="btn btn-primary btn-small" onclick="retryReminder('${reminder.id}')">🔄 Retry</button>
                    ` : ''}
                    <button class="btn btn-danger btn-small" onclick="deleteReminder('${reminder.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load data when page loads
window.addEventListener('DOMContentLoaded', loadAllData);
