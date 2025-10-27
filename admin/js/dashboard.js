/**
 * CVCWVUAA Admin Dashboard
 * Main overview page with key statistics and recent activity
 */

(function() {
    'use strict';
    
    let db = null;
    
    /**
     * Initialize dashboard
     */
    function init() {
        console.log('Initializing dashboard...');
        
        // Initialize Firebase
        if (typeof initializeFirebase === 'function') {
            initializeFirebase();
            if (typeof firebase !== 'undefined') {
                db = firebase.firestore();
                loadDashboardData();
            }
        }
    }
    
    /**
     * Get current membership year
     */
    function getCurrentMembershipYear() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        
        if (currentMonth < 6) {
            return {
                startYear: currentYear - 1,
                endYear: currentYear,
                startDate: new Date(currentYear - 1, 6, 1),
                endDate: new Date(currentYear, 5, 30)
            };
        } else {
            return {
                startYear: currentYear,
                endYear: currentYear + 1,
                startDate: new Date(currentYear, 6, 1),
                endDate: new Date(currentYear + 1, 5, 30)
            };
        }
    }
    
    /**
     * Load all dashboard data
     */
    async function loadDashboardData() {
        try {
            // Load in parallel for speed
            await Promise.all([
                loadBalanceData(),
                loadMemberStats(),
                loadRecentPayments()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    /**
     * Load current balance from financial ledger
     */
    async function loadBalanceData() {
        try {
            const snapshot = await db.collection('transactions')
                .orderBy('date', 'asc')
                .get();
            
            let balance = 0;
            snapshot.forEach(doc => {
                const t = doc.data();
                const amount = parseFloat(t.amount) || 0;
                
                if (t.type === 'deposit') {
                    balance += amount;
                } else if (t.type === 'expense') {
                    balance -= amount;
                }
            });
            
            const balanceEl = document.getElementById('currentBalance');
            if (balanceEl) {
                balanceEl.textContent = formatCurrency(balance);
                if (balance < 0) {
                    balanceEl.style.color = '#dc3545';
                }
            }
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    }
    
    /**
     * Load member statistics
     */
    async function loadMemberStats() {
        try {
            const membershipYear = getCurrentMembershipYear();
            const snapshot = await db.collection('members').get();
            
            let totalMembers = 0;
            let paidCount = 0;
            let outstandingCount = 0;
            
            snapshot.forEach(doc => {
                const member = doc.data();
                totalMembers++;
                
                // Check if paid current year dues
                const payments = member.payments || [];
                const hasPaid = payments.some(payment => {
                    if (payment.type !== 'dues') return false;
                    
                    let paymentDate;
                    if (payment.date && payment.date.toDate) {
                        paymentDate = payment.date.toDate();
                    } else {
                        paymentDate = new Date(payment.date);
                    }
                    
                    return paymentDate >= membershipYear.startDate && 
                           paymentDate <= membershipYear.endDate;
                });
                
                if (hasPaid) {
                    paidCount++;
                } else {
                    outstandingCount++;
                }
            });
            
            // Update UI
            const totalEl = document.getElementById('totalMembers');
            if (totalEl) totalEl.textContent = totalMembers;
            
            const paidEl = document.getElementById('paidCount');
            if (paidEl) paidEl.textContent = paidCount;
            
            const outstandingEl = document.getElementById('outstandingCount');
            if (outstandingEl) outstandingEl.textContent = outstandingCount;
            
        } catch (error) {
            console.error('Error loading member stats:', error);
        }
    }
    
    /**
     * Load recent payments (last 5)
     */
    async function loadRecentPayments() {
        try {
            const snapshot = await db.collection('members').get();
            
            // Collect all payments from all members
            let allPayments = [];
            
            snapshot.forEach(doc => {
                const member = doc.data();
                const payments = member.payments || [];
                
                // Get member name from various possible fields
                const memberName = member.name || 
                                  (member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : null) ||
                                  member.email ||
                                  'Unknown Member';
                
                payments.forEach(payment => {
                    let paymentDate;
                    if (payment.date && payment.date.toDate) {
                        paymentDate = payment.date.toDate();
                    } else if (payment.date) {
                        paymentDate = new Date(payment.date);
                    } else {
                        return; // Skip payments without dates
                    }
                    
                    // Get amount from various possible fields
                    const amount = payment.actualReceived || payment.amount || payment.duesAmount || 0;
                    
                    // Only include payments with valid amounts
                    if (amount && amount > 0) {
                        allPayments.push({
                            memberName: memberName,
                            date: paymentDate,
                            type: payment.type || 'dues',
                            amount: amount,
                            paymentMethod: payment.paymentMethod || 'undefined'
                        });
                    }
                });
            });
            
            // Sort by date (newest first) and take top 5
            allPayments.sort((a, b) => b.date - a.date);
            const recentPayments = allPayments.slice(0, 5);
            
            // Render
            const loadingEl = document.getElementById('recentPaymentsLoading');
            const listEl = document.getElementById('recentPaymentsList');
            
            if (recentPayments.length === 0) {
                if (loadingEl) loadingEl.innerHTML = '<div class="no-data">No recent payments</div>';
                return;
            }
            
            if (loadingEl) loadingEl.style.display = 'none';
            if (listEl) {
                listEl.style.display = 'block';
                listEl.innerHTML = recentPayments.map(payment => {
                    const typeLabel = payment.type === 'dues' ? 'Dues' :
                                     payment.type === 'scholarship' ? 'Scholarship Donation' :
                                     payment.type === 'chapter' ? 'Chapter Donation' : 'Payment';
                    
                    const dateStr = payment.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    
                    return `
                        <li class="payment-item">
                            <div class="payment-info">
                                <div class="payment-name">${escapeHtml(payment.memberName)}</div>
                                <div class="payment-details">${typeLabel} • ${payment.paymentMethod} • ${dateStr}</div>
                            </div>
                            <div class="payment-amount">${formatCurrency(payment.amount)}</div>
                        </li>
                    `;
                }).join('');
            }
            
        } catch (error) {
            console.error('Error loading recent payments:', error);
            const loadingEl = document.getElementById('recentPaymentsLoading');
            if (loadingEl) {
                loadingEl.innerHTML = '<div class="no-data" style="color: #dc3545;">Error loading payments</div>';
            }
        }
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
     * Escape HTML
     */
    function escapeHtml(text) {
        if (!text) return '';
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
