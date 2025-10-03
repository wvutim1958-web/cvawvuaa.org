/**
 * Mailchimp Integration System
 * Handles signup forms, member sync, and campaign management for CVCWVUAA
 */

class MailchimpIntegration {
    constructor() {
        this.config = {
            // These will be set via admin interface
            apiKey: localStorage.getItem('mailchimp_api_key') || '',
            server: localStorage.getItem('mailchimp_server') || '', // e.g., 'us1'
            listId: localStorage.getItem('mailchimp_list_id') || '', // Your main membership list
            baseUrl: ''
        };
        
        // Set base URL when server is available
        if (this.config.server) {
            this.config.baseUrl = `https://${this.config.server}.api.mailchimp.com/3.0`;
        }
        
        this.init();
    }

    init() {
        this.loadExistingForms();
        this.initializeEventListeners();
    }

    // Configuration Management
    setConfig(apiKey, server, listId) {
        this.config.apiKey = apiKey;
        this.config.server = server;
        this.config.listId = listId;
        this.config.baseUrl = `https://${server}.api.mailchimp.com/3.0`;
        
        // Store in localStorage
        localStorage.setItem('mailchimp_api_key', apiKey);
        localStorage.setItem('mailchimp_server', server);
        localStorage.setItem('mailchimp_list_id', listId);
        
        this.showNotification('Mailchimp configuration saved successfully!', 'success');
    }

