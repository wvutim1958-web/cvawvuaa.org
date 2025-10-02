// CSV Export Functionality
function exportMembersToCSV() {
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
  members.forEach(member => {
    // Split name into first and last
    const nameParts = member.name.split(' ');
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ');
    
    // Create a row with all fields in the correct order
    const row = [
      `"${firstName}"`,
      `"${lastName}"`,
      `"${member.email}"`,
      `"${member.phone || ''}"`,
      `"${member.streetAddress || ''}"`,
      `"${member.city || ''}"`,
      `"${member.state || ''}"`,
      `"${member.zip || ''}"`,
      `"${getFullMembershipType(member.type)}"`,
      `"${member.lastPayment || ''}"`,
      `"${member.duesAmount || '0'}"`,
      `"${member.totalAmountPaid || '0'}"`,
      `"${member.scholarshipAmount || '0'}"`,
      `"${member.generalFundAmount || '0'}"`
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
  
  alert('✅ Member data successfully exported to CSV!');
}

function getFullMembershipType(type) {
  const types = {
    'individual': 'Individual Membership',
    'family': 'Family Membership',
    'student': 'Student Membership',
    'lifetime': 'Lifetime Membership'
  };
  
  return types[type] || type;
}