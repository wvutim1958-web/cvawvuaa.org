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
        
        const incomeTransactions = [];
        const expenseTransactions = [];
        
        // Process each transaction
        allTransactions.forEach(t => {
            const amount = parseFloat(t.amount) || 0;
            const isBeginningBalance = t.description && t.description.toLowerCase().includes('beginning balance');
            
            if (t.type === 'deposit') {
                runningBalance += amount;
                // Only count as income if it's not the beginning balance
                if (!isBeginningBalance) {
                    totalIncome += amount;
                    incomeTransactions.push(t);
                }
            } else if (t.type === 'expense') {
                runningBalance -= amount;
                totalExpenses += amount;
                expenseTransactions.push(t);
            }
        });
        
        // Update summary cards
        document.getElementById('currentBalance').textContent = formatCurrency(runningBalance);
        document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
        
        // Render transaction tables
        renderIncomeTable(incomeTransactions);
        renderExpenseTable(expenseTransactions);
        
        // Hide loading, show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('balanceSheet').style.display = 'block';
    }
    
    /**
     * Render income transactions table
     */
    function renderIncomeTable(transactions) {
        const tbody = document.getElementById('incomeTransactions');
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">No income transactions</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(t => {
            const date = formatDate(t.date);
            const description = escapeHtml(t.description || t.payee || 'No description');
            const category = escapeHtml(t.category || '—');
            const amount = parseFloat(t.amount) || 0;
            
            return `
                <tr>
                    <td>${date}</td>
                    <td>${description}</td>
                    <td>${category}</td>
                    <td class="amount-income" style="text-align: right;">${formatCurrency(amount)}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Render expense transactions table
     */
    function renderExpenseTable(transactions) {
        const tbody = document.getElementById('expenseTransactions');
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">No expense transactions</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(t => {
            const date = formatDate(t.date);
            const description = escapeHtml(t.description || t.payee || 'No description');
            const category = escapeHtml(t.category || '—');
            const amount = parseFloat(t.amount) || 0;
            
            return `
                <tr>
                    <td>${date}</td>
                    <td>${description}</td>
                    <td>${category}</td>
                    <td class="amount-expense" style="text-align: right;">${formatCurrency(amount)}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Format date for display
     */
    function formatDate(date) {
        if (!date) return 'N/A';
        
        let d;
        if (date.toDate) {
            // Firestore Timestamp
            d = date.toDate();
        } else if (date instanceof Date) {
            d = date;
        } else {
            d = new Date(date);
        }
        
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
