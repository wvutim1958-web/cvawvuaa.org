/**
 * Member Database Management System
 * Manages CVAWVUAA member information with Firebase integration
 * 
 * Membership Types:
 * - Individual: $25/year (July 1 - June 30)
 * - Family: $40/year (July 1 - June 30)
 * 
 * Member Status: Active or Inactive
 */

// Global state
let allMembers = [];
let currentMemberId = null;
let currentView = 'card';

// Firebase connection (initialized by firebase-config.js)
let memberDb = null;

/**
 * Initialize the application
 */
async function init() {
    console.log('Member Database initializing...');
    
    // Wait for Firebase to be ready
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        memberDb = firebase.firestore();
        console.log('Firebase connected successfully');
    } else {
        console.error('Firebase not available');
        showError('Firebase connection failed. Please refresh the page.');
        return;
    }
    
    // Load members from Firebase
    await loadMembers();
    
    // Update statistics
    updateStatistics();
    
    console.log('Member Database initialized');
}

/**
 * Load all members from Firebase
 */
async function loadMembers() {
    try {
        console.log('Loading members from Firebase...');
        
        const snapshot = await memberDb.collection('members')
            .orderBy('name', 'asc')
            .get();
        
        allMembers = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allMembers.push({
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to Date if needed
                dateAdded: data.dateAdded?.toDate ? data.dateAdded.toDate() : new Date(data.dateAdded),
                dob: data.dob || null
            });
        });
        
        console.log(`Loaded ${allMembers.length} members`);
        
        // Render the members
        renderMembers(allMembers);
        
    } catch (error) {
        console.error('Error loading members:', error);
        showError('Failed to load members: ' + error.message);
        
        // Show empty state
        allMembers = [];
        renderMembers([]);
    }
}

/**
 * Render members in the current view
 */
