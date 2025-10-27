// Mail Merge System - Send personalized bulk emails to members

let allMembers = [];
let filteredMembers = [];
let templates = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMembers();
    loadCampaignHistory();
    loadSavedTemplates();
    
    // Add event listeners for filters
    document.getElementById('filterPaid').addEventListener('change', filterMembers);
    document.getElementById('filterUnpaid').addEventListener('change', filterMembers);
});

// Load all members from Firestore
async function loadMembers() {
    try {
        const snapshot = await db.collection('members').get();
        
        // Test emails to exclude
        const testEmails = [
            'tcasten@mac.com',
            'pcctim@aol.com',
            'tcasten@natca.net'
        ];
        
        allMembers = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(member => !testEmails.includes(member.email?.toLowerCase()));
        
        // Sort by name
        allMembers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        // Populate preview dropdown
        const previewSelect = document.getElementById('previewMember');
        previewSelect.innerHTML = '<option value="">Select a member...</option>';
        allMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.email})`;
            previewSelect.appendChild(option);
        });
        
        filterMembers();
    } catch (error) {
        console.error('Error loading members:', error);
        alert('Error loading members: ' + error.message);
    }
}

// Filter members based on criteria
function filterMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const includePaid = document.getElementById('filterPaid').checked;
    const includeUnpaid = document.getElementById('filterUnpaid').checked;
    
    filteredMembers = allMembers.filter(member => {
        // Check payment status
        const hasPaidCurrentYear = member.payments && member.payments.length > 0 && 
            member.payments.some(p => {
                const paymentDate = p.recordedDate?.toDate ? p.recordedDate.toDate() : new Date(p.recordedDate);
                const currentYear = getCurrentMembershipYear();
                return paymentDate >= new Date(currentYear.start) && paymentDate <= new Date(currentYear.end);
            });
        
        if (hasPaidCurrentYear && !includePaid) return false;
        if (!hasPaidCurrentYear && !includeUnpaid) return false;
        
        // Check search term
        if (searchTerm) {
            const nameMatch = (member.name || '').toLowerCase().includes(searchTerm);
            const emailMatch = (member.email || '').toLowerCase().includes(searchTerm);
            if (!nameMatch && !emailMatch) return false;
        }
        
        // Must have valid email
        return member.email && member.email.includes('@');
    });
    
    displaySelectedMembers();
    updateRecipientCount();
}

// Filter members by email list
function filterByEmailList() {
    const emailListText = document.getElementById('emailList').value.trim();
    
    if (!emailListText) {
        // If empty, use regular filters
        filterMembers();
        return;
    }
    
    // Parse emails (support both newline and comma-separated)
    const emailList = emailListText
        .split(/[\n,]+/)
        .map(e => e.trim().toLowerCase())
        .filter(e => e.includes('@'));
    
    // Create member objects for emails in the list
    filteredMembers = emailList.map(email => {
        // Check if this email exists in database
        const existingMember = allMembers.find(m => m.email && m.email.toLowerCase() === email);
        
        if (existingMember) {
            return existingMember;
        } else {
            // Create a basic member object for emails not in database
            return {
                email: email,
                name: email,
                id: 'external_' + email
            };
        }
    });
    
    displaySelectedMembers();
    updateRecipientCount();
}

// Display filtered members
function displaySelectedMembers() {
    const container = document.getElementById('selectedMembersList');
    
    if (filteredMembers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #6c757d;">No members match the selected criteria</p>';
        return;
    }
    
    container.innerHTML = filteredMembers.map(member => `
        <div class="member-item">
            <div class="member-info">
                <div class="member-name">${member.name || member.email}</div>
                <div class="member-email">${member.email}</div>
            </div>
        </div>
    `).join('');
}

// Update recipient count
function updateRecipientCount() {
    const count = filteredMembers.length;
    document.getElementById('recipientCount').textContent = `${count} recipient${count !== 1 ? 's' : ''} selected`;
    document.getElementById('sendCount').textContent = count;
    document.getElementById('sendBtn').disabled = count === 0;
}

// Get current membership year (July 1 - June 30)
function getCurrentMembershipYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const julyFirst = new Date(currentYear, 6, 1); // July 1 of current year
    
    if (now >= julyFirst) {
        // After July 1, membership year is current year to next year
        return {
            start: `${currentYear}-07-01`,
            end: `${currentYear + 1}-06-30`,
            label: `${currentYear}-${currentYear + 1}`
        };
    } else {
        // Before July 1, membership year is previous year to current year
        return {
            start: `${currentYear - 1}-07-01`,
            end: `${currentYear}-06-30`,
            label: `${currentYear - 1}-${currentYear}`
        };
    }
}

// Insert merge field at cursor position
function insertMergeField(field) {
    const textarea = document.getElementById('emailBody');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    textarea.value = text.substring(0, start) + field + text.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + field.length, start + field.length);
}

// Replace merge fields with actual member data
function replaceMergeFields(text, member) {
    return text
        .replace(/\{\{NAME\}\}/g, member.name || '')
        .replace(/\{\{EMAIL\}\}/g, member.email || '')
        .replace(/\{\{PHONE\}\}/g, member.phone || '')
        .replace(/\{\{ADDRESS\}\}/g, member.address || '')
        .replace(/\{\{CITY\}\}/g, member.city || '')
        .replace(/\{\{STATE\}\}/g, member.state || '')
        .replace(/\{\{ZIP\}\}/g, member.zip || '');
}

// Update preview with selected member
function updatePreview() {
    const memberSelect = document.getElementById('previewMember');
    const memberId = memberSelect.value;
    
    if (!memberId) {
        document.getElementById('previewSection').style.display = 'none';
        return;
    }
    
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    
    document.getElementById('previewSubject').textContent = replaceMergeFields(subject, member);
    document.getElementById('previewBody').textContent = replaceMergeFields(body, member);
    document.getElementById('previewSection').style.display = 'block';
}

// Preview email (update preview with current template)
function previewEmail() {
    const memberSelect = document.getElementById('previewMember');
    if (!memberSelect.value) {
        alert('Please select a member from the dropdown to preview the email');
        return;
    }
    updatePreview();
}

// Save template to localStorage
function saveTemplate() {
    const name = prompt('Enter a name for this template:');
    if (!name) return;
    
    const template = {
        name: name,
        subject: document.getElementById('emailSubject').value,
        body: document.getElementById('emailBody').value,
        savedDate: new Date().toISOString()
    };
    
    templates[name] = template;
    localStorage.setItem('mailMergeTemplates', JSON.stringify(templates));
    alert(`Template "${name}" saved successfully!`);
}

// Load saved templates from localStorage
function loadSavedTemplates() {
    const saved = localStorage.getItem('mailMergeTemplates');
    if (saved) {
        templates = JSON.parse(saved);
    }
}

// Load a template
function loadTemplate() {
    const templateNames = Object.keys(templates);
    
    if (templateNames.length === 0) {
        alert('No saved templates found. Create and save a template first.');
        return;
    }
    
    const templateName = prompt(`Select a template:\n\n${templateNames.join('\n')}\n\nEnter template name:`);
    if (!templateName || !templates[templateName]) {
        alert('Template not found');
        return;
    }
    
    const template = templates[templateName];
    document.getElementById('emailSubject').value = template.subject;
    document.getElementById('emailBody').value = template.body;
    
    alert(`Template "${templateName}" loaded successfully!`);
}

// Send emails to selected members
async function sendEmails() {
    const subject = document.getElementById('emailSubject').value.trim();
    const body = document.getElementById('emailBody').value.trim();
    
    if (!subject || !body) {
        alert('Please enter both subject and body for the email');
        return;
    }
    
    if (filteredMembers.length === 0) {
        alert('No recipients selected');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to send this email to ${filteredMembers.length} recipient(s)?`);
    if (!confirmed) return;
    
    // Generate personalized emails
    const emails = filteredMembers.map(member => ({
        to: member.email,
        subject: replaceMergeFields(subject, member),
        body: replaceMergeFields(body, member),
        memberName: member.name
    }));
    
    // Open default email client with BCC approach
    // Note: For actual bulk sending, you'd need a backend email service
    const bccList = emails.map(e => e.to).join(',');
    const sampleEmail = emails[0];
    
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\{\{NAME\}\}/g, '[Member Name]'))}`;
    
    // Check if mailto link is too long (some email clients have limits)
    if (mailtoLink.length > 2000) {
        alert('Email list is too large for direct sending. Please use the "Export Mailing List" option and send through your email client.\n\nAlternatively, send to smaller groups.');
        return;
    }
    
    window.location.href = mailtoLink;
    
    // Save campaign to Firestore
    try {
        const campaign = {
            subject: subject,
            body: body,
            recipientCount: filteredMembers.length,
            recipients: filteredMembers.map(m => ({ id: m.id, name: m.name, email: m.email })),
            sentDate: new Date().toISOString(),
            sentBy: 'Admin'
        };
        
        await db.collection('mailCampaigns').add(campaign);
        
        // Log to communications for each member
        const batch = db.batch();
        filteredMembers.forEach(member => {
            const commRef = db.collection('communications').doc();
            batch.set(commRef, {
                memberId: member.id,
                memberName: member.name,
                memberEmail: member.email,
                type: 'mail_merge',
                subject: replaceMergeFields(subject, member),
                details: `Mail merge campaign sent`,
                timestamp: firebase.firestore.Timestamp.now(),
                sentBy: 'Admin',
                method: 'email'
            });
        });
        await batch.commit();
        
        alert(`Campaign initiated! Opening your email client...\n\n${filteredMembers.length} recipients in BCC`);
        loadCampaignHistory();
    } catch (error) {
        console.error('Error saving campaign:', error);
        alert('Email client opened, but there was an error logging the campaign: ' + error.message);
    }
}

// Export mailing list to CSV
function exportMailingList() {
    if (filteredMembers.length === 0) {
        alert('No members to export');
        return;
    }
    
    const subject = document.getElementById('emailSubject').value.trim();
    const body = document.getElementById('emailBody').value.trim();
    
    // Create CSV with personalized content
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Body'];
    const rows = filteredMembers.map(member => [
        member.name || '',
        member.email || '',
        member.phone || '',
        subject ? replaceMergeFields(subject, member) : '',
        body ? replaceMergeFields(body, member) : ''
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CVCWVUAA-Mail-Merge-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert(`✅ Exported ${filteredMembers.length} personalized emails to CSV!`);
}

// Load campaign history
async function loadCampaignHistory() {
    try {
        const snapshot = await db.collection('mailCampaigns')
            .orderBy('sentDate', 'desc')
            .limit(10)
            .get();
        
        const campaigns = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const container = document.getElementById('campaignList');
        
        if (campaigns.length === 0) {
            container.innerHTML = '<p style="color: #6c757d; text-align: center;">No campaigns sent yet</p>';
            return;
        }
        
        container.innerHTML = campaigns.map(campaign => `
            <div class="campaign-item">
                <div class="campaign-header">
                    <div class="campaign-subject">${campaign.subject}</div>
                    <div class="campaign-date">${new Date(campaign.sentDate).toLocaleDateString()}</div>
                </div>
                <div class="campaign-stats">
                    <span>📧 ${campaign.recipientCount} recipients</span>
                    <span>👤 Sent by ${campaign.sentBy}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading campaign history:', error);
        document.getElementById('campaignList').innerHTML = 
            '<p style="color: #dc3545; text-align: center;">Error loading campaign history</p>';
    }
}
