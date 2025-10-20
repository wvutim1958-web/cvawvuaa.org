/**
 * CSV Import Tool for CVCWVUAA Member Database
 * Imports members from CSV file into Firebase Firestore
 */

let parsedMembers = [];
let importDb = null;

/**
 * Initialize Firebase connection
 */
function init() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        importDb = firebase.firestore();
        console.log('Firebase connected for CSV import');
    } else {
        console.error('Firebase not available');
        addLog('ERROR: Firebase connection failed', 'error');
    }
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    console.log('File select triggered');
    const file = event.target.files[0];
    
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    document.getElementById('fileName').textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    
    const reader = new FileReader();
    
    reader.onerror = function(e) {
        console.error('FileReader error:', e);
        alert('Error reading file: ' + e.target.error);
    };
    
    reader.onload = function(e) {
        console.log('File loaded, length:', e.target.result.length);
        const csvText = e.target.result;
        parseCSV(csvText);
    };
    
    console.log('Starting to read file...');
    reader.readAsText(file);
}

/**
 * Parse CSV file and convert to member objects
 */
function parseCSV(csvText) {
    console.log('=== PARSING CSV ===');
    console.log('CSV text length:', csvText.length);
    
    const lines = csvText.split('\n');
    console.log('Total lines:', lines.length);
    
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('Headers:', headers);
    
    parsedMembers = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parse CSV line (handle quoted values)
        const values = parseCSVLine(line);
        if (values.length < 2) continue;
        
        const member = {
            // Name handling
            name: `${values[0]} ${values[1]}`.trim(),
            
            // Contact information
            email: values[2]?.trim() || '',
            phone: values[3]?.trim() || '',
            address: values[4]?.trim() || '',
            city: values[5]?.trim() || '',
            state: values[6]?.trim() || 'VA',
            zip: values[7]?.trim() || '',
            
            // Membership type
            membershipType: values[8]?.includes('Family') ? 'family' : 'individual',
            
            // Family member name (extract from first name if contains &, or)
            familyMemberName: extractFamilyMemberName(values[0]),
            
            // Payment information
            lastPaid: values[9]?.trim() || '',
            dues: parseFloat(values[10]) || 0,
            totalPaid: parseFloat(values[11]) || 0,
            
            // Status (active if paid in last 2 years or has payment data)
            status: determineStatus(values[9], values[11]),
            
            // Academic info (not in CSV, can be added later)
            gradYear: null,
            major: '',
            minor: '',
            degree: '',
            dob: '',
            
            // Notes
            notes: buildNotes(values),
            
            // Metadata
            dateAdded: new Date(),
            importedFrom: 'CSV',
            importDate: new Date()
        };
        
        parsedMembers.push(member);
    }
    
    console.log(`Parsed ${parsedMembers.length} members from CSV`);
    displayPreview();
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current);
    
    return values.map(v => v.trim());
}

/**
 * Extract family member name from combined name field
 */
function extractFamilyMemberName(nameField) {
    if (!nameField) return '';
    
    // Check for patterns like "Mark & Vicki" or "Bob and Sandy"
    const andMatch = nameField.match(/&\s*([^,]+)/);
    if (andMatch) {
        return andMatch[1].trim();
    }
    
    const orMatch = nameField.match(/\bor\b\s*([^,]+)/i);
    if (orMatch) {
        return orMatch[1].trim();
    }
    
    const commaMatch = nameField.match(/,\s*([^,]+)$/);
    if (commaMatch && commaMatch[1].length < 20) {
        return commaMatch[1].trim();
    }
    
    return '';
}

/**
 * Determine member status based on payment history
 */
function determineStatus(lastPaid, totalPaid) {
    if (!lastPaid && (!totalPaid || totalPaid === '0')) {
        return 'inactive';
    }
    
    if (!lastPaid) {
        return 'inactive';
    }
    
    // Parse date (format: MM/DD/YYYY)
    const dateParts = lastPaid.split('/');
    if (dateParts.length !== 3) {
        return 'inactive';
    }
    
    const paidDate = new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
    const now = new Date();
    const yearsSincePaid = (now - paidDate) / (1000 * 60 * 60 * 24 * 365);
    
    // Active if paid within last 2 years
    return yearsSincePaid <= 2 ? 'active' : 'inactive';
}

/**
 * Build notes from payment and donation data
 */