function renderMembers(members) {
    const cardView = document.getElementById('cardView');
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    
    // Show empty state if no members
    if (members.length === 0) {
        cardView.innerHTML = '';
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Render card view
    renderCardView(members);
    
    // Render table view
    renderTableView(members);
}

/**
 * Render members in card view
 */
function renderCardView(members) {
    const cardView = document.getElementById('cardView');
    
    cardView.innerHTML = members.map(member => `
        <div class="member-card">
            <div class="member-header">
                <div>
                    <h3 class="member-name">${escapeHtml(member.name)}</h3>
                    <span class="member-type ${member.membershipType}">${formatMembershipType(member.membershipType)}</span>
                    ${member.familyMemberName ? `<div style="font-size: 0.85rem; color: #666; margin-top: 5px;">👨‍👩‍👧‍👦 ${escapeHtml(member.familyMemberName)}</div>` : ''}
                </div>
                <span class="member-status ${member.status}">${member.status}</span>
            </div>
            
            <div class="member-info">
                ${member.email ? `<div>📧 <span class="member-info-value">${escapeHtml(member.email)}</span></div>` : ''}
                ${member.phone ? `<div>📞 <span class="member-info-value">${escapeHtml(member.phone)}</span></div>` : ''}
                ${member.city && member.zip ? `<div>📍 <span class="member-info-value">${escapeHtml(member.city)}, WV ${escapeHtml(member.zip)}</span></div>` : ''}
                ${member.gradYear ? `<div>🎓 <span class="member-info-value">Class of ${member.gradYear}</span></div>` : ''}
                ${member.major ? `<div>📚 <span class="member-info-value">${escapeHtml(member.major)}${member.minor ? ` / ${escapeHtml(member.minor)}` : ''}</span></div>` : ''}
                ${member.degree ? `<div>🎯 <span class="member-info-value">${escapeHtml(member.degree)}</span></div>` : ''}
            </div>
            
            <div class="member-actions">
                <button class="btn-view" onclick="viewMemberDetails('${member.id}')">👁️ View</button>
                <button class="btn-edit" onclick="editMember('${member.id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteMember('${member.id}', '${escapeHtml(member.name).replace(/'/g, "\\'")}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

/**
 * Render members in table view
 */
function renderTableView(members) {
    const tableBody = document.getElementById('tableBody');
    
    tableBody.innerHTML = members.map(member => `
        <tr>
            <td>
                <strong>${escapeHtml(member.name)}</strong>
                ${member.familyMemberName ? `<br><small style="color: #666;">👨‍👩‍👧‍👦 ${escapeHtml(member.familyMemberName)}</small>` : ''}
            </td>
            <td><span class="member-type ${member.membershipType}">${formatMembershipType(member.membershipType)}</span></td>
            <td><span class="member-status ${member.status}">${member.status}</span></td>
            <td>${member.email ? escapeHtml(member.email) : '-'}</td>
            <td>${member.phone ? escapeHtml(member.phone) : '-'}</td>
            <td>${member.city ? escapeHtml(member.city) : '-'}</td>
            <td>${member.gradYear || '-'}</td>
            <td>
                <div class="action-cell">
                    <button class="btn-view" onclick="viewMemberDetails('${member.id}')">👁️</button>
                    <button class="btn-edit" onclick="editMember('${member.id}')">✏️</button>
                    <button class="btn-delete" onclick="deleteMember('${member.id}', '${escapeHtml(member.name).replace(/'/g, "\\'")}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Update statistics display
 */
function updateStatistics() {
    const totalMembers = allMembers.length;
    const activeMembers = allMembers.filter(m => m.status === 'active').length;
    const individualMembers = allMembers.filter(m => m.membershipType === 'individual').length;
    const familyMembers = allMembers.filter(m => m.membershipType === 'family').length;
    
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('activeMembers').textContent = activeMembers;
    document.getElementById('individualMembers').textContent = individualMembers;
    document.getElementById('familyMembers').textContent = familyMembers;
}

/**
 * Filter members based on search and filters
 */
function filterMembers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const typeFilter = document.getElementById('filterType').value;
    
    let filtered = allMembers;
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(member => {
            return (
                member.name?.toLowerCase().includes(searchTerm) ||
                member.email?.toLowerCase().includes(searchTerm) ||
                member.phone?.toLowerCase().includes(searchTerm) ||
                member.city?.toLowerCase().includes(searchTerm) ||
                member.familyMemberName?.toLowerCase().includes(searchTerm)
            );
        });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(member => member.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
        filtered = filtered.filter(member => member.membershipType === typeFilter);
    }
    
    renderMembers(filtered);
}

/**
 * Switch between card and table view
 */
function switchView(view) {
    currentView = view;
    
    const cardView = document.getElementById('cardView');
    const tableView = document.getElementById('tableView');
    const buttons = document.querySelectorAll('.view-toggle button');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'card') {
        cardView.style.display = 'grid';
        tableView.style.display = 'none';
        buttons[0].classList.add('active');
    } else {
        cardView.style.display = 'none';
        tableView.style.display = 'block';
        buttons[1].classList.add('active');
    }
}

/**
 * Open member modal for adding or editing
 */
function openMemberModal(memberId = null) {
    currentMemberId = memberId;
    const modal = document.getElementById('memberModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('memberForm');
    
    // Reset form
    form.reset();
    
    if (memberId) {
        // Edit mode
        modalTitle.textContent = 'Edit Member';
        const member = allMembers.find(m => m.id === memberId);
        if (member) {
            populateForm(member);
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Member';
        document.getElementById('memberStatus').value = 'active';
    }
    
    modal.style.display = 'block';
}

/**
 * Populate form with member data
 */
function populateForm(member) {
    document.getElementById('memberName').value = member.name || '';
    document.getElementById('membershipType').value = member.membershipType || 'individual';
    document.getElementById('memberStatus').value = member.status || 'active';
    document.getElementById('familyMemberName').value = member.familyMemberName || '';
    document.getElementById('memberAddress').value = member.address || '';
    document.getElementById('memberCity').value = member.city || '';
    document.getElementById('memberZip').value = member.zip || '';
    document.getElementById('memberEmail').value = member.email || '';
    document.getElementById('memberPhone').value = member.phone || '';
    document.getElementById('memberDOB').value = member.dob || '';
    document.getElementById('memberGradYear').value = member.gradYear || '';
    document.getElementById('memberMajor').value = member.major || '';
    document.getElementById('memberMinor').value = member.minor || '';
    document.getElementById('memberDegree').value = member.degree || '';
    document.getElementById('memberNotes').value = member.notes || '';
    
    // Show family member name field if family membership
    toggleFamilyMemberField();
}

/**
 * Close member modal
 */
function closeMemberModal() {
    const modal = document.getElementById('memberModal');
    modal.style.display = 'none';
    currentMemberId = null;
}

/**
 * Toggle family member name field visibility
 */
function toggleFamilyMemberField() {
    const membershipType = document.getElementById('membershipType').value;
    const familyMemberNameGroup = document.getElementById('familyMemberNameGroup');
    
    if (membershipType === 'family') {
        familyMemberNameGroup.style.display = 'flex';
    } else {
        familyMemberNameGroup.style.display = 'none';
        document.getElementById('familyMemberName').value = '';
    }
}

/**
 * Save member (add or update)
 */
async function saveMember(event) {
    event.preventDefault();
    
    // Collect form data
    const memberData = {
        name: document.getElementById('memberName').value.trim(),
        membershipType: document.getElementById('membershipType').value,
        status: document.getElementById('memberStatus').value,
        familyMemberName: document.getElementById('familyMemberName').value.trim(),
        address: document.getElementById('memberAddress').value.trim(),
        city: document.getElementById('memberCity').value.trim(),
        zip: document.getElementById('memberZip').value.trim(),
        email: document.getElementById('memberEmail').value.trim(),
        phone: document.getElementById('memberPhone').value.trim(),
        dob: document.getElementById('memberDOB').value,
        gradYear: document.getElementById('memberGradYear').value ? parseInt(document.getElementById('memberGradYear').value) : null,
        major: document.getElementById('memberMajor').value.trim(),
        minor: document.getElementById('memberMinor').value.trim(),
        degree: document.getElementById('memberDegree').value.trim(),
        notes: document.getElementById('memberNotes').value.trim(),
        lastModified: new Date()
    };
    
    try {
        if (currentMemberId) {
            // Update existing member
            await memberDb.collection('members').doc(currentMemberId).update(memberData);
            console.log('Member updated:', currentMemberId);
            showSuccess('Member updated successfully!');
        } else {
            // Add new member
            memberData.dateAdded = new Date();
            const docRef = await memberDb.collection('members').add(memberData);
            console.log('New member added:', docRef.id);
            showSuccess('Member added successfully!');
        }
        
        // Close modal and reload members
        closeMemberModal();
        await loadMembers();
        updateStatistics();
        
    } catch (error) {
        console.error('Error saving member:', error);
        showError('Failed to save member: ' + error.message);
    }
}

/**
 * Edit member
 */
function editMember(memberId) {
    openMemberModal(memberId);
}

/**
 * View member details
 */
function viewMemberDetails(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    
    // Initialize payments array if not exists
    const payments = member.payments || [];
    
    // Group payments by type
    const duesPayments = payments.filter(p => p.type === 'dues');
    const chapterDonations = payments.filter(p => p.type === 'chapter');
    const scholarshipDonations = payments.filter(p => p.type === 'scholarship');
    
    // Helper function to format payment list
    const formatPaymentList = (paymentList) => {
        if (paymentList.length === 0) {
            return '<p style="color: #999; font-style: italic;">No payments recorded</p>';
        }
        return paymentList.map(payment => {
            const fee = payment.expectedAmount - payment.actualReceived;
            return `
                <div style="border-left: 3px solid #667eea; padding: 10px; margin: 10px 0; background: white;">
                    <strong>Date:</strong> ${formatDate(payment.date)}<br>
                    <strong>Expected:</strong> $${payment.expectedAmount.toFixed(2)}<br>
                    <strong>Received:</strong> $${payment.actualReceived.toFixed(2)}
                    ${fee > 0 ? `<span style="color: #c62828;"> (PayPal fee: $${fee.toFixed(2)})</span>` : ''}<br>
                    <strong>Method:</strong> ${payment.paymentMethod}<br>
                    ${payment.notes ? `<strong>Notes:</strong> ${escapeHtml(payment.notes)}<br>` : ''}
                </div>
            `;
        }).join('');
    };
    
    const details = `
        <div style="font-family: 'Roboto', sans-serif; line-height: 1.8;">
            <h2 style="color: #667eea; margin-bottom: 20px;">${escapeHtml(member.name)}</h2>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <strong>Membership Type:</strong> ${formatMembershipType(member.membershipType)}<br>
                <strong>Status:</strong> <span style="color: ${member.status === 'active' ? '#2e7d32' : '#c62828'}; font-weight: bold;">${member.status.toUpperCase()}</span><br>
                ${member.familyMemberName ? `<strong>Family Member:</strong> ${escapeHtml(member.familyMemberName)}<br>` : ''}
                <strong>Member Since:</strong> ${formatDate(member.dateAdded)}
            </div>
            
            <h3 style="color: #666; margin-top: 25px;">
                Payment History
                <button onclick="openPaymentModal('${memberId}', 'dues')" style="margin-left: 10px; padding: 5px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ➕ Add Payment
                </button>
            </h3>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #667eea; margin-bottom: 10px;">💰 Dues Payments</h4>
                ${formatPaymentList(duesPayments)}
                <button onclick="openPaymentModal('${memberId}', 'dues')" style="margin-top: 10px; padding: 5px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ➕ Add Dues Payment
                </button>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h4 style="color: #667eea; margin-bottom: 10px;">🏛️ Chapter Donations</h4>
                ${formatPaymentList(chapterDonations)}
                <button onclick="openPaymentModal('${memberId}', 'chapter')" style="margin-top: 10px; padding: 5px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ➕ Add Chapter Donation
                </button>
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #667eea; margin-bottom: 10px;">🎓 Scholarship Donations</h4>
                ${formatPaymentList(scholarshipDonations)}
                <button onclick="openPaymentModal('${memberId}', 'scholarship')" style="margin-top: 10px; padding: 5px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ➕ Add Scholarship Donation
                </button>
            </div>
            
            <h3 style="color: #666; margin-top: 25px;">Contact Information</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                ${member.address ? `<strong>Address:</strong> ${escapeHtml(member.address)}<br>` : ''}
                ${member.city || member.zip ? `<strong>Location:</strong> ${escapeHtml(member.city || '')}, WV ${escapeHtml(member.zip || '')}<br>` : ''}
                ${member.email ? `<strong>Email:</strong> <a href="mailto:${escapeHtml(member.email)}">${escapeHtml(member.email)}</a><br>` : ''}
                ${member.phone ? `<strong>Phone:</strong> ${escapeHtml(member.phone)}<br>` : ''}
            </div>
            
            <h3 style="color: #666; margin-top: 25px;">Academic Information</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                ${member.dob ? `<strong>Date of Birth:</strong> ${member.dob}<br>` : ''}
                ${member.gradYear ? `<strong>Year Graduated:</strong> ${member.gradYear}<br>` : ''}
                ${member.major ? `<strong>Major:</strong> ${escapeHtml(member.major)}<br>` : ''}
                ${member.minor ? `<strong>Minor:</strong> ${escapeHtml(member.minor)}<br>` : ''}
                ${member.degree ? `<strong>Degree:</strong> ${escapeHtml(member.degree)}<br>` : ''}
            </div>
            
            ${member.notes ? `
            <h3 style="color: #666; margin-top: 25px;">Notes</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                ${escapeHtml(member.notes)}
            </div>
            ` : ''}
        </div>
    `;
    
    showDialog('Member Details', details);
}

/**
 * Delete member
 */
async function deleteMember(memberId, memberName) {
    if (!confirm(`Are you sure you want to delete ${memberName}?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        await memberDb.collection('members').doc(memberId).delete();
        console.log('Member deleted:', memberId);
        showSuccess(`${memberName} has been removed from the database.`);
        
        await loadMembers();
        updateStatistics();
        
    } catch (error) {
        console.error('Error deleting member:', error);
        showError('Failed to delete member: ' + error.message);
    }
}

/**
 * Export members to CSV
 */
function exportMembers() {
    if (allMembers.length === 0) {
        showError('No members to export.');
        return;
    }
    
    // CSV headers
    const headers = [
        'Name', 'Membership Type', 'Status', 'Family Member Name',
        'Address', 'City', 'ZIP', 'Email', 'Phone',
        'Date of Birth', 'Year Graduated', 'Major', 'Minor', 'Degree',
        'Notes', 'Date Added'
    ];
    
    // Build CSV content
    let csv = headers.join(',') + '\n';
    
    allMembers.forEach(member => {
        const row = [
            csvEscape(member.name),
            csvEscape(formatMembershipType(member.membershipType)),
            csvEscape(member.status),
            csvEscape(member.familyMemberName || ''),
            csvEscape(member.address || ''),
            csvEscape(member.city || ''),
            csvEscape(member.zip || ''),
            csvEscape(member.email || ''),
            csvEscape(member.phone || ''),
            csvEscape(member.dob || ''),
            csvEscape(member.gradYear?.toString() || ''),
            csvEscape(member.major || ''),
            csvEscape(member.minor || ''),
            csvEscape(member.degree || ''),
            csvEscape(member.notes || ''),
            csvEscape(formatDate(member.dateAdded))
        ];
        csv += row.join(',') + '\n';
    });
    
    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CVAWVUAA-Members-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showSuccess(`Exported ${allMembers.length} members to CSV file.`);
}

/**
 * Show renewal report
 */
function showRenewalReport() {
    // Current membership year (July 1 - June 30)
    const now = new Date();
    const currentYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const nextYear = currentYear + 1;
    const membershipPeriod = `July 1, ${currentYear} - June 30, ${nextYear}`;
    
    const activeMembers = allMembers.filter(m => m.status === 'active');
    const individualCount = activeMembers.filter(m => m.membershipType === 'individual').length;
    const familyCount = activeMembers.filter(m => m.membershipType === 'family').length;
    
    const expectedRevenue = (individualCount * 25) + (familyCount * 40);
    
    const report = `
        <div style="font-family: 'Roboto', sans-serif; line-height: 1.8;">
            <h2 style="color: #667eea; margin-bottom: 20px;">Membership Renewal Report</h2>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0;">Current Membership Period</h3>
                <div style="font-size: 1.2rem; font-weight: bold; color: #1976d2;">
                    ${membershipPeriod}
                </div>
            </div>
            
            <h3 style="color: #666; margin-top: 25px;">Active Members Summary</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 2px solid #ddd;">
                        <th style="text-align: left; padding: 10px;">Membership Type</th>
                        <th style="text-align: center; padding: 10px;">Count</th>
                        <th style="text-align: right; padding: 10px;">Annual Fee</th>
                        <th style="text-align: right; padding: 10px;">Total</th>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px;">Individual</td>
                        <td style="text-align: center; padding: 10px;">${individualCount}</td>
                        <td style="text-align: right; padding: 10px;">$25.00</td>
                        <td style="text-align: right; padding: 10px; font-weight: bold;">$${(individualCount * 25).toFixed(2)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px;">Family</td>
                        <td style="text-align: center; padding: 10px;">${familyCount}</td>
                        <td style="text-align: right; padding: 10px;">$40.00</td>
                        <td style="text-align: right; padding: 10px; font-weight: bold;">$${(familyCount * 40).toFixed(2)}</td>
                    </tr>
                    <tr style="background: #e3f2fd; font-weight: bold;">
                        <td style="padding: 10px;">TOTAL</td>
                        <td style="text-align: center; padding: 10px;">${activeMembers.length}</td>
                        <td style="text-align: right; padding: 10px;">-</td>
                        <td style="text-align: right; padding: 10px; color: #1976d2; font-size: 1.1rem;">$${expectedRevenue.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 20px;">
                <strong>📅 Renewal Deadline:</strong> June 30, ${nextYear}<br>
                <strong>💡 Tip:</strong> Send renewal reminders 30-60 days before the deadline.
            </div>
        </div>
    `;
    
    showDialog('Renewal Report', report);
}

/**
 * Show dialog with custom content
 */
function showDialog(title, content) {
    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.style.display = 'block';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>${title}</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
    
    // Close on background click
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
        }
    });
}

/**
 * Utility: Format membership type for display
 */
function formatMembershipType(type) {
    return type === 'individual' ? 'Individual - $25/yr' : 'Family - $40/yr';
}

/**
 * Utility: Format date for display
 */
function formatDate(date) {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Open payment modal
 */
function openPaymentModal(memberId, paymentType) {
    const modal = document.getElementById('paymentModal');
    if (!modal) {
        console.error('Payment modal not found');
        return;
    }
    
    // Store current member and payment type
    window.currentPaymentMemberId = memberId;
    window.currentPaymentType = paymentType;
    
    // Update modal title
    const typeLabels = {
        'dues': 'Dues Payment',
        'chapter': 'Chapter Donation',
        'scholarship': 'Scholarship Donation'
    };
    document.getElementById('paymentModalTitle').textContent = `Add ${typeLabels[paymentType]}`;
    
    // Reset form
    document.getElementById('paymentForm').reset();
    
    // Set default date to today
    document.getElementById('paymentDate').valueAsDate = new Date();
    
    // Set expected amount based on type and member
    const member = allMembers.find(m => m.id === memberId);
    if (paymentType === 'dues' && member) {
        const expectedAmount = member.membershipType === 'family' ? 40.00 : 25.00;
        document.getElementById('expectedAmount').value = expectedAmount.toFixed(2);
        document.getElementById('actualReceived').value = expectedAmount.toFixed(2);
    }
    
    modal.style.display = 'flex';
}

/**
 * Close payment modal
 */
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.currentPaymentMemberId = null;
    window.currentPaymentType = null;
}

/**
 * Calculate PayPal fee
 */
function calculatePayPalFee() {
    const expectedAmount = parseFloat(document.getElementById('expectedAmount').value) || 0;
    const actualReceived = parseFloat(document.getElementById('actualReceived').value) || 0;
    
    if (expectedAmount > 0 && actualReceived > 0) {
        const fee = expectedAmount - actualReceived;
        const feeDisplay = document.getElementById('paypalFeeDisplay');
        if (feeDisplay) {
            if (fee > 0) {
                feeDisplay.textContent = `PayPal Fee: $${fee.toFixed(2)}`;
                feeDisplay.style.color = '#c62828';
            } else if (fee < 0) {
                feeDisplay.textContent = `Overpayment: $${Math.abs(fee).toFixed(2)}`;
                feeDisplay.style.color = '#2e7d32';
            } else {
                feeDisplay.textContent = 'No fee';
                feeDisplay.style.color = '#666';
            }
        }
    }
}

/**
 * Save payment
 */
async function savePayment(event) {
    event.preventDefault();
    
    const memberId = window.currentPaymentMemberId;
    const paymentType = window.currentPaymentType;
    
    if (!memberId || !paymentType) {
        showError('Invalid payment context');
        return;
    }
    
    // Collect payment data
    const paymentData = {
        type: paymentType,
        date: new Date(document.getElementById('paymentDate').value),
        expectedAmount: parseFloat(document.getElementById('expectedAmount').value) || 0,
        actualReceived: parseFloat(document.getElementById('actualReceived').value) || 0,
        paymentMethod: document.getElementById('paymentMethod').value,
        notes: document.getElementById('paymentNotes').value.trim(),
        recordedDate: new Date()
    };
    
    try {
        // Get current member data
        const memberDoc = await memberDb.collection('members').doc(memberId).get();
        if (!memberDoc.exists) {
            throw new Error('Member not found');
        }
        
        const memberData = memberDoc.data();
        const payments = memberData.payments || [];
        
        // Add new payment
        payments.push(paymentData);
        
        // Update member with new payment
        await memberDb.collection('members').doc(memberId).update({
            payments: payments,
            lastModified: new Date()
        });
        
        console.log('Payment added successfully');
        showSuccess('Payment added successfully!');
        
        // Close modal and reload
        closePaymentModal();
        await loadMembers();
        
        // Re-open member details to show updated payment history
        viewMemberDetails(memberId);
        
    } catch (error) {
        console.error('Error saving payment:', error);
        showError('Failed to save payment: ' + error.message);
    }
}

/**
 * Utility: Escape CSV values
 */
function csvEscape(value) {
    if (!value) return '""';
    const stringValue = value.toString();
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return `"${stringValue}"`;
}

/**
 * Show success message
 */
function showSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Show error message
 */
function showError(message) {
    showNotification(message, 'error');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('memberModal');
    if (event.target === modal) {
        closeMemberModal();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
