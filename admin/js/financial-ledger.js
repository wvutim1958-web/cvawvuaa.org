/**
 * CVCWVUAA Financial Ledger System
 * Complete accounting ledger with split transactions, categories, and reporting
 */

(function() {
    'use strict';
    
    // Default categories with hierarchical structure
    const DEFAULT_CATEGORIES = {
        income: {
            'Members': ['Dues', 'Donations', 'Scholarship Donations'],
            'Chapter': ['General Donations', 'Event Revenue'],
            'Other Income': ['Merchandise Sales', 'Interest Income', 'Other']
        },
        expense: {
            'Scholarships': ['Fund Contributions', 'Awards Paid'],
            'Operations': ['Event Costs', 'Operating Expenses'],
            'Office': ['Marketing/Printing', 'Supplies'],
            'Technology': ['Website Hosting', 'Mailchimp/Communications'],
            'Compliance': ['Bank Fees', 'St & Fed Filing Fees'],
            'Donations': ['Donations Made'],
            'Other Expense': ['Miscellaneous']
        }
    };
    
    // Load categories from localStorage or use defaults
    let CATEGORIES = DEFAULT_CATEGORIES;
    try {
        const stored = localStorage.getItem('financial_categories');
        if (stored) {
            CATEGORIES = JSON.parse(stored);
            console.log('Loaded custom categories from localStorage');
        }
    } catch (e) {
        console.warn('Error loading custom categories, using defaults:', e);
    }
    
    /**
     * Check if using hierarchical categories
     */
    function isHierarchical(categories) {
        if (!categories || !categories.income) return false;
        return typeof categories.income === 'object' && !Array.isArray(categories.income);
    }
    
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
                const data = doc.data();
                // Convert Firestore Timestamp to JavaScript Date
                if (data.date && data.date.toDate) {
                    data.date = data.date.toDate();
                } else if (data.date && typeof data.date === 'string') {
                    data.date = new Date(data.date);
                }
                transactions.push({ id: doc.id, ...data });
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
     * DISABLED - Using real Firebase data only
     */
    function loadDemoData() {
        // Demo data disabled - show empty state
        transactions = [];
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
            // Handle Firestore Timestamps
            let dateA, dateB;
            
            if (a.date && a.date.toDate) {
                dateA = a.date.toDate();
            } else if (a.date instanceof Date) {
                dateA = a.date;
            } else {
                dateA = new Date(a.date);
            }
            
            if (b.date && b.date.toDate) {
                dateB = b.date.toDate();
            } else if (b.date instanceof Date) {
                dateB = b.date;
            } else {
                dateB = new Date(b.date);
            }
            
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
            // Handle Firestore Timestamps
            let dateA, dateB;
            
            if (a.date && a.date.toDate) {
                dateA = a.date.toDate();
            } else if (a.date instanceof Date) {
                dateA = a.date;
            } else {
                dateA = new Date(a.date);
            }
            
            if (b.date && b.date.toDate) {
                dateB = b.date.toDate();
            } else if (b.date instanceof Date) {
                dateB = b.date;
            } else {
                dateB = new Date(b.date);
            }
            
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
            // Pass the original date object to formatDate - it will handle Timestamps, Dates, and strings
            const formattedDate = formatDate(transaction.date);
            const amountStr = transaction.type === 'deposit' 
                ? '+' + formatCurrency(transaction.amount)
                : '-' + formatCurrency(transaction.amount);
            const amountClass = transaction.type === 'deposit' ? 'amount-positive' : 'amount-negative';
            
            const hasSplits = transaction.splits && transaction.splits.length > 0;
            const splitIndicator = hasSplits ? `<div class="split-indicator">📊 ${transaction.splits.length} splits</div>` : '';
            
            // Display category or special label for uncategorized transactions
            const categoryDisplay = transaction.category ? 
                escapeHtml(transaction.category) : 
                '<em style="color: #999;">No category</em>';
            
            return `
                <tr class="transaction-row" data-id="${transaction.id}">
                    <td>${formattedDate}</td>
                    <td>${escapeHtml(transaction.payee || 'N/A')}</td>
                    <td style="text-align: center; color: #666;">${escapeHtml(transaction.checkNumber || '—')}</td>
                    <td>
                        <div class="transaction-description">
                            <strong>${escapeHtml(transaction.description)}</strong>
                            <div class="transaction-category">${categoryDisplay}</div>
                            ${splitIndicator}
                        </div>
                    </td>
                    <td class="${amountClass}">${amountStr}</td>
                    <td>${formatCurrency(transaction.runningBalance)}</td>
                    <td class="transaction-actions">
                        ${hasSplits ? `<button class="btn-icon" onclick="window.ledger.viewSplits('${transaction.id}')" title="View splits">📊</button>` : ''}
                        <button class="btn-icon" onclick="window.ledger.editTransaction('${transaction.id}')" title="Edit">✏️</button>
                        <button class="btn-icon" onclick="window.ledger.deleteTransaction('${transaction.id}')" title="Delete">🗑️</button>
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
        
        // Clear any editing ID
        delete form.dataset.editingId;
        
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
        
        // Set default date to today (use local timezone)
        const dateInput = document.getElementById('transaction-date');
        if (dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        
        // Hide split section by default
        const splitSection = document.getElementById('split-transaction-section');
        const splitToggle = document.getElementById('split-transaction-toggle');
        if (splitSection) splitSection.style.display = 'none';
        if (splitToggle) splitToggle.checked = false;
        
        // Clear split rows
        const tbody = document.getElementById('splits-tbody');
        if (tbody) tbody.innerHTML = '';
        
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
        
        const categoryData = type === 'deposit' ? CATEGORIES.income : CATEGORIES.expense;
        
        // Add blank option for non-categorized transactions (like beginning balance)
        let optionsHTML = '<option value="">(No Category - Not counted in reports)</option>';
        
        // Check if hierarchical or flat structure
        if (isHierarchical(CATEGORIES)) {
            // Hierarchical: use optgroups
            Object.keys(categoryData).forEach(mainCat => {
                const subcats = categoryData[mainCat];
                optionsHTML += `<optgroup label="${escapeHtml(mainCat)}">`;
                // Add option for just the main category
                optionsHTML += `<option value="${escapeHtml(mainCat)}">${escapeHtml(mainCat)} (General)</option>`;
                // Add subcategory options
                subcats.forEach(subcat => {
                    const fullCategory = `${mainCat} - ${subcat}`;
                    optionsHTML += `<option value="${escapeHtml(fullCategory)}">${escapeHtml(fullCategory)}</option>`;
                });
                optionsHTML += '</optgroup>';
            });
        } else {
            // Flat: simple list (backwards compatibility)
            categoryData.forEach(cat => {
                optionsHTML += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
            });
        }
        
        select.innerHTML = optionsHTML;
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
        const categoryData = type === 'deposit' ? CATEGORIES.income : CATEGORIES.expense;
        
        // Build category options based on structure
        let categoryOptions = '';
        if (isHierarchical(CATEGORIES)) {
            Object.keys(categoryData).forEach(mainCat => {
                const subcats = categoryData[mainCat];
                categoryOptions += `<optgroup label="${escapeHtml(mainCat)}">`;
                // Add option for just the main category
                categoryOptions += `<option value="${escapeHtml(mainCat)}">${escapeHtml(mainCat)} (General)</option>`;
                // Add subcategory options
                subcats.forEach(subcat => {
                    const fullCategory = `${mainCat} - ${subcat}`;
                    categoryOptions += `<option value="${escapeHtml(fullCategory)}">${escapeHtml(fullCategory)}</option>`;
                });
                categoryOptions += '</optgroup>';
            });
        } else {
            categoryData.forEach(cat => {
                categoryOptions += `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`;
            });
        }
        
        const row = document.createElement('tr');
        row.className = 'split-row';
        row.innerHTML = `
            <td><input type="text" class="split-member" placeholder="Member name"></td>
            <td>
                <select class="split-category">
                    ${categoryOptions}
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
        
        // Check if we're editing an existing transaction
        const editingId = form.dataset.editingId;
        
        // Get form values
        const type = document.getElementById('transaction-type').value;
        // Parse date in local timezone to avoid date shifting
        const dateString = document.getElementById('transaction-date').value;
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0); // Set to noon to avoid timezone issues
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const payee = document.getElementById('transaction-payee').value;
        const checkNumber = document.getElementById('transaction-check-number').value;
        const description = document.getElementById('transaction-description').value;
        const category = document.getElementById('transaction-category').value;
        const isSplit = document.getElementById('split-transaction-toggle').checked;
        
        // Validate
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (!payee.trim()) {
            alert('Please enter a payee/payor');
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
            payee: payee.trim(),
            checkNumber: checkNumber.trim() || null,
            description: description.trim(),
            category,
            createdAt: editingId ? transactions.find(t => t.id === editingId)?.createdAt : new Date()
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
            if (editingId) {
                // Update existing transaction
                if (db) {
                    await db.collection('transactions').doc(editingId).update(transaction);
                }
                
                const index = transactions.findIndex(t => t.id === editingId);
                if (index !== -1) {
                    transactions[index] = { ...transaction, id: editingId };
                }
                
                showNotification('Transaction updated successfully!', 'success');
            } else {
                // Add new transaction
                if (db) {
                    const docRef = await db.collection('transactions').add(transaction);
                    transaction.id = docRef.id;
                } else {
                    transaction.id = 'local-' + Date.now();
                }
                
                transactions.push(transaction);
                showNotification('Transaction saved successfully!', 'success');
            }
            
            calculateBalance();
            renderTransactions();
            closeTransactionModal();
            
            // Clear editing ID
            delete form.dataset.editingId;
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
                    <p><strong>Payee:</strong> ${escapeHtml(transaction.payee || 'N/A')}</p>
                    ${transaction.checkNumber ? `<p><strong>Check #:</strong> ${escapeHtml(transaction.checkNumber)}</p>` : ''}
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
    /**
     * Edit transaction
     */
    function editTransaction(transactionId) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) {
            showNotification('Transaction not found', 'error');
            return;
        }
        
        const modal = document.getElementById('transaction-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('transaction-form');
        
        if (!modal || !form) return;
        
        // Set title
        if (title) {
            title.textContent = transaction.type === 'deposit' ? 'Edit Deposit' : 'Edit Expense';
        }
        
        // Populate category dropdown
        populateCategoryDropdown(transaction.type);
        
        // Set form values
        document.getElementById('transaction-type').value = transaction.type;
        
        // Format date for input (YYYY-MM-DD) - use local timezone
        let date;
        if (transaction.date && transaction.date.toDate) {
            // Firestore Timestamp
            date = transaction.date.toDate();
        } else if (transaction.date instanceof Date) {
            date = transaction.date;
        } else {
            date = new Date(transaction.date);
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        document.getElementById('transaction-date').value = `${year}-${month}-${day}`;
        
        document.getElementById('transaction-amount').value = transaction.amount;
        document.getElementById('transaction-payee').value = transaction.payee || '';
        document.getElementById('transaction-check-number').value = transaction.checkNumber || '';
        document.getElementById('transaction-description').value = transaction.description;
        document.getElementById('transaction-category').value = transaction.category || '';
        
        // Handle splits if present
        const splitToggle = document.getElementById('split-transaction-toggle');
        const splitSection = document.getElementById('split-transaction-section');
        
        if (transaction.splits && transaction.splits.length > 0) {
            splitToggle.checked = true;
            splitSection.style.display = 'block';
            
            // Clear existing split rows
            const tbody = document.getElementById('splits-tbody');
            tbody.innerHTML = '';
            
            // Add split rows with data
            transaction.splits.forEach(split => {
                addSplitLine();
                const lastRow = tbody.lastElementChild;
                lastRow.querySelector('.split-member').value = split.member;
                lastRow.querySelector('.split-category').value = split.category;
                lastRow.querySelector('.split-amount').value = split.amount;
            });
            
            updateSplitTotal();
        } else {
            splitToggle.checked = false;
            splitSection.style.display = 'none';
        }
        
        // Store the transaction ID for updating
        form.dataset.editingId = transactionId;
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    /**
     * Delete transaction
     */
    async function deleteTransaction(transactionId) {
        console.log('deleteTransaction called with ID:', transactionId);
        
        if (!transactionId) {
            console.error('No transaction ID provided');
            showNotification('Error: No transaction ID', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this transaction?')) {
            console.log('Delete cancelled by user');
            return;
        }
        
        try {
            console.log('Attempting to delete transaction:', transactionId);
            
            if (db) {
                console.log('Deleting from Firestore...');
                await db.collection('transactions').doc(transactionId).delete();
                console.log('Deleted from Firestore successfully');
            } else {
                console.log('No database connection, deleting from local array only');
            }
            
            const beforeCount = transactions.length;
            transactions = transactions.filter(t => t.id !== transactionId);
            const afterCount = transactions.length;
            console.log(`Transactions before: ${beforeCount}, after: ${afterCount}`);
            
            calculateBalance();
            renderTransactions();
            
            showNotification('Transaction deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            console.error('Error details:', error.message, error.stack);
            showNotification('Error deleting transaction: ' + error.message, 'error');
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
        if (!date) return 'N/A';
        
        // Handle Firestore Timestamp
        let d;
        if (date.toDate && typeof date.toDate === 'function') {
            d = date.toDate();
        } else if (date instanceof Date) {
            d = date;
        } else {
            d = new Date(date);
        }
        
        // Check if date is valid
        if (isNaN(d.getTime())) {
            console.error('Invalid date:', date);
            return 'Invalid Date';
        }
        
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
        updateSplitTotal,
        
        // Utility function to convert initial deposit to beginning balance
        async convertToBeginningBalance() {
            if (!db) {
                alert('Database not initialized');
                return;
            }
            
            try {
                console.log('Finding oldest transaction...');
                
                // Get the oldest transaction
                const snapshot = await db.collection('transactions')
                    .orderBy('date', 'asc')
                    .limit(1)
                    .get();
                
                if (snapshot.empty) {
                    console.log('No transactions found');
                    alert('No transactions found in ledger');
                    return;
                }
                
                const doc = snapshot.docs[0];
                const data = doc.data();
                
                console.log('Current transaction:', data);
                
                const confirmed = confirm(
                    `Convert this transaction to Beginning Balance?\n\n` +
                    `Current Description: ${data.description}\n` +
                    `Current Category: ${data.category || '(none)'}\n` +
                    `Amount: $${data.amount.toFixed(2)}\n\n` +
                    `It will become:\n` +
                    `Description: Beginning Balance\n` +
                    `Category: (none)\n` +
                    `Amount: $${data.amount.toFixed(2)}`
                );
                
                if (!confirmed) {
                    console.log('Cancelled by user');
                    return;
                }
                
                // Update the transaction
                await db.collection('transactions').doc(doc.id).update({
                    description: 'Beginning Balance',
                    category: '',
                    payee: '',
                    type: 'deposit'
                });
                
                console.log('✅ Updated successfully!');
                alert('✅ Beginning balance updated! Refreshing page...');
                
                // Reload to show changes
                window.location.reload();
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error updating transaction: ' + error.message);
            }
        }
    };
    
})();