function buildNotes(values) {
    const notes = [];
    
    const lastPaid = values[9]?.trim();
    const dues = values[10]?.trim();
    const totalPaid = values[11]?.trim();
    const scholarship = values[12]?.trim();
    const generalFund = values[13]?.trim();
    
    if (lastPaid) {
        notes.push(`Last paid: ${lastPaid}`);
    }
    
    if (totalPaid && parseFloat(totalPaid) > 0) {
        notes.push(`Total paid: $${totalPaid}`);
    }
    
    if (scholarship && parseFloat(scholarship) > 0) {
        notes.push(`Scholarship donations: $${scholarship}`);
    }
    
    if (generalFund && parseFloat(generalFund) > 0) {
        notes.push(`General fund donations: $${generalFund}`);
    }
    
    return notes.join(' | ');
}

/**
 * Display preview of parsed members
 */
function displayPreview() {
    const previewBody = document.getElementById('previewBody');
    const previewSection = document.getElementById('previewSection');
    
    // Calculate statistics
    const totalRecords = parsedMembers.length;
    const individualCount = parsedMembers.filter(m => m.membershipType === 'individual').length;
    const familyCount = parsedMembers.filter(m => m.membershipType === 'family').length;
    const activeCount = parsedMembers.filter(m => m.status === 'active').length;
    
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('individualCount').textContent = individualCount;
    document.getElementById('familyCount').textContent = familyCount;
    document.getElementById('activeCount').textContent = activeCount;
    
    // Display preview rows (first 50)
    previewBody.innerHTML = parsedMembers.slice(0, 50).map(member => `
        <tr>
            <td>${escapeHtml(member.name)}${member.familyMemberName ? `<br><small style="color: #666;">👨‍👩‍👧‍👦 ${escapeHtml(member.familyMemberName)}</small>` : ''}</td>
            <td><span style="padding: 4px 8px; background: ${member.membershipType === 'family' ? '#f3e5f5' : '#e3f2fd'}; border-radius: 12px; font-size: 0.85rem;">${member.membershipType}</span></td>
            <td>${escapeHtml(member.email) || '-'}</td>
            <td>${escapeHtml(member.phone) || '-'}</td>
            <td>${escapeHtml(member.city) || '-'}</td>
            <td><span style="padding: 4px 8px; background: ${member.status === 'active' ? '#c8e6c9' : '#ffcdd2'}; border-radius: 12px; font-size: 0.85rem;">${member.status}</span></td>
        </tr>
    `).join('');
    
    if (parsedMembers.length > 50) {
        previewBody.innerHTML += `
            <tr>
                <td colspan="6" style="text-align: center; color: #666; font-style: italic;">
                    ... and ${parsedMembers.length - 50} more members
                </td>
            </tr>
        `;
    }
    
    previewSection.style.display = 'block';
}

/**
 * Import all members to Firebase
 */
async function importMembers() {
    if (!importDb) {
        addLog('ERROR: Firebase not connected', 'error');
        return;
    }
    
    if (parsedMembers.length === 0) {
        addLog('ERROR: No members to import', 'error');
        return;
    }
    
    const importSection = document.getElementById('importSection');
    const logContainer = document.getElementById('logContainer');
    const progressBar = document.getElementById('progressBar');
    
    importSection.style.display = 'block';
    logContainer.innerHTML = '';
    
    addLog(`Starting import of ${parsedMembers.length} members...`, 'info');
    
    let imported = 0;
    let errors = 0;
    
    // Import in batches to avoid overwhelming Firebase
    const batchSize = 10;
    
    for (let i = 0; i < parsedMembers.length; i += batchSize) {
        const batch = parsedMembers.slice(i, i + batchSize);
        
        for (const member of batch) {
            try {
                await importDb.collection('members').add(member);
                imported++;
                addLog(`✓ Imported: ${member.name}`, 'success');
            } catch (error) {
                errors++;
                addLog(`✗ Failed to import ${member.name}: ${error.message}`, 'error');
            }
        }
        
        // Update progress
        const progress = Math.round((imported + errors) / parsedMembers.length * 100);
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    addLog(`\n=== IMPORT COMPLETE ===`, 'info');
    addLog(`✓ Successfully imported: ${imported} members`, 'success');
    if (errors > 0) {
        addLog(`✗ Failed: ${errors} members`, 'error');
    }
    addLog(`\nYou can now view all members in the Member Database`, 'info');
    
    // Show success notification
    setTimeout(() => {
        if (confirm(`Import complete! ${imported} members imported successfully.\n\nGo to Member Database now?`)) {
            window.location.href = '/admin/member-database.html';
        }
    }, 1000);
}

/**
 * Add log entry
 */
function addLog(message, type = 'info') {
    const logContainer = document.getElementById('logContainer');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
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

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
