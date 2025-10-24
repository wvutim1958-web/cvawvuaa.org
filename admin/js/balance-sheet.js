/**
 * CVCWVUAA Balance Sheet
 * Shows current checking balance and running balance for all transactions
 */

(function() {
    'use strict';
    
    let db = null;
    let allTransactions = [];
    
    /**
     * Initialize
     */
    function init() {
        console.log('Initializing balance sheet...');
        
        // Initialize Firebase
        if (typeof initializeFirebase === 'function') {
            initializeFirebase();
            if (typeof firebase !== 'undefined') {
                db = firebase.firestore();
            }
        }
        
        // Set report date
        const reportDateEl = document.getElementById('report-date');
        if (reportDateEl) {
            const now = new Date();
            reportDateEl.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
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
            
            // Update transaction count
            const countEl = document.getElementById('transaction-count');
            if (countEl) {
                countEl.textContent = allTransactions.length;
            }
            
            // Calculate and display balance
            calculateBalance();
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            const tbody = document.getElementById('transactions-tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="no-data" style="color: red;">Error loading transactions. Please refresh the page.</td></tr>';
            }
        }
    }
    
    /**
     * Calculate balance and render table
     */
    function calculateBalance() {
        let runningBalance = 0;
        let totalIncome = 0;
        let totalExpenses = 0;
        
        // Process each transaction and calculate running balance
        const transactionsWithBalance = allTransactions.map(t => {
            const amount = parseFloat(t.amount) || 0;
            
            if (t.type === 'deposit') {
                runningBalance += amount;
                totalIncome += amount;
            } else if (t.type === 'expense') {
                runningBalance -= amount;
                totalExpenses += amount;
            }
            
            return {
                ...t,
                runningBalance: runningBalance
            };
        });
        
        // Update summary cards
        updateSummary(runningBalance, totalIncome, totalExpenses);
        
        // Render transactions table
        renderTransactionsTable(transactionsWithBalance);
    }
    
    /**
     * Update summary cards
     */
    function updateSummary(currentBalance, totalIncome, totalExpenses) {
        const currentBalanceEl = document.getElementById('current-balance');
        const totalIncomeEl = document.getElementById('total-income');
        const totalExpensesEl = document.getElementById('total-expenses');
        
        if (currentBalanceEl) {
            currentBalanceEl.textContent = formatCurrency(currentBalance);
            // Change color if negative
            if (currentBalance < 0) {
                currentBalanceEl.style.color = '#dc3545';
            } else {
                currentBalanceEl.style.color = '#28a745';
            }
        }
        
        if (totalIncomeEl) {
            totalIncomeEl.textContent = formatCurrency(totalIncome);
        }
        
        if (totalExpensesEl) {
            totalExpensesEl.textContent = formatCurrency(totalExpenses);
        }
    }
    
    /**
     * Render transactions table with running balance
     */
    function renderTransactionsTable(transactions) {
        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No transactions found</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(t => {
            const date = formatDate(t.date);
            const description = escapeHtml(t.description || t.payee || 'No description');
            const category = escapeHtml(t.category || '—');
            const isDeposit = t.type === 'deposit';
            const amount = parseFloat(t.amount) || 0;
            
            return `
                <tr>
                    <td>${date}</td>
                    <td>${description}</td>
                    <td>${category}</td>
                    <td class="amount-deposit">${isDeposit ? formatCurrency(amount) : '—'}</td>
                    <td class="amount-expense">${!isDeposit ? formatCurrency(amount) : '—'}</td>
                    <td class="running-balance">${formatCurrency(t.runningBalance)}</td>
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
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        
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
