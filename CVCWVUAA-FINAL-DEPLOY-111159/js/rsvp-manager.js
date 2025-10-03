/**
 * RSVP Management System
 * Handles event RSVPs, tracking, and admin management
 */
class RSVPManager {
  constructor() {
    this.rsvps = this.loadRSVPs();
    this.events = [];
    this.init();
  }

  async init() {
    await this.loadEvents();
    this.setupEventListeners();
  }

  // Load events from events.json
  async loadEvents() {
    try {
      const response = await fetch('/events/events.json', { cache: 'no-store' });
      if (response.ok) {
        this.events = await response.json();
      }
    } catch (error) {
      console.warn('Could not load events:', error);
    }
  }

  // Load RSVPs from localStorage (in real app, this would be from database)
  loadRSVPs() {
    const stored = localStorage.getItem('cvcwvuaa-rsvps');
    return stored ? JSON.parse(stored) : {};
  }

  // Save RSVPs to localStorage
  saveRSVPs() {
    localStorage.setItem('cvcwvuaa-rsvps', JSON.stringify(this.rsvps));
  }

  // Submit a new RSVP
  submitRSVP(eventSlug, rsvpData) {
    const rsvpId = this.generateRSVPId();
    
    if (!this.rsvps[eventSlug]) {
      this.rsvps[eventSlug] = [];
    }

    const rsvp = {
      id: rsvpId,
      eventSlug: eventSlug,
      timestamp: new Date().toISOString(),
      ...rsvpData
    };

    this.rsvps[eventSlug].push(rsvp);
    this.saveRSVPs();

    // Send confirmation
    this.sendRSVPConfirmation(rsvp);
    
    return rsvpId;
  }

