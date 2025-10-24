/**
 * Public Financials Page
 * Displays balance sheet for public transparency
 */

(function() {
    'use strict';
    
    let db = null;
    let allTransactions = [];
    
    /**
     * Initialize
     */
    function init() {
        console.log('Initializing financials page...');
        
        // Wait for Firebase to be ready
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            db = firebase.firestore();
            console.log('Firebase connected');
        } else {
            console.error('Firebase not available');
            document.getElementById('loading').innerHTML = '<p style="color: #dc3545;">Error: Unable to connect to database</p>';
            return;
        }
        
        // Set fiscal year display
        const fiscalYearEl = document.getElementById('fiscalYearDisplay');
        if (fiscalYearEl) {
            const now = new Date();
            const month = now.getMonth();
            const year = now.getFullYear();
            const fiscalYear = month < 6 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
            fiscalYearEl.textContent = `Fiscal Year: July 1, ${fiscalYear.split('-')[0]} - June 30, ${fiscalYear.split('-')[1]}`;
        }
        
        // Load transactions
        loadTransactions();
    }
    
    /**
     * Load all transactions from Firestore
     */
    async function loadTransactions() {
        if (!db) {
            console.error('Database not initialized');
            return;
        }
        
        try {
            console.log('Loading transactions...');
            const snapshot = await db.collection('transactions')
                .orderBy('date', 'asc')
                .get();
            
            allTransactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`Loaded ${allTransactions.length} transactions`);
            
            // Calculate and display balance
            calculateAndDisplay();
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            document.getElementById('loading').innerHTML = '<p style="color: #dc3545;">Error loading financial data. Please refresh the page.</p>';
        }
    }
    
    /**
     * Calculate balance and display
     */
    function calculateAndDisplay() {
        let runningBalance = 0;
        let totalIncome = 0;
        let totalExpenses = 0;
        let scholarshipDonations = 0;
        
        // Process each transaction
        allTransactions.forEach(t => {
            const amount = parseFloat(t.amount) || 0;
            const isBeginningBalance = t.description && t.description.toLowerCase().includes('beginning balance');
            const description = (t.description || '').toLowerCase();
            const category = (t.category || '').toLowerCase();
            
            if (t.type === 'deposit') {
                runningBalance += amount;
                // Only count as income if it's not the beginning balance
                if (!isBeginningBalance) {
                    totalIncome += amount;
                }
                
                // Check if this is a scholarship donation
                if (description.includes('scholarship') || 
                    description.includes('blake') || 
                    description.includes('fought') ||
                    category.includes('scholarship')) {
                    scholarshipDonations += amount;
                }
            } else if (t.type === 'expense') {
                runningBalance -= amount;
                totalExpenses += amount;
            }
        });
        
        // Update summary cards
        document.getElementById('currentBalance').textContent = formatCurrency(runningBalance);
        document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
        document.getElementById('scholarshipTotal').textContent = formatCurrency(scholarshipDonations);
        
        // Hide loading, show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('balanceSheet').style.display = 'block';
    }
    
    /**
     * Format currency
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
