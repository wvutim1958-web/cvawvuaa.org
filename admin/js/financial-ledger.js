/**
 * CVCWVUAA Financial Ledger System
 * Complete accounting ledger with split transactions, categories, and reporting
 */

(function() {
    'use strict';
    
    // Categories configuration
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
    let currentBalance = 0;
    let transactions = [];
    let db = null;
    
    /**
     * Initialize the ledger system
     */
    function init() {
        // Initialize Firebase
        if (typeof initializeFirebase === 'function') {
            const initialized = initializeFirebase();
            if (initialized && typeof firebase !== 'undefined') {
                db = firebase.firestore();
                loadTransactions();
            } else {
                showOfflineMode();
            }
        } else {
            showOfflineMode();
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial balance
        calculateBalance();
    }
    
    /**
     * Show offline mode message
     */
    function showOfflineMode() {
        console.warn('Running in offline mode - transactions will not persist');
        const notice = document.getElementById('offline-notice');
        if (notice) {
            notice.style.display = 'block';
        }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Add transaction buttons
        const depositBtn = document.getElementById('btn-add-deposit');
        const expenseBtn = document.getElementById('btn-add-expense');
        
        if (depositBtn) depositBtn.addEventListener('click', () => openTransactionModal('deposit'));
        if (expenseBtn) expenseBtn.addEventListener('click', () => openTransactionModal('expense'));
        
        // Modal controls
        const modalClose = document.querySelector('.modal-close');
        const modalCancel = document.getElementById('btn-cancel-transaction');
        const modalSave = document.getElementById('btn-save-transaction');
        
        if (modalClose) modalClose.addEventListener('click', closeTransactionModal);
        if (modalCancel) modalCancel.addEventListener('click', closeTransactionModal);
        if (modalSave) modalSave.addEventListener('click', saveTransaction);
        
        // Split transaction toggle
        const splitToggle = document.getElementById('split-transaction-toggle');
        if (splitToggle) {
            splitToggle.addEventListener('change', toggleSplitTransaction);
        }
        
        // Add split line button
        const addSplitBtn = document.getElementById('btn-add-split');
        if (addSplitBtn) {
            addSplitBtn.addEventListener('click', addSplitLine);
        }
    }
    
    /**
     * Load transactions from Firebase
     */
    async function loadTransactions() {
        if (!db) {
            loadDemoData();
            return;
        }
        
        try {
            const snapshot = await db.collection('transactions')
                .orderBy('date', 'desc')
                .limit(100)
                .get();
            
            transactions = [];
            snapshot.forEach(doc => {
                transactions.push({ id: doc.id, ...doc.data() });
            });
            
            calculateBalance();
            renderTransactions();
        } catch (error) {
            console.error('Error loading transactions:', error);
            loadDemoData();
        }
    }
    
    /**
     * Load demo data for testing
     */
    function loadDemoData() {
        transactions = [
            {
                id: 'demo1',
                date: new Date('2025-10-20'),
                type: 'deposit',
                amount: 100,
                description: 'Bank Deposit - 4 membership checks',
                category: 'Split Transaction',
                splits: [
                    { member: 'Tim Casten', category: 'Member Dues', amount: 25 },
                    { member: 'Joe Smith', category: 'Chapter Donations', amount: 25 },
                    { member: 'Sally Ride', category: 'Scholarship Donations', amount: 50 }
                ]
            },
            {
                id: 'demo2',
                date: new Date('2025-10-18'),
                type: 'expense',
                amount: 245,
                description: 'Game Watch Event - Pizza & Drinks',
                category: 'Event Costs'
            },
            {
                id: 'demo3',
                date: new Date('2025-10-15'),
                type: 'deposit',
                amount: 100,
                description: 'John Doe - Annual Donation',
                category: 'Chapter Donations'
            }
        ];
        
        calculateBalance();
        renderTransactions();
    }
    
    /**
     * Calculate running balance
     */
    function calculateBalance() {
        currentBalance = 0;
        
        // Sort by date (oldest first) for accurate running balance
        const sorted = [...transactions].sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateA - dateB;
        });
        
        sorted.forEach(transaction => {
            if (transaction.type === 'deposit') {
                currentBalance += transaction.amount;
            } else {
                currentBalance -= transaction.amount;
            }
        });
        
        updateBalanceDisplay();
    }
    
    /**
     * Update balance display
     */
    function updateBalanceDisplay() {
        const balanceEl = document.getElementById('current-balance');
        if (balanceEl) {
            balanceEl.textContent = formatCurrency(currentBalance);
            
            // Add color coding
            if (currentBalance < 0) {
                balanceEl.style.color = '#dc3545';
            } else if (currentBalance < 1000) {
                balanceEl.style.color = '#ffc107';
            } else {
                balanceEl.style.color = '#28a745';
            }
        }
    }
    
    /**
     * Render transactions table
     */
    function renderTransactions() {
        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No transactions yet. Click "Add Deposit" or "Add Expense" to get started.</td></tr>';
            return;
        }
        
        // Sort by date (newest first) for display
        const sorted = [...transactions].sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateB - dateA;
        });
        
        let runningBalance = 0;
        // Calculate running balance from oldest to newest
        const oldestFirst = [...sorted].reverse();
        oldestFirst.forEach(t => {
            if (t.type === 'deposit') {
                runningBalance += t.amount;
            } else {
                runningBalance -= t.amount;
            }
            t.runningBalance = runningBalance;
        });
        
        tbody.innerHTML = sorted.map(transaction => {
            const date = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
            const formattedDate = formatDate(date);
            const amountStr = transaction.type === 'deposit' 
                ? '+' + formatCurrency(transaction.amount)
                : '-' + formatCurrency(transaction.amount);
            const amountClass = transaction.type === 'deposit' ? 'amount-positive' : 'amount-negative';
            
            const hasSplits = transaction.splits && transaction.splits.length > 0;
            const splitIndicator = hasSplits ? `<div class="split-indicator">📊 ${transaction.splits.length} splits</div>` : '';
            
            return `
                <tr class="transaction-row" data-id="${transaction.id}">
                    <td>${formattedDate}</td>
                    <td>
                        <div class="transaction-description">
                            <strong>${escapeHtml(transaction.description)}</strong>
                            <div class="transaction-category">${escapeHtml(transaction.category)}</div>
                            ${splitIndicator}
                        </div>
                    </td>
                    <td class="${amountClass}">${amountStr}</td>
                    <td>${formatCurrency(transaction.runningBalance)}</td>
                    <td class="transaction-actions">
                        ${hasSplits ? '<button class="btn-icon" onclick="window.ledger.viewSplits(\'' + transaction.id + '\')" title="View splits">📊</button>' : ''}
                        <button class="btn-icon" onclick="window.ledger.editTransaction(\'' + transaction.id + '\')" title="Edit">✏️</button>
                        <button class="btn-icon" onclick="window.ledger.deleteTransaction(\'' + transaction.id + '\')" title="Delete">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    /**
     * Open transaction modal
     */
    function openTransactionModal(type) {
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('transaction-form');
        
        if (!modal || !form) return;
        
        // Reset form
        form.reset();
        
        // Set title
        if (title) {
            title.textContent = type === 'deposit' ? 'Add Deposit' : 'Add Expense';
        }
        
        // Set transaction type
        const typeInput = document.getElementById('transaction-type');
        if (typeInput) {
            typeInput.value = type;
        }
        
        // Populate category dropdown
        populateCategoryDropdown(type);
        
        // Set default date to today
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Hide split section by default
        const splitSection = document.getElementById('split-transaction-section');
        const splitToggle = document.getElementById('split-transaction-toggle');
        if (splitSection) splitSection.style.display = 'none';
        if (splitToggle) splitToggle.checked = false;
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    /**
     * Close transaction modal
     */
    function closeTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Populate category dropdown
     */
    function populateCategoryDropdown(type) {
        const select = document.getElementById('transaction-category');
        if (!select) return;
        
        const categories = type === 'deposit' ? CATEGORIES.income : CATEGORIES.expense;
        
        select.innerHTML = categories.map(cat => 
            `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
        ).join('');
    }
    
    /**
     * Toggle split transaction section
     */
    function toggleSplitTransaction(e) {
        const splitSection = document.getElementById('split-transaction-section');
        if (!splitSection) return;
        
        if (e.target.checked) {
            splitSection.style.display = 'block';
            // Add initial split line if none exist
            const tbody = document.getElementById('splits-tbody');
            if (tbody && tbody.children.length === 0) {
                addSplitLine();
            }
        } else {
            splitSection.style.display = 'none';
        }
    }
    
    /**
     * Add split line
     */
    function addSplitLine() {
        const tbody = document.getElementById('splits-tbody');
        if (!tbody) return;
        
        const type = document.getElementById('transaction-type').value;
        const categories = type === 'deposit' ? CATEGORIES.income : CATEGORIES.expense;
        
        const row = document.createElement('tr');
        row.className = 'split-row';
        row.innerHTML = `
            <td><input type="text" class="split-member" placeholder="Member name"></td>
            <td>
                <select class="split-category">
                    ${categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('')}
                </select>
            </td>
            <td><input type="number" class="split-amount" placeholder="0.00" step="0.01" min="0"></td>
            <td><button type="button" class="btn-remove-split" onclick="this.parentElement.parentElement.remove(); window.ledger.updateSplitTotal();">❌</button></td>
        `;
        
        tbody.appendChild(row);
        
        // Add event listeners for amount changes
        const amountInput = row.querySelector('.split-amount');
        if (amountInput) {
            amountInput.addEventListener('input', updateSplitTotal);
        }
    }
    
    /**
     * Update split total
     */
    function updateSplitTotal() {
        const amounts = document.querySelectorAll('.split-amount');
        let total = 0;
        
        amounts.forEach(input => {
            const value = parseFloat(input.value) || 0;
            total += value;
        });
        
        const totalEl = document.getElementById('split-total');
        const mainAmount = parseFloat(document.getElementById('transaction-amount').value) || 0;
        
        if (totalEl) {
            totalEl.textContent = formatCurrency(total);
            
            // Check if total matches
            if (Math.abs(total - mainAmount) < 0.01) {
                totalEl.style.color = '#28a745';
                totalEl.innerHTML = formatCurrency(total) + ' ✅';
            } else {
                totalEl.style.color = '#dc3545';
                totalEl.innerHTML = formatCurrency(total) + ' ⚠️';
            }
        }
    }
    
    /**
     * Save transaction
     */
    async function saveTransaction() {
        const form = document.getElementById('transaction-form');
        if (!form) return;
        
        // Get form values
        const type = document.getElementById('transaction-type').value;
        const date = new Date(document.getElementById('transaction-date').value);
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const description = document.getElementById('transaction-description').value;
        const category = document.getElementById('transaction-category').value;
        const isSplit = document.getElementById('split-transaction-toggle').checked;
        
        // Validate
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (!description.trim()) {
            alert('Please enter a description');
            return;
        }
        
        // Build transaction object
        const transaction = {
            type,
            date,
            amount,
            description: description.trim(),
            category,
            createdAt: new Date()
        };
        
        // Handle splits
        if (isSplit) {
            const splits = [];
            const splitRows = document.querySelectorAll('.split-row');
            
            splitRows.forEach(row => {
                const member = row.querySelector('.split-member').value.trim();
                const splitCategory = row.querySelector('.split-category').value;
                const splitAmount = parseFloat(row.querySelector('.split-amount').value) || 0;
                
                if (member && splitAmount > 0) {
                    splits.push({
                        member,
                        category: splitCategory,
                        amount: splitAmount
                    });
                }
            });
            
            // Validate split total
            const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
            if (Math.abs(splitTotal - amount) > 0.01) {
                alert(`Split total ($${splitTotal.toFixed(2)}) must equal transaction amount ($${amount.toFixed(2)})`);
                return;
            }
            
            transaction.splits = splits;
        }
        
        // Save to Firebase or local storage
        try {
            if (db) {
                const docRef = await db.collection('transactions').add(transaction);
                transaction.id = docRef.id;
            } else {
                transaction.id = 'local-' + Date.now();
            }
            
            transactions.push(transaction);
            calculateBalance();
            renderTransactions();
            closeTransactionModal();
            
            showNotification('Transaction saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving transaction:', error);
            showNotification('Error saving transaction', 'error');
        }
    }
    
    /**
     * View transaction splits
     */
    function viewSplits(transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction || !transaction.splits) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const splitsHtml = transaction.splits.map(split => `
            <tr>
                <td>${escapeHtml(split.member)}</td>
                <td>${escapeHtml(split.category)}</td>
                <td style="text-align: right;">${formatCurrency(split.amount)}</td>
            </tr>
        `).join('');
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Split Transaction Details</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <h3>${escapeHtml(transaction.description)}</h3>
                    <p><strong>Date:</strong> ${formatDate(transaction.date)}</p>
                    <p><strong>Total Amount:</strong> ${formatCurrency(transaction.amount)}</p>
                    
                    <h4 style="margin-top: 1.5rem;">Split Breakdown:</h4>
                    <table class="splits-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Category</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${splitsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colspan="2">Total:</th>
                                <th style="text-align: right;">${formatCurrency(transaction.amount)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * Edit transaction
     */
    function editTransaction(transactionId) {
        // TODO: Implement edit functionality
        alert('Edit functionality coming soon!');
    }
    
    /**
     * Delete transaction
     */
    async function deleteTransaction(transactionId) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }
        
        try {
            if (db) {
                await db.collection('transactions').doc(transactionId).delete();
            }
            
            transactions = transactions.filter(t => t.id !== transactionId);
            calculateBalance();
            renderTransactions();
            
            showNotification('Transaction deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showNotification('Error deleting transaction', 'error');
        }
    }
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
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
    
    // Export functions for global access
    window.ledger = {
        viewSplits,
        editTransaction,
        deleteTransaction,
        updateSplitTotal
    };
    
})();
