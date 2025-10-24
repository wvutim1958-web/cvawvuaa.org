/**
 * CVCWVUAA Split Transactions Report
 * Detailed breakdown of split transactions with member and category distribution
 */

(function() {
    'use strict';
    
    // Load categories from localStorage or use defaults
    let CATEGORIES = {
        income: ['Member Dues', 'Member', 'Chapter Donations', 'Scholarship Donations', 'Event Revenue', 'Merchandise Sales', 'Interest Income', 'Other Income'],
        expense: ['Scholarship Fund', 'Event Costs', 'Operating Expenses', 'Marketing/Printing', 'Website Hosting', 'Mailchimp/Communications', 'Bank Fees', 'St & Fed Filing Fees', 'Donations Made', 'Other Expense']
    };
    
    /**
     * Check if categories are hierarchical (object) or flat (array)
     */
    function isHierarchical(categories) {
        return categories && 
               categories.income && 
               typeof categories.income === 'object' && 
               !Array.isArray(categories.income);
    }
    
    /**
     * Flatten hierarchical categories to simple arrays
     */
    function flattenCategories(hierarchical) {
        const flat = {
            income: [],
            expense: []
        };
        
        ['income', 'expense'].forEach(type => {
            const categoryData = hierarchical[type];
            Object.keys(categoryData).forEach(mainCat => {
                // Add main category
                flat[type].push(mainCat);
                // Add subcategories with full path
                const subcats = categoryData[mainCat];
                if (Array.isArray(subcats)) {
                    subcats.forEach(subcat => {
                        flat[type].push(`${mainCat} - ${subcat}`);
                    });
                }
            });
        });
        
        return flat;
    }
    
    try {
        const stored = localStorage.getItem('financial_categories');
        if (stored) {
            const parsedCategories = JSON.parse(stored);
            console.log('Loaded categories from localStorage:', parsedCategories);
            
            // Handle different possible structures
            if (parsedCategories) {
                // Check if it's hierarchical structure (new format)
                if (isHierarchical(parsedCategories)) {
                    CATEGORIES = flattenCategories(parsedCategories);
                    console.log('✅ Flattened hierarchical categories from localStorage');
                }
                // Check if it's the flat structure with income/expense arrays
                else if (Array.isArray(parsedCategories.income) && 
                         Array.isArray(parsedCategories.expense) &&
                         parsedCategories.income.length > 0 &&
                         parsedCategories.expense.length > 0) {
                    CATEGORIES = parsedCategories;
                    console.log('✅ Using flat categories from localStorage');
                } 
                // Unknown structure
                else {
                    console.warn('Invalid categories structure in localStorage:', parsedCategories);
                    console.warn('Using default categories');
                }
            }
        } else {
            console.log('No custom categories in localStorage, using defaults');
        }
    } catch (e) {
        console.warn('Error loading custom categories:', e);
    }
    
    console.log('Active categories:', CATEGORIES);
    
    let allTransactions = [];
    let filteredTransactions = [];
    let db = null;
    
    /**
     * Initialize the report
     */
    function init() {
        // Initialize Firebase
        if (typeof initializeFirebase === 'function') {
            const initialized = initializeFirebase();
            if (initialized && typeof firebase !== 'undefined') {
                db = firebase.firestore();
            }
        }
        
        setupFilters();
        loadTransactions();
    }
    
    /**
     * Setup filter UI
     */
    function setupFilters() {
        const categorySelect = document.getElementById('filter-category');
        if (categorySelect) {
            const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense];
            allCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
        }
        
        // Clear date filters to show all transactions by default
        document.getElementById('date-from').value = '';
        document.getElementById('date-to').value = '';
    }
    
    /**
     * Load transactions from Firebase
     */
    async function loadTransactions() {
        if (!db) {
            showNoData('Firebase not connected');
            return;
        }
        
        try {
            const snapshot = await db.collection('transactions')
                .orderBy('date', 'desc')
                .get();
            
            allTransactions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Convert Firestore Timestamp to JavaScript Date
                if (data.date && data.date.toDate) {
                    data.date = data.date.toDate();
                } else if (data.date && typeof data.date === 'string') {
                    data.date = new Date(data.date);
                }
                
                // Only include transactions that have splits
                if (data.splits && data.splits.length > 0) {
                    allTransactions.push({ id: doc.id, ...data });
                }
            });
            
            console.log(`Loaded ${snapshot.size} total transactions, ${allTransactions.length} have splits`);
            
            if (allTransactions.length === 0) {
                showNoData('No split transactions found. Split transactions are created in the Financial Ledger by checking "Split this transaction" when adding a deposit.');
                return;
            }
            
            filteredTransactions = [...allTransactions];
            updateReport();
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            showNoData('Error loading transactions: ' + error.message);
        }
    }
    
    /**
     * Apply filters
     */
    window.applyFilters = function() {
        filteredTransactions = [...allTransactions];
        
        // Date filters
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filteredTransactions = filteredTransactions.filter(t => {
                const tDate = new Date(t.date);
                tDate.setHours(0, 0, 0, 0);
                return tDate >= fromDate;
            });
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredTransactions = filteredTransactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate <= toDate;
            });
        }
        
        // Category filter
        const categoryFilter = document.getElementById('filter-category').value;
        if (categoryFilter !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => {
                return t.splits.some(s => s.category === categoryFilter);
            });
        }
        
        updateReport();
    };
    
    /**
     * Update the report
     */
    function updateReport() {
        updateStatistics();
        renderTransactions();
    }
    
    /**
     * Update statistics
     */
    function updateStatistics() {
        const totalTransactions = filteredTransactions.length;
        let totalAmount = 0;
        let totalLines = 0;
        let totalIncome = 0;
        let totalExpense = 0;
        
        filteredTransactions.forEach(t => {
            totalAmount += t.amount;
            totalLines += t.splits.length;
            
            // Calculate income and expense splits
            t.splits.forEach(split => {
                if (CATEGORIES.income.includes(split.category)) {
                    totalIncome += split.amount;
                } else if (CATEGORIES.expense.includes(split.category)) {
                    totalExpense += split.amount;
                }
            });
        });
        
        document.getElementById('stat-total').textContent = totalTransactions;
        document.getElementById('stat-amount').textContent = formatCurrency(totalAmount);
        document.getElementById('stat-lines').textContent = totalLines;
        
        // Add income and expense breakdown if elements exist
        const incomeEl = document.getElementById('stat-income');
        const expenseEl = document.getElementById('stat-expense');
        if (incomeEl) incomeEl.textContent = formatCurrency(totalIncome);
        if (expenseEl) expenseEl.textContent = formatCurrency(totalExpense);
        
        // Update date range
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const rangeEl = document.getElementById('stat-range');
        
        if (dateFrom && dateTo) {
            rangeEl.textContent = `${formatDateShort(new Date(dateFrom))} - ${formatDateShort(new Date(dateTo))}`;
            rangeEl.style.fontSize = '0.9rem';
        } else if (dateFrom) {
            rangeEl.textContent = `From ${formatDateShort(new Date(dateFrom))}`;
            rangeEl.style.fontSize = '0.9rem';
        } else if (dateTo) {
            rangeEl.textContent = `Until ${formatDateShort(new Date(dateTo))}`;
            rangeEl.style.fontSize = '0.9rem';
        } else {
            rangeEl.textContent = 'All Time';
            rangeEl.style.fontSize = '1rem';
        }
    }
    
    /**
     * Render transactions
     */
    function renderTransactions() {
        const container = document.getElementById('report-content');
        
        if (filteredTransactions.length === 0) {
            container.innerHTML = '<div class="no-data">No split transactions found matching your filters</div>';
            return;
        }
        
        container.innerHTML = filteredTransactions.map(transaction => {
            // Separate splits into income and expense
            const incomeSplits = transaction.splits.filter(split => 
                CATEGORIES.income.includes(split.category)
            );
            const expenseSplits = transaction.splits.filter(split => 
                CATEGORIES.expense.includes(split.category)
            );
            
            // Calculate totals
            const incomeTotal = incomeSplits.reduce((sum, split) => sum + split.amount, 0);
            const expenseTotal = expenseSplits.reduce((sum, split) => sum + split.amount, 0);
            
            // Generate HTML for income splits
            const incomeSplitsHtml = incomeSplits.length > 0 ? `
                <div class="split-section">
                    <h4 class="split-section-title income-title">Income Splits (${formatCurrency(incomeTotal)})</h4>
                    <table class="split-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Category</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${incomeSplits.map(split => `
                                <tr>
                                    <td>${escapeHtml(split.member || 'N/A')}</td>
                                    <td><span class="category-badge income-badge">${escapeHtml(split.category)}</span></td>
                                    <td class="amount-cell">${formatCurrency(split.amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '';
            
            // Generate HTML for expense splits
            const expenseSplitsHtml = expenseSplits.length > 0 ? `
                <div class="split-section">
                    <h4 class="split-section-title expense-title">Expense Splits (${formatCurrency(expenseTotal)})</h4>
                    <table class="split-table">
                        <thead>
                            <tr>
                                <th>Payee</th>
                                <th>Category</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenseSplits.map(split => `
                                <tr>
                                    <td>${escapeHtml(split.member || 'N/A')}</td>
                                    <td><span class="category-badge expense-badge">${escapeHtml(split.category)}</span></td>
                                    <td class="amount-cell">${formatCurrency(split.amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '';
            
            return `
                <div class="split-transaction">
                    <div class="split-header">
                        <div class="split-header-row">
                            <div class="split-title">${escapeHtml(transaction.description)}</div>
                            <div class="split-amount">${formatCurrency(transaction.amount)}</div>
                        </div>
                        <div class="split-meta">
                            <span><strong>Date:</strong> ${formatDate(transaction.date)}</span>
                            <span><strong>Payee:</strong> ${escapeHtml(transaction.payee || 'N/A')}</span>
                            ${transaction.checkNumber ? `<span><strong>Check #:</strong> ${escapeHtml(transaction.checkNumber)}</span>` : ''}
                            <span><strong>Total Splits:</strong> ${transaction.splits.length} items</span>
                            ${incomeSplits.length > 0 ? `<span><strong>Income:</strong> ${incomeSplits.length} (${formatCurrency(incomeTotal)})</span>` : ''}
                            ${expenseSplits.length > 0 ? `<span><strong>Expense:</strong> ${expenseSplits.length} (${formatCurrency(expenseTotal)})</span>` : ''}
                        </div>
                    </div>
                    <div class="split-details">
                        ${incomeSplitsHtml}
                        ${expenseSplitsHtml}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Export to CSV
     */
    window.exportToCSV = function() {
        if (filteredTransactions.length === 0) {
            alert('No transactions to export');
            return;
        }
        
        // Build CSV
        let csv = 'Date,Transaction Description,Payee,Check #,Total Amount,Member,Category,Split Amount\n';
        
        filteredTransactions.forEach(t => {
            const date = formatDate(t.date);
            const description = escapeCSV(t.description);
            const payee = escapeCSV(t.payee || '');
            const checkNum = escapeCSV(t.checkNumber || '');
            const totalAmount = t.amount.toFixed(2);
            
            t.splits.forEach(split => {
                const member = escapeCSV(split.member || '');
                const category = escapeCSV(split.category || '');
                const splitAmount = split.amount.toFixed(2);
                
                csv += `${date},${description},${payee},${checkNum},${totalAmount},${member},${category},${splitAmount}\n`;
            });
        });
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Split_Transactions_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    /**
     * Show no data message
     */
    function showNoData(message) {
        document.getElementById('report-content').innerHTML = 
            `<div class="no-data">${message}</div>`;
    }
    
    /**
     * Format currency
     */
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Format date
     */
    function formatDate(date) {
        if (!date) return 'N/A';
        
        let d;
        if (date.toDate) {
            d = date.toDate();
        } else if (date instanceof Date) {
            d = date;
        } else {
            d = new Date(date);
        }
        
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }
        
        return (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
               d.getDate().toString().padStart(2, '0') + '/' +
               d.getFullYear();
    }
    
    /**
     * Format date short
     */
    function formatDateShort(date) {
        return (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
               date.getDate().toString().padStart(2, '0') + '/' +
               date.getFullYear().toString().substr(2);
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
    
    /**
     * Escape CSV
     */
    function escapeCSV(text) {
        if (!text) return '';
        text = text.toString().replace(/"/g, '""');
        if (text.includes(',') || text.includes('\n') || text.includes('"')) {
            text = '"' + text + '"';
        }
        return text;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
