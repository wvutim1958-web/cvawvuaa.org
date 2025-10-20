/**
 * CVCWVUAA Financial Reports
 * Generate category reports, date filtering, and CSV exports
 */

(function() {
    'use strict';
    
    // Categories configuration (matches ledger)
    const CATEGORIES = {
        income: [
            'Member Dues',
            'Chapter Donations',
            'Scholarship Donations',
            'Event Revenue',
            'Merchandise Sales',
            'Interest Income',
            'Other Income'
        ],
        expense: [
            'Scholarships Awarded',
            'Event Costs',
            'Operating Expenses',
            'Marketing/Printing',
            'Website Hosting',
            'Mailchimp/Communications',
            'Bank Fees',
            'Donations Made',
            'Other Expense'
        ]
    };
    
    // Current state
    let allTransactions = [];
    let filteredTransactions = [];
    let db = null;
    
    /**
     * Initialize the reports system
     */
    function init() {
        console.log('=== REPORTS INIT STARTED ===');
        
        // Initialize Firebase
        if (typeof initializeFirebase === 'function') {
            console.log('initializeFirebase function found');
            const initialized = initializeFirebase();
            console.log('Firebase initialized:', initialized);
            if (initialized && typeof firebase !== 'undefined') {
                db = firebase.firestore();
                console.log('Firestore database connected:', db ? 'YES' : 'NO');
            } else {
                console.error('Firebase initialization failed or firebase undefined');
            }
        } else {
            console.error('initializeFirebase function not found!');
        }
        
        // Setup UI
        console.log('Setting up filters...');
        setupFilters();
        
        console.log('Loading transactions...');
        loadTransactions();
        
        console.log('=== REPORTS INIT COMPLETE ===');
    }
    
    /**
     * Setup filter UI
     */
    function setupFilters() {
        // Populate category filter
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
        
        // Don't set default date range - show all transactions by default
        // Users can set their own date filters if needed
    }
    
    /**
     * Load transactions from Firebase or demo data
     */
    async function loadTransactions() {
        console.log('Loading transactions...');
        if (db) {
            console.log('Firebase connected, loading from Firestore...');
            try {
                const snapshot = await db.collection('transactions')
                    .orderBy('date', 'desc')
                    .get();
                
                allTransactions = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    allTransactions.push({
                        id: doc.id,
                        ...data,
                        date: data.date.toDate ? data.date.toDate() : new Date(data.date)
                    });
                });
                console.log(`Loaded ${allTransactions.length} transactions from Firebase`);
            } catch (error) {
                console.error('Error loading transactions:', error);
                allTransactions = [];
                console.log('Showing empty state after error');
            }
        } else {
            console.log('No Firebase connection, showing empty state');
            allTransactions = [];
        }
        
        console.log('Generating report with', allTransactions.length, 'transactions');
        generateReport();
    }
    
    /**
     * Load demo data for testing
     * DISABLED - Using real Firebase data only
     */
    function loadDemoData() {
        // Demo data disabled - show empty state
        allTransactions = [];
    }
    
    /**
     * Generate report with current filters
     */
    function generateReport() {
        console.log('=== GENERATE REPORT CALLED ===');
        console.log('All transactions:', allTransactions.length);
        
        // Apply filters
        filteredTransactions = filterTransactions();
        console.log('Filtered transactions:', filteredTransactions.length);
        
        // Update summary
        console.log('Updating summary...');
        updateSummary();
        
        // Update category reports
        console.log('Updating category reports...');
        updateCategoryReports();
        
        // Update transactions table
        console.log('Updating transactions table...');
        updateTransactionsTable();
        
        console.log('=== GENERATE REPORT COMPLETE ===');
    }
    
    /**
     * Filter transactions based on UI filters
     */
    function filterTransactions() {
        let filtered = [...allTransactions];
        
        // Date filter
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(t => t.date >= fromDate);
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(t => t.date <= toDate);
        }
        
        // Type filter
        const typeFilter = document.getElementById('filter-type').value;
        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }
        
        // Category filter
        const categoryFilter = document.getElementById('filter-category').value;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(t => {
                // Check main category
                if (t.category === categoryFilter) return true;
                
                // Check split categories
                if (t.splits) {
                    return t.splits.some(s => s.category === categoryFilter);
                }
                
                return false;
            });
        }
        
        return filtered;
    }
    
    /**
     * Update summary cards
     */
    function updateSummary() {
        let totalIncome = 0;
        let totalExpenses = 0;
        let incomeCount = 0;
        let expenseCount = 0;
        
        filteredTransactions.forEach(t => {
            if (t.type === 'deposit') {
                totalIncome += t.amount;
                incomeCount++;
            } else {
                totalExpenses += t.amount;
                expenseCount++;
            }
        });
        
        const netChange = totalIncome - totalExpenses;
        
        // Update UI
        updateElement('total-income', formatCurrency(totalIncome));
        updateElement('income-count', `${incomeCount} transaction${incomeCount !== 1 ? 's' : ''}`);
        
        updateElement('total-expenses', formatCurrency(totalExpenses));
        updateElement('expense-count', `${expenseCount} transaction${expenseCount !== 1 ? 's' : ''}`);
        
        updateElement('net-change', formatCurrency(netChange));
        updateElement('total-count', `${filteredTransactions.length} total transaction${filteredTransactions.length !== 1 ? 's' : ''}`);
        
        // Update date range display
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        
        let dateRangeText = 'All Time';
        let periodLabel = 'Full history';
        
        if (dateFrom && dateTo) {
            dateRangeText = `${formatDateShort(new Date(dateFrom))} - ${formatDateShort(new Date(dateTo))}`;
            periodLabel = 'Custom range';
        } else if (dateFrom) {
            dateRangeText = `From ${formatDateShort(new Date(dateFrom))}`;
            periodLabel = 'Custom range';
        } else if (dateTo) {
            dateRangeText = `Until ${formatDateShort(new Date(dateTo))}`;
            periodLabel = 'Custom range';
        }
        
        updateElement('date-range', dateRangeText);
        updateElement('period-label', periodLabel);
    }
    
    /**
     * Update category reports
     */
    function updateCategoryReports() {
        // Calculate category totals
        const incomeByCategory = {};
        const expenseByCategory = {};
        
        // Process all transactions including splits
        filteredTransactions.forEach(t => {
            if (t.splits && t.splits.length > 0) {
                // Process split transaction
                t.splits.forEach(split => {
                    const category = split.category;
                    const amount = split.amount;
                    
                    if (CATEGORIES.income.includes(category)) {
                        incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
                    } else if (CATEGORIES.expense.includes(category)) {
                        expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
                    }
                });
            } else {
                // Process regular transaction
                if (t.type === 'deposit' && t.category !== 'Split Transaction') {
                    incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
                } else if (t.type === 'expense') {
                    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
                }
            }
        });
        
        // Render income categories
        renderCategoryReport('income-categories', incomeByCategory, 'income');
        
        // Render expense categories
        renderCategoryReport('expense-categories', expenseByCategory, 'expense');
    }
    
    /**
     * Render category report
     */
    function renderCategoryReport(containerId, categoryData, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const categories = Object.keys(categoryData);
        
        if (categories.length === 0) {
            container.innerHTML = '<div class="no-data">No data for selected filters</div>';
            return;
        }
        
        // Sort by amount descending
        categories.sort((a, b) => categoryData[b] - categoryData[a]);
        
        // Calculate total for percentages
        const total = categories.reduce((sum, cat) => sum + categoryData[cat], 0);
        
        // Render categories
        container.innerHTML = categories.map(category => {
            const amount = categoryData[category];
            const percentage = (amount / total * 100).toFixed(1);
            
            return `
                <div class="category-item">
                    <div style="flex: 1;">
                        <div class="category-name">
                            <span>${escapeHtml(category)}</span>
                            <span class="category-count">(${percentage}%)</span>
                        </div>
                        <div class="category-bar">
                            <div class="category-fill ${type}" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="category-amount">${formatCurrency(amount)}</div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Update transactions table
     */
    function updateTransactionsTable() {
        const tbody = document.getElementById('transactions-table');
        if (!tbody) return;
        
        if (filteredTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions match the selected filters</td></tr>';
            return;
        }
        
        // Sort by date descending
        const sorted = [...filteredTransactions].sort((a, b) => b.date - a.date);
        
        tbody.innerHTML = sorted.map(t => {
            const amountClass = t.type === 'deposit' ? 'amount-positive' : 'amount-negative';
            const amountStr = t.type === 'deposit' ? '+' : '-';
            
            return `
                <tr>
                    <td>${formatDate(t.date)}</td>
                    <td>${escapeHtml(t.description)}</td>
                    <td>${escapeHtml(t.category)}</td>
                    <td>${t.type === 'deposit' ? 'Deposit' : 'Expense'}</td>
                    <td class="${amountClass}" style="text-align: right;">${amountStr}${formatCurrency(t.amount)}</td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Export to CSV
     */
    function exportCSV() {
        if (filteredTransactions.length === 0) {
            alert('No transactions to export');
            return;
        }
        
        // Build CSV content
        let csv = 'Date,Type,Category,Description,Amount\n';
        
        // Sort by date
        const sorted = [...filteredTransactions].sort((a, b) => a.date - b.date);
        
        sorted.forEach(t => {
            const date = formatDate(t.date);
            const type = t.type === 'deposit' ? 'Deposit' : 'Expense';
            const category = escapeCSV(t.category);
            const description = escapeCSV(t.description);
            const amount = t.type === 'deposit' ? t.amount : -t.amount;
            
            csv += `${date},${type},${category},${description},${amount.toFixed(2)}\n`;
            
            // Add split details if present
            if (t.splits && t.splits.length > 0) {
                t.splits.forEach(split => {
                    csv += `${date},Split,${escapeCSV(split.category)},${escapeCSV('  → ' + split.member)},${split.amount.toFixed(2)}\n`;
                });
            }
        });
        
        // Create download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CVCWVUAA_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('CSV exported successfully!', 'success');
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
            background: ${type === 'success' ? '#28a745' : '#007bff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Utility functions
    function formatCurrency(amount) {
        return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    function formatDate(date) {
        const d = date instanceof Date ? date : new Date(date);
        return (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
               d.getDate().toString().padStart(2, '0') + '/' +
               d.getFullYear();
    }
    
    function formatDateShort(date) {
        const d = date instanceof Date ? date : new Date(date);
        return (d.getMonth() + 1).toString().padStart(2, '0') + '/' +
               d.getDate().toString().padStart(2, '0');
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function escapeCSV(text) {
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
            return '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
    }
    
    function updateElement(id, content) {
        const el = document.getElementById(id);
        if (el) el.textContent = content;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export functions for global access
    window.reports = {
        generateReport,
        exportCSV
    };
    
})();
