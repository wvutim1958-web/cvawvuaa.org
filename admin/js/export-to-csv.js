// CSV Export Functionality for Member Management
function exportMembersToCSV() {
  // Get current members data from localStorage
  const membersData = JSON.parse(localStorage.getItem('cvcwvuaa-members') || '[]');
  
  if (membersData.length === 0) {
    alert('⚠️ No member data found to export. Please import or add members first.');
    return;
  }
  
  // Create headers using exact field names that match the original CSV import
  const headers = [
    'First Name(s)',
    'Last Name',
    'E-mail Address (Primary)',
    'Primary Phone',
    'Home Address',
    'City',
    'State',
    'Zip Code',
    'Type of Membership',
    'Membership Last Paid',
    'Dues',
    'Total Amount Paid',
    'Scholarship',
    'General Fund'
  ];
  
  // Create CSV content starting with headers
  let csvContent = headers.join(',') + '\n';
  
  // Add each member as a row
  membersData.forEach(member => {
    // Split name into first and last
    const nameParts = (member.name || '').split(' ');
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    
    // Format membership type to match expected CSV format
    const membershipType = getFullMembershipType(member.type);
    
    // Format last payment date
    const lastPayment = member.lastPayment ? formatDateForCSV(member.lastPayment) : '';
    
    // Create a row with all fields in the correct order, properly escaped
    const row = [
      escapeCSVField(firstName),
      escapeCSVField(lastName),
      escapeCSVField(member.email || ''),
      escapeCSVField(member.phone || ''),
      escapeCSVField(member.streetAddress || ''),
      escapeCSVField(member.city || ''),
      escapeCSVField(member.state || ''),
      escapeCSVField(member.zip || ''),
      escapeCSVField(membershipType),
      escapeCSVField(lastPayment),
      escapeCSVField((member.duesAmount || 0).toString()),
      escapeCSVField((member.totalAmountPaid || 0).toString()),
      escapeCSVField((member.scholarshipAmount || 0).toString()),
      escapeCSVField((member.generalFundAmount || 0).toString())
    ];
    
    csvContent += row.join(',') + '\n';
  });
  
  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CVCWVUAA-Members-Export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  alert(`✅ Successfully exported ${membersData.length} members to CSV!\n\nFile: CVCWVUAA-Members-Export-${new Date().toISOString().split('T')[0]}.csv`);
}

function getFullMembershipType(type) {
  const types = {
    'individual': 'Individual Membership',
    'family': 'Family Membership',
    'student': 'Student Membership',
    'lifetime': 'Lifetime Membership'
  };
  
  return types[type] || (type || 'Individual Membership');
}

function escapeCSVField(field) {
  if (field === null || field === undefined) field = '';
  field = field.toString();
  
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function formatDateForCSV(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    // Format as MM/DD/YYYY to match common CSV date format
    return (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
           date.getDate().toString().padStart(2, '0') + '/' +
           date.getFullYear();
  } catch (e) {
    return dateString; // Return original if formatting fails
  }
}