  // Generate unique RSVP ID
  generateRSVPId() {
    return 'rsvp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get RSVPs for a specific event
  getEventRSVPs(eventSlug) {
    return this.rsvps[eventSlug] || [];
  }

  // Get all RSVPs
  getAllRSVPs() {
    return this.rsvps;
  }

  // Get RSVP statistics
  getRSVPStats(eventSlug = null) {
    if (eventSlug) {
      const eventRSVPs = this.getEventRSVPs(eventSlug);
      return {
        total: eventRSVPs.length,
        attending: eventRSVPs.filter(r => r.attending === 'yes').length,
        notAttending: eventRSVPs.filter(r => r.attending === 'no').length,
        maybe: eventRSVPs.filter(r => r.attending === 'maybe').length
      };
    } else {
      // Overall stats
      let total = 0, attending = 0, notAttending = 0, maybe = 0;
      
      Object.values(this.rsvps).forEach(eventRSVPs => {
        total += eventRSVPs.length;
        attending += eventRSVPs.filter(r => r.attending === 'yes').length;
        notAttending += eventRSVPs.filter(r => r.attending === 'no').length;
        maybe += eventRSVPs.filter(r => r.attending === 'maybe').length;
      });

      return { total, attending, notAttending, maybe };
    }
  }

  // Send RSVP confirmation (simulation)
  sendRSVPConfirmation(rsvp) {
    const event = this.events.find(e => e.slug === rsvp.eventSlug);
    const eventTitle = event ? event.title : 'Event';
    
    this.showNotification(
      `✅ RSVP confirmed for "${eventTitle}"! Confirmation ID: ${rsvp.id.slice(-8)}`,
      'success'
    );
  }

  // Setup form event listeners
  setupEventListeners() {
    // Enhanced RSVP form submission
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
      rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRSVPSubmission(e.target);
      });
    }

    // Auto-populate event from URL
    this.autoPopulateEventFromURL();
  }

  // Handle RSVP form submission
  handleRSVPSubmission(form) {
    const formData = new FormData(form);
    const rsvpData = {
      name: formData.get('Name'),
      email: formData.get('Email'),
      phone: formData.get('Phone'),
      attending: formData.get('attending'),
      guests: parseInt(formData.get('guests')) || 0,
      comments: formData.get('comments'),
      memberType: formData.get('member-type'),
      eventName: formData.get('Event')
    };

    // Get event slug from form or URL
    const eventSlug = formData.get('event-slug') || this.getEventSlugFromURL();
    
    if (!eventSlug) {
      this.showNotification('❌ Event not specified', 'error');
      return;
    }

    // Validate required fields
    if (!rsvpData.name || !rsvpData.email || !rsvpData.attending) {
      this.showNotification('❌ Please fill in all required fields', 'error');
      return;
    }

    try {
      const rsvpId = this.submitRSVP(eventSlug, rsvpData);
      
      // Still submit to FormSubmit for email notifications
      this.submitToFormSubmit(form, rsvpId);
      
      // Clear form
      form.reset();
      
      // Show success message
      this.showRSVPSuccess(rsvpId);
      
    } catch (error) {
      console.error('RSVP submission error:', error);
      this.showNotification('❌ RSVP submission failed. Please try again.', 'error');
    }
  }

  // Submit to FormSubmit for email notifications
  async submitToFormSubmit(form, rsvpId) {
    try {
      // Add RSVP ID to form data
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'rsvp_id';
      hiddenInput.value = rsvpId;
      form.appendChild(hiddenInput);

      // Submit form
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form)
      });

      console.log('FormSubmit response:', response.ok);
    } catch (error) {
      console.warn('FormSubmit error:', error);
    }
  }

  // Auto-populate event details from URL parameters
  autoPopulateEventFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventSlug = urlParams.get('event');
    
    if (eventSlug) {
      const event = this.events.find(e => e.slug === eventSlug);
      if (event) {
        // Populate event field
        const eventField = document.getElementById('event-name');
        if (eventField) {
          eventField.value = event.title;
        }

        // Add hidden field for event slug
        const form = document.getElementById('rsvp-form');
        if (form && !form.querySelector('input[name="event-slug"]')) {
          const hiddenInput = document.createElement('input');
          hiddenInput.type = 'hidden';
          hiddenInput.name = 'event-slug';
          hiddenInput.value = eventSlug;
          form.appendChild(hiddenInput);
        }

        // Update page title
        document.title = `RSVP - ${event.title} • CVCWVUAA`;
      }
    }
  }

  // Get event slug from URL
  getEventSlugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event');
  }

  // Show RSVP success message
  showRSVPSuccess(rsvpId) {
    const successHtml = `
      <div class="rsvp-success" style="
        background: #d4edda; border: 1px solid #c3e6cb; color: #155724;
        padding: 20px; border-radius: 8px; margin: 20px 0;
      ">
        <h3 style="margin-top: 0; color: #155724;">✅ RSVP Confirmed!</h3>
        <p><strong>Confirmation ID:</strong> ${rsvpId.slice(-8)}</p>
        <p>Thank you for your response. You should receive a confirmation email shortly.</p>
        <p><a href="/events.html">← Back to Events</a></p>
      </div>
    `;

    const form = document.getElementById('rsvp-form');
    if (form) {
      form.style.display = 'none';
      form.insertAdjacentHTML('afterend', successHtml);
    }
  }

  // Export RSVPs for admin (CSV format)
  exportRSVPs(eventSlug = null) {
    const rsvps = eventSlug ? this.getEventRSVPs(eventSlug) : 
                  Object.values(this.rsvps).flat();

    if (rsvps.length === 0) {
      this.showNotification('No RSVPs to export', 'info');
      return;
    }

    const headers = ['Event', 'Name', 'Email', 'Phone', 'Attending', 'Guests', 'Member Type', 'Comments', 'Date'];
    const csvContent = [
      headers.join(','),
      ...rsvps.map(rsvp => [
        rsvp.eventName || 'Unknown Event',
        `"${rsvp.name || ''}"`,
        rsvp.email || '',
        rsvp.phone || '',
        rsvp.attending || '',
        rsvp.guests || 0,
        rsvp.memberType || '',
        `"${(rsvp.comments || '').replace(/"/g, '""')}"`,
        new Date(rsvp.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvps_${eventSlug || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showNotification(`📊 RSVPs exported successfully (${rsvps.length} records)`, 'success');
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1000;
      padding: 12px 20px; border-radius: 8px; color: white;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px; animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize RSVP Manager
const rsvpManager = new RSVPManager();

// Make available globally for admin functions
window.rsvpManager = rsvpManager;