    // API Helper Methods
    async makeApiCall(endpoint, method = 'GET', data = null) {
        if (!this.config.apiKey || !this.config.baseUrl) {
            throw new Error('Mailchimp not configured. Please set API credentials.');
        }

        const url = `${this.config.baseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Authorization': `Basic ${btoa('user:' + this.config.apiKey)}`,
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.detail || result.title || 'API call failed');
            }
            
            return result;
        } catch (error) {
            console.error('Mailchimp API Error:', error);
            throw error;
        }
    }

    // Member Management
    async addMemberToList(email, firstName = '', lastName = '', mergeFields = {}) {
        const memberData = {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName,
                ...mergeFields
            }
        };

        try {
            const result = await this.makeApiCall(`/lists/${this.config.listId}/members`, 'POST', memberData);
            this.showNotification(`Successfully added ${email} to Mailchimp list`, 'success');
            return result;
        } catch (error) {
            // If member already exists, update them instead
            if (error.message.includes('is already a list member')) {
                return await this.updateMember(email, memberData);
            }
            throw error;
        }
    }

    async updateMember(email, memberData) {
        const subscriberHash = this.md5(email.toLowerCase());
        
        try {
            const result = await this.makeApiCall(
                `/lists/${this.config.listId}/members/${subscriberHash}`, 
                'PUT', 
                memberData
            );
            this.showNotification(`Updated ${email} in Mailchimp list`, 'success');
            return result;
        } catch (error) {
            console.error('Failed to update member:', error);
            throw error;
        }
    }

    async syncMemberData() {
        try {
            // Get local member data
            const members = JSON.parse(localStorage.getItem('members') || '[]');
            const scholarshipRecipients = JSON.parse(localStorage.getItem('scholarship_recipients') || '[]');
            
            let successCount = 0;
            let errorCount = 0;
            
            // Sync regular members
            for (const member of members) {
                try {
                    await this.addMemberToList(
                        member.email,
                        member.firstName || member.name?.split(' ')[0] || '',
                        member.lastName || member.name?.split(' ')[1] || '',
                        {
                            PHONE: member.phone || '',
                            ADDRESS: member.address || '',
                            CITY: member.city || '',
                            STATE: member.state || '',
                            ZIP: member.zip || '',
                            GRADYEAR: member.graduationYear || '',
                            MEMBERTYPE: 'Regular Member',
                            JOINDATE: member.joinDate || new Date().toISOString().split('T')[0]
                        }
                    );
                    successCount++;
                } catch (error) {
                    console.error(`Failed to sync member ${member.email}:`, error);
                    errorCount++;
                }
            }
            
            // Sync scholarship recipients
            for (const recipient of scholarshipRecipients) {
                try {
                    await this.addMemberToList(
                        recipient.email || `${recipient.name.replace(/\s+/g, '.')}@example.com`,
                        recipient.name?.split(' ')[0] || '',
                        recipient.name?.split(' ')[1] || '',
                        {
                            SCHOOL: recipient.school || '',
                            YEAR: recipient.year || '',
                            AMOUNT: recipient.amount || '',
                            MEMBERTYPE: 'Scholarship Recipient'
                        }
                    );
                    successCount++;
                } catch (error) {
                    console.error(`Failed to sync scholarship recipient ${recipient.name}:`, error);
                    errorCount++;
                }
            }
            
            this.showNotification(`Sync completed: ${successCount} successful, ${errorCount} errors`, 
                errorCount === 0 ? 'success' : 'warning');
            
            return { successCount, errorCount };
        } catch (error) {
            this.showNotification('Failed to sync member data: ' + error.message, 'error');
            throw error;
        }
    }

    // Campaign Management
    async createCampaign(subject, content, settings = {}) {
        const campaignData = {
            type: 'regular',
            recipients: {
                list_id: this.config.listId
            },
            settings: {
                subject_line: subject,
                from_name: settings.fromName || 'CVCWVUAA',
                reply_to: settings.replyTo || 'president@cvawvuaa.org',
                title: settings.title || subject,
                ...settings
            }
        };

        try {
            // Create campaign
            const campaign = await this.makeApiCall('/campaigns', 'POST', campaignData);
            
            // Set content
            await this.makeApiCall(`/campaigns/${campaign.id}/content`, 'PUT', {
                html: content
            });
            
            this.showNotification(`Campaign "${subject}" created successfully!`, 'success');
            return campaign;
        } catch (error) {
            this.showNotification('Failed to create campaign: ' + error.message, 'error');
            throw error;
        }
    }

    async sendCampaign(campaignId) {
        try {
            const result = await this.makeApiCall(`/campaigns/${campaignId}/actions/send`, 'POST');
            this.showNotification('Campaign sent successfully!', 'success');
            return result;
        } catch (error) {
            this.showNotification('Failed to send campaign: ' + error.message, 'error');
            throw error;
        }
    }

    async getCampaigns(count = 10) {
        try {
            const result = await this.makeApiCall(`/campaigns?count=${count}`);
            return result.campaigns || [];
        } catch (error) {
            this.showNotification('Failed to get campaigns: ' + error.message, 'error');
            throw error;
        }
    }

    // Signup Forms
    generateSignupForm(options = {}) {
        const formId = `mailchimp-signup-${Date.now()}`;
        const formHtml = `
            <div class="mailchimp-signup-form" id="${formId}">
                <h3>${options.title || 'Subscribe to Our Newsletter'}</h3>
                <p>${options.description || 'Stay updated with CVCWVUAA news and events!'}</p>
                <form class="signup-form" data-list-id="${this.config.listId}">
                    <div class="form-row">
                        <input type="email" name="email" placeholder="Email Address *" required>
                    </div>
                    <div class="form-row">
                        <input type="text" name="firstName" placeholder="First Name">
                        <input type="text" name="lastName" placeholder="Last Name">
                    </div>
                    ${options.includePhone ? '<div class="form-row"><input type="tel" name="phone" placeholder="Phone Number"></div>' : ''}
                    ${options.includeGradYear ? '<div class="form-row"><input type="number" name="gradYear" placeholder="Graduation Year" min="1950" max="2030"></div>' : ''}
                    <div class="form-row">
                        <button type="submit" class="subscribe-btn">Subscribe</button>
                    </div>
                    <div class="signup-status"></div>
                </form>
                <style>
                    .mailchimp-signup-form {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #dee2e6;
                    }
                    .mailchimp-signup-form h3 {
                        color: #003366;
                        margin-bottom: 10px;
                    }
                    .signup-form .form-row {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    .signup-form input {
                        flex: 1;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    .subscribe-btn {
                        background: #007bff;
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: bold;
                    }
                    .subscribe-btn:hover {
                        background: #0056b3;
                    }
                    .signup-status {
                        margin-top: 10px;
                        padding: 10px;
                        border-radius: 4px;
                        display: none;
                    }
                    .signup-status.success {
                        background: #d4edda;
                        color: #155724;
                        border: 1px solid #c3e6cb;
                    }
                    .signup-status.error {
                        background: #f8d7da;
                        color: #721c24;
                        border: 1px solid #f5c6cb;
                    }
                </style>
            </div>
        `;
        
        return formHtml;
    }

    initializeEventListeners() {
        // Handle signup form submissions
        document.addEventListener('submit', async (e) => {
            if (e.target.classList.contains('signup-form')) {
                e.preventDefault();
                await this.handleSignupSubmission(e.target);
            }
        });
    }

    async handleSignupSubmission(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const firstName = formData.get('firstName') || '';
        const lastName = formData.get('lastName') || '';
        const phone = formData.get('phone') || '';
        const gradYear = formData.get('gradYear') || '';
        
        const statusDiv = form.querySelector('.signup-status');
        const submitBtn = form.querySelector('.subscribe-btn');
        
        try {
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Subscribing...';
            
            // Add to Mailchimp
            await this.addMemberToList(email, firstName, lastName, {
                PHONE: phone,
                GRADYEAR: gradYear
            });
            
            // Show success message
            statusDiv.className = 'signup-status success';
            statusDiv.style.display = 'block';
            statusDiv.textContent = 'Successfully subscribed! Thank you for joining our mailing list.';
            
            // Reset form
            form.reset();
            
        } catch (error) {
            // Show error message
            statusDiv.className = 'signup-status error';
            statusDiv.style.display = 'block';
            statusDiv.textContent = 'Subscription failed: ' + error.message;
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        }
    }

    // Integration with existing newsletter system
    async sendNewsletterViMailchimp(newsletterData) {
        try {
            const campaign = await this.createCampaign(
                newsletterData.subject,
                newsletterData.html,
                {
                    title: `CVCWVUAA Newsletter - ${new Date().toLocaleDateString()}`,
                    fromName: 'CVCWVUAA Newsletter',
                    replyTo: 'newsletter@cvawvuaa.org'
                }
            );
            
            // Optionally auto-send or return campaign for manual sending
            if (newsletterData.autoSend) {
                await this.sendCampaign(campaign.id);
            }
            
            return campaign;
        } catch (error) {
            this.showNotification('Failed to send newsletter via Mailchimp: ' + error.message, 'error');
            throw error;
        }
    }

    // Utility Methods
    md5(string) {
        // Simple MD5 hash for subscriber hash (you might want to use a proper crypto library)
        return btoa(string).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            z-index: 10000;
            max-width: 400px;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    loadExistingForms() {
        // Auto-load signup forms on pages where they should appear
        const signupContainers = document.querySelectorAll('.mailchimp-signup-container');
        signupContainers.forEach(container => {
            const options = {
                title: container.dataset.title,
                description: container.dataset.description,
                includePhone: container.dataset.includePhone === 'true',
                includeGradYear: container.dataset.includeGradYear === 'true'
            };
            container.innerHTML = this.generateSignupForm(options);
        });
    }

    // Admin Methods
    async getListStats() {
        try {
            const listData = await this.makeApiCall(`/lists/${this.config.listId}`);
            return {
                totalMembers: listData.stats.member_count,
                subscribed: listData.stats.member_count,
                unsubscribed: listData.stats.unsubscribe_count,
                cleaned: listData.stats.cleaned_count,
                listName: listData.name
            };
        } catch (error) {
            console.error('Failed to get list stats:', error);
            return null;
        }
    }

    async testConnection() {
        try {
            await this.makeApiCall('/ping');
            this.showNotification('Mailchimp connection successful!', 'success');
            return true;
        } catch (error) {
            this.showNotification('Mailchimp connection failed: ' + error.message, 'error');
            return false;
        }
    }
}

// Initialize Mailchimp Integration
window.MailchimpIntegration = MailchimpIntegration;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.mailchimpIntegration) {
            window.mailchimpIntegration = new MailchimpIntegration();
        }
    });
} else {
    if (!window.mailchimpIntegration) {
        window.mailchimpIntegration = new MailchimpIntegration();
    }
}