/**
 * CVCWVUAA Category Management System
 * Allows admins to add, edit, and remove financial categories
 */

(function() {
    'use strict';
    
    // Default categories with subcategories
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
    
    let categories = {
        income: [],
        expense: []
    };
    
    let db = null;
    
    /**
     * Initialize the page
     */
    function init() {
        // Initialize Firebase
        if (typeof initializeFirebase === 'function') {
            const initialized = initializeFirebase();
            if (initialized && typeof firebase !== 'undefined') {
                db = firebase.firestore();
            }
        }
        
        loadCategories();
        renderCategories();
    }
    
    /**
     * Load categories from localStorage or Firebase
     */
    async function loadCategories() {
        try {
            // First try localStorage
            const stored = localStorage.getItem('financial_categories');
            if (stored) {
                const loadedCategories = JSON.parse(stored);
                
                // Check if we need to migrate from flat to hierarchical
                if (Array.isArray(loadedCategories.income)) {
                    console.log('Migrating flat categories to hierarchical structure...');
                    categories = migrateToHierarchical(loadedCategories);
                    // Save migrated version
                    localStorage.setItem('financial_categories', JSON.stringify(categories));
                } else {
                    categories = loadedCategories;
                }
                
                console.log('Loaded categories from localStorage');
                return;
            }
            
            // Then try Firebase
            if (db) {
                const doc = await db.collection('settings').doc('categories').get();
                if (doc.exists) {
                    const loadedCategories = doc.data();
                    
                    // Check if we need to migrate
                    if (Array.isArray(loadedCategories.income)) {
                        categories = migrateToHierarchical(loadedCategories);
                    } else {
                        categories = loadedCategories;
                    }
                    
                    console.log('Loaded categories from Firebase');
                    // Cache in localStorage
                    localStorage.setItem('financial_categories', JSON.stringify(categories));
                    return;
                }
            }
            
            // Fall back to defaults
            categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
            console.log('Using default categories');
            
        } catch (error) {
            console.error('Error loading categories:', error);
            categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        }
    }
    
    /**
     * Migrate flat categories to hierarchical structure
     */
    function migrateToHierarchical(flatCategories) {
        const hierarchical = {
            income: {},
            expense: {}
        };
        
        // Migrate income categories
        if (Array.isArray(flatCategories.income)) {
            hierarchical.income['Other Income'] = flatCategories.income;
        }
        
        // Migrate expense categories
        if (Array.isArray(flatCategories.expense)) {
            hierarchical.expense['Other Expense'] = flatCategories.expense;
        }
        
        return hierarchical;
    }
    
    /**
     * Render categories in the UI
     */
    function renderCategories() {
        renderCategoryList('income');
        renderCategoryList('expense');
    }
    
    /**
     * Render a specific category list with hierarchical structure
     */
    function renderCategoryList(type) {
        const list = document.getElementById(`${type}-list`);
        if (!list) return;
        
        const categoryData = categories[type];
        if (!categoryData || typeof categoryData !== 'object') {
            console.error(`Invalid category data for ${type}:`, categoryData);
            list.innerHTML = '<li style="color: red;">Error: Invalid category data structure</li>';
            return;
        }
        
        const mainCategories = Object.keys(categoryData);
        
        list.innerHTML = mainCategories.map((mainCat, mainIndex) => {
            const subcategories = categoryData[mainCat];
            
            // Validate subcategories is an array
            if (!Array.isArray(subcategories)) {
                console.error(`Subcategories for "${mainCat}" is not an array:`, subcategories);
                return `<li style="color: red;">Error: Invalid subcategories for "${mainCat}"</li>`;
            }
            
            const subcatHTML = subcategories.map((subcat, subIndex) => `
                <li class="subcategory-item">
                    <span class="subcategory-bullet">→</span>
                    <span class="subcategory-name">${escapeHtml(subcat)}</span>
                    <button class="btn-icon" onclick="window.categoryManager.editSubcategory('${type}', '${escapeHtml(mainCat)}', ${subIndex})" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="window.categoryManager.deleteSubcategory('${type}', '${escapeHtml(mainCat)}', ${subIndex})" title="Delete">🗑️</button>
                </li>
            `).join('');
            
            return `
                <li class="main-category-item">
                    <div class="main-category-header">
                        <span class="main-category-name">${escapeHtml(mainCat)}</span>
                        <div class="main-category-actions">
                            <button class="btn-icon btn-add-sub" onclick="window.categoryManager.addSubcategory('${type}', '${escapeHtml(mainCat)}')" title="Add Subcategory">➕ Add Sub</button>
                            <button class="btn-icon" onclick="window.categoryManager.editMainCategory('${type}', '${escapeHtml(mainCat)}')" title="Edit">✏️</button>
                            <button class="btn-icon" onclick="window.categoryManager.deleteMainCategory('${type}', '${escapeHtml(mainCat)}')" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <ul class="subcategory-list">
                        ${subcatHTML}
                    </ul>
                </li>
            `;
        }).join('');
    }
    
    /**
     * Add a new main category
     */
    window.addCategory = function(type) {
        const newCategory = prompt(`Enter new ${type} main category name:`);
        if (!newCategory || newCategory.trim() === '') return;
        
        const trimmed = newCategory.trim();
        
        // Check for duplicates
        if (categories[type][trimmed]) {
            showNotification('Main category already exists', 'error');
            return;
        }
        
        categories[type][trimmed] = [];
        renderCategoryList(type);
        showNotification(`Main category "${trimmed}" added`, 'success');
    };
    
    /**
     * Edit a main category name
     */
    function editMainCategory(type, oldName) {
        const newName = prompt(`Edit main category name:`, oldName);
        
        if (!newName || newName.trim() === '') return;
        if (newName === oldName) return;
        
        const trimmed = newName.trim();
        
        // Check for duplicates
        if (categories[type][trimmed]) {
            showNotification('Main category name already exists', 'error');
            return;
        }
        
        // Rename by creating new and deleting old
        categories[type][trimmed] = categories[type][oldName];
        delete categories[type][oldName];
        
        renderCategoryList(type);
        showNotification(`Category renamed from "${oldName}" to "${trimmed}"`, 'success');
    }
    
    /**
     * Delete a main category
     */
    function deleteMainCategory(type, mainCat) {
        const subcatCount = categories[type][mainCat].length;
        
        if (!confirm(`Are you sure you want to delete "${mainCat}" and its ${subcatCount} subcategories?\n\nExisting transactions will keep their current category.`)) {
            return;
        }
        
        delete categories[type][mainCat];
        renderCategoryList(type);
        showNotification(`Main category "${mainCat}" deleted`, 'success');
    }
    
    /**
     * Add a subcategory
     */
    function addSubcategory(type, mainCat) {
        const newSubcat = prompt(`Add subcategory to "${mainCat}":`);
        if (!newSubcat || newSubcat.trim() === '') return;
        
        const trimmed = newSubcat.trim();
        
        // Check for duplicates
        if (categories[type][mainCat].includes(trimmed)) {
            showNotification('Subcategory already exists', 'error');
            return;
        }
        
        categories[type][mainCat].push(trimmed);
        renderCategoryList(type);
        showNotification(`Subcategory "${trimmed}" added to "${mainCat}"`, 'success');
    }
    
    /**
     * Edit a subcategory
     */
    function editSubcategory(type, mainCat, subIndex) {
        const currentName = categories[type][mainCat][subIndex];
        const newName = prompt(`Edit subcategory name:`, currentName);
        
        if (!newName || newName.trim() === '') return;
        if (newName === currentName) return;
        
        const trimmed = newName.trim();
        
        // Check for duplicates (excluding current)
        if (categories[type][mainCat].some((cat, i) => i !== subIndex && cat === trimmed)) {
            showNotification('Subcategory name already exists', 'error');
            return;
        }
        
        const oldName = categories[type][mainCat][subIndex];
        categories[type][mainCat][subIndex] = trimmed;
        renderCategoryList(type);
        showNotification(`Subcategory renamed from "${oldName}" to "${trimmed}"`, 'success');
    }
    
    /**
     * Delete a subcategory
     */
    function deleteSubcategory(type, mainCat, subIndex) {
        const subcatName = categories[type][mainCat][subIndex];
        
        if (!confirm(`Delete subcategory "${subcatName}" from "${mainCat}"?\n\nExisting transactions will keep their current category.`)) {
            return;
        }
        
        categories[type][mainCat].splice(subIndex, 1);
        renderCategoryList(type);
        showNotification(`Subcategory "${subcatName}" deleted`, 'success');
    }
    
    /**
     * Save categories to localStorage and Firebase
     */
    window.saveCategories = async function() {
        try {
            // Validate - ensure at least one main category of each type
            if (Object.keys(categories.income).length === 0) {
                showNotification('You must have at least one income category', 'error');
                return;
            }
            
            if (Object.keys(categories.expense).length === 0) {
                showNotification('You must have at least one expense category', 'error');
                return;
            }
            
            // Save to localStorage
            localStorage.setItem('financial_categories', JSON.stringify(categories));
            console.log('Saved to localStorage');
            
            // Save to Firebase
            if (db) {
                await db.collection('settings').doc('categories').set(categories);
                console.log('Saved to Firebase');
            }
            
            showNotification('✅ Categories saved successfully!', 'success');
            
            // Redirect back to ledger after 2 seconds
            setTimeout(() => {
                window.location.href = 'financial-ledger.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error saving categories:', error);
            showNotification('Error saving categories: ' + error.message, 'error');
        }
    };
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Export functions for onclick handlers
    window.categoryManager = {
        editMainCategory,
        deleteMainCategory,
        addSubcategory,
        editSubcategory,
        deleteSubcategory
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
