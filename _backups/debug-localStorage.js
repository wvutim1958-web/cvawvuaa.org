// Quick localStorage inspection script
// Copy this code and paste it into your browser console while on the member management page

console.log('=== LOCALSTORAGE INSPECTION ===');

// Check all possible member storage keys
const keys = ['cvcwvuaa-members', 'cvcwvuaa_members', 'members', 'memberData'];
keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
        console.log(`\n--- ${key} ---`);
        const parsed = JSON.parse(data);
        console.log(`Found ${parsed.length} members`);
        
        // Show first few members
        parsed.slice(0, 3).forEach((member, i) => {
            console.log(`\nMember ${i + 1}:`);
            console.log('Name:', member.name);
            console.log('Email:', member.email);
            console.log('streetAddress:', member.streetAddress);
            console.log('city:', member.city);
            console.log('state:', member.state);
            console.log('zip:', member.zip);
            console.log('address:', member.address);
            console.log('fullAddress:', member.fullAddress);
        });
        
        // Check for members with "Buckley" issue
        const buckleyMember = parsed.find(m => m.name && m.name.includes('Buckley'));
        if (buckleyMember) {
            console.log('\n--- BUCKLEY MEMBER DATA ---');
            console.log(JSON.stringify(buckleyMember, null, 2));
        }
    }
});

console.log('\n=== END INSPECTION ===');