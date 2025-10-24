// Script to update the initial deposit to a beginning balance with no category
// Run this once in the browser console on the financial ledger page

async function updateInitialTransaction() {
    const db = firebase.firestore();
    
    try {
        // Get all transactions ordered by date (oldest first)
        const snapshot = await db.collection('transactions')
            .orderBy('date', 'asc')
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            console.log('No transactions found');
            return;
        }
        
        const doc = snapshot.docs[0];
        const data = doc.data();
        
        console.log('Found initial transaction:', doc.id);
        console.log('Current data:', data);
        
        // Update to beginning balance format
        await db.collection('transactions').doc(doc.id).update({
            description: 'Beginning Balance',
            category: '',  // No category for beginning balance
            payee: '',     // No payee for beginning balance
            type: 'deposit' // Keep as deposit (adds to balance)
        });
        
        console.log('✅ Updated successfully!');
        console.log('The initial transaction is now a Beginning Balance with no category.');
        console.log('Refresh the page to see the changes.');
        
    } catch (error) {
        console.error('Error updating transaction:', error);
    }
}

// Run the update
updateInitialTransaction();
