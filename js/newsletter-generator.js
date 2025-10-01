/**
 * Newsletter Generation System
 * Automatically creates newsletters from events, news, and content
 */
class NewsletterGenerator {
  constructor() {
    this.newsletters = this.loadNewsletters();
    this.templates = this.getTemplates();
    this.init();
  }

  async init() {
    await this.loadContentData();
    this.setupEventListeners();
  }

  // Load all content for newsletter generation
  async loadContentData() {
    this.contentData = {
      events: [],
      news: [],
      boardMembers: [],
      newsletters: []
    };

    try {
      // Load events
      const eventsResponse = await fetch('/events/events.json', { cache: 'no-store' });
      if (eventsResponse.ok) {
        this.contentData.events = await eventsResponse.json();
      }

      // Load news
      const newsResponse = await fetch('/news/posts.json', { cache: 'no-store' });
      if (newsResponse.ok) {
        this.contentData.news = await newsResponse.json();
      }

      // Load board members
      const boardResponse = await fetch('/content/board-members.json', { cache: 'no-store' });
      if (boardResponse.ok) {
        this.contentData.boardMembers = await boardResponse.json();
      }

      // Load existing newsletters
      const newslettersResponse = await fetch('/newsletters/posts.json', { cache: 'no-store' });
      if (newslettersResponse.ok) {
        this.contentData.newsletters = await newslettersResponse.json();
      }

    } catch (error) {
      console.warn('Error loading content data:', error);
    }
  }

  // Load saved newsletters from localStorage
  loadNewsletters() {
    const stored = localStorage.getItem('cvcwvuaa-newsletters');
    return stored ? JSON.parse(stored) : [];
  }

  // Save newsletters to localStorage
  saveNewsletters() {
    localStorage.setItem('cvcwvuaa-newsletters', JSON.stringify(this.newsletters));
  }

  // Get newsletter templates
  getTemplates() {
    return {
      monthly: {
        name: 'Monthly Newsletter',
        sections: ['greeting', 'upcoming-events', 'recent-events', 'news', 'spotlight', 'footer']
      },
      events: {
        name: 'Event Announcement',
        sections: ['greeting', 'featured-event', 'upcoming-events', 'rsvp-call', 'footer']
      },
      news: {
        name: 'News Update',
        sections: ['greeting', 'news', 'upcoming-events', 'footer']
      },
      quarterly: {
        name: 'Quarterly Report',
        sections: ['greeting', 'quarter-summary', 'events-recap', 'financials', 'spotlight', 'upcoming', 'footer']
      }
    };
  }

  // Generate newsletter content
  generateNewsletter(templateType, options = {}) {
    const template = this.templates[templateType];
    if (!template) {
      throw new Error('Invalid template type');
    }

    const newsletter = {
      id: this.generateNewsletterID(),
      title: options.title || `CVCWVUAA Newsletter - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      type: templateType,
      date: new Date().toISOString(),
      sections: {},
      htmlContent: '',
      emailContent: '',
      settings: {
        includeImages: options.includeImages !== false,
        includeSocialLinks: options.includeSocialLinks !== false,
        maxEventCount: options.maxEventCount || 5,
        maxNewsCount: options.maxNewsCount || 3
      }
    };

    // Generate each section
    template.sections.forEach(sectionType => {
      newsletter.sections[sectionType] = this.generateSection(sectionType, options);
    });

    // Compile HTML content
    newsletter.htmlContent = this.compileHTML(newsletter);
    newsletter.emailContent = this.compileEmailHTML(newsletter);

    return newsletter;
  }

  // Generate individual sections
  generateSection(sectionType, options = {}) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    switch (sectionType) {
      case 'greeting':
        return {
          type: 'greeting',
          content: `
            <h2>Mountaineer Greetings!</h2>
            <p>Welcome to the latest news from the Central Virginia Chapter of the WVU Alumni Association. We're excited to share updates on our recent activities and upcoming events.</p>
          `
        };

      case 'upcoming-events':
        const upcomingEvents = this.contentData.events
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= thirtyDaysFromNow;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, options.maxEventCount || 5);

        return {
          type: 'upcoming-events',
          title: 'Upcoming Events',
          events: upcomingEvents,
          content: this.renderEventsSection(upcomingEvents, 'upcoming')
        };

      case 'recent-events':
        const recentEvents = this.contentData.events
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate <= today && eventDate >= thirtyDaysAgo;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        return {
          type: 'recent-events',
          title: 'Recent Events Recap',
          events: recentEvents,
          content: this.renderEventsSection(recentEvents, 'recent')
        };

      case 'news':
        const recentNews = this.contentData.news
          .filter(post => {
            const postDate = new Date(post.date);
            return postDate >= thirtyDaysAgo;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, options.maxNewsCount || 3);

        return {
          type: 'news',
          title: 'Chapter News & Updates',
          posts: recentNews,
          content: this.renderNewsSection(recentNews)
        };

      case 'spotlight':
        const spotlightMember = this.getRandomBoardMember();
        return {
          type: 'spotlight',
          title: 'Board Member Spotlight',
          member: spotlightMember,
          content: this.renderSpotlightSection(spotlightMember)
        };

      case 'featured-event':
        const featuredEvent = this.contentData.events
          .filter(event => new Date(event.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        return {
          type: 'featured-event',
          title: 'Featured Event',
          event: featuredEvent,
          content: this.renderFeaturedEventSection(featuredEvent)
        };

      case 'rsvp-call':
        return {
          type: 'rsvp-call',
          content: `
            <div style="background: #003366; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3>Don't Miss Out!</h3>
              <p>RSVP for our upcoming events to secure your spot and help us plan accordingly.</p>
              <a href="https://cvawvuaa.org/events.html" style="background: #FFD700; color: #003366; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View All Events</a>
            </div>
          `
        };

      case 'footer':
        return {
          type: 'footer',
          content: `
            <hr style="margin: 30px 0; border: none; border-top: 2px solid #FFD700;">
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p><strong>Central Virginia Chapter of WVU Alumni Association</strong></p>
              <p>Stay connected to Mountaineer Nation in Central Virginia</p>
              <p>
                <a href="https://cvawvuaa.org">Visit Our Website</a> | 
                <a href="https://cvawvuaa.org/contact.html">Contact Us</a> | 
                <a href="https://cvawvuaa.org/pay.html">Become a Member</a>
              </p>
              <p style="font-size: 12px; margin-top: 20px;">
                This newsletter was automatically generated on ${new Date().toLocaleDateString()}
              </p>
            </div>
          `
        };

      default:
        return { type: sectionType, content: '' };
    }
  }

  // Render events section
  renderEventsSection(events, type) {
    if (!events || events.length === 0) {
      return `<p><em>No ${type} events to display.</em></p>`;
    }

    const eventHtml = events.map(event => {
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = event.time ? ` at ${event.time}` : '';
      
      return `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #FFD700; background: #f8f9fa;">
          <h4 style="margin: 0 0 8px 0; color: #003366;">${event.title}</h4>
          <p style="margin: 0 0 8px 0; font-weight: bold;">${dateStr}${timeStr}</p>
          ${event.location ? `<p style="margin: 0 0 8px 0;"><strong>Location:</strong> ${event.location}</p>` : ''}
          ${event.description ? `<p style="margin: 0;">${event.description}</p>` : ''}
          ${type === 'upcoming' ? `<p style="margin: 8px 0 0 0;"><a href="https://cvawvuaa.org/events/rsvp.html?event=${event.slug}">RSVP Here</a></p>` : ''}
        </div>
      `;
    }).join('');

    return `<div>${eventHtml}</div>`;
  }

  // Render news section
  renderNewsSection(posts) {
    if (!posts || posts.length === 0) {
      return '<p><em>No recent news to display.</em></p>';
    }

    const newsHtml = posts.map(post => `
      <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 5px 0;"><a href="https://cvawvuaa.org/news/posts/${post.slug}.html">${post.title}</a></h4>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${new Date(post.date).toLocaleDateString()}</p>
        <p style="margin: 0;">${post.excerpt || post.summary || 'Read more on our website.'}</p>
      </div>
    `).join('');

    return `<div>${newsHtml}</div>`;
  }

  // Render board member spotlight
  renderSpotlightSection(member) {
    if (!member) {
      return '<p><em>No board member information available.</em></p>';
    }

    return `
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #003366;">Spotlight: ${member.name}</h4>
        <p style="margin: 0 0 8px 0;"><strong>Position:</strong> ${member.position}</p>
        ${member.degree ? `<p style="margin: 0 0 8px 0;"><strong>Degree:</strong> ${member.degree}</p>` : ''}
        <p style="margin: 0;">Thank you to ${member.name} for their dedicated service to our chapter!</p>
      </div>
    `;
  }

  // Render featured event section
  renderFeaturedEventSection(event) {
    if (!event) {
      return '<p><em>No featured event available.</em></p>';
    }

    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div style="background: linear-gradient(135deg, #003366, #0066cc); color: white; padding: 25px; border-radius: 12px; text-align: center;">
        <h3 style="margin: 0 0 15px 0; font-size: 24px;">${event.title}</h3>
        <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${dateStr}</p>
        ${event.time ? `<p style="margin: 0 0 10px 0;">⏰ ${event.time}</p>` : ''}
        ${event.location ? `<p style="margin: 0 0 15px 0;">📍 ${event.location}</p>` : ''}
        ${event.description ? `<p style="margin: 0 0 20px 0;">${event.description}</p>` : ''}
        <a href="https://cvawvuaa.org/events/rsvp.html?event=${event.slug}" style="background: #FFD700; color: #003366; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">RSVP Now</a>
      </div>
    `;
  }

  // Get random board member for spotlight
  getRandomBoardMember() {
    if (!this.contentData.boardMembers || this.contentData.boardMembers.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.contentData.boardMembers.length);
    return this.contentData.boardMembers[randomIndex];
  }

  // Compile HTML content
  compileHTML(newsletter) {
    const sections = newsletter.sections;
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${newsletter.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1, h2, h3, h4 { color: #003366; }
          a { color: #0066cc; }
          .header { background: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; color: white;">${newsletter.title}</h1>
          <p style="margin: 10px 0 0 0; color: #FFD700;">${new Date(newsletter.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    `;

    // Add each section
    Object.values(sections).forEach(section => {
      if (section.content) {
        html += `
          <div class="section">
            ${section.title ? `<h3>${section.title}</h3>` : ''}
            ${section.content}
          </div>
        `;
      }
    });

    html += `
      </body>
      </html>
    `;

    return html;
  }

  // Compile email-friendly HTML
  compileEmailHTML(newsletter) {
    // Similar to compileHTML but with inline styles and email compatibility
    const sections = newsletter.sections;
    let html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
          <h1 style="margin: 0; color: white; font-size: 24px;">${newsletter.title}</h1>
          <p style="margin: 10px 0 0 0; color: #FFD700;">${new Date(newsletter.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    `;

    Object.values(sections).forEach(section => {
      if (section.content) {
        html += `
          <div style="margin-bottom: 30px;">
            ${section.title ? `<h3 style="color: #003366; margin-bottom: 15px;">${section.title}</h3>` : ''}
            ${section.content}
          </div>
        `;
      }
    });

    html += `</div>`;
    return html;
  }

  // Generate unique newsletter ID
  generateNewsletterID() {
    return 'newsletter_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Save newsletter
  saveNewsletter(newsletter) {
    this.newsletters.unshift(newsletter);
    this.saveNewsletters();
    return newsletter.id;
  }

  // Get all newsletters
  getNewsletters() {
    return this.newsletters;
  }

  // Delete newsletter
  deleteNewsletter(id) {
    this.newsletters = this.newsletters.filter(n => n.id !== id);
    this.saveNewsletters();
  }

  // Export newsletter as HTML file
  exportNewsletterHTML(newsletter) {
    const blob = new Blob([newsletter.htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_${newsletter.id.slice(-8)}_${new Date(newsletter.date).toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Copy email HTML to clipboard
  copyEmailHTML(newsletter) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(newsletter.emailContent).then(() => {
        this.showNotification('📧 Email HTML copied to clipboard!', 'success');
      }).catch(err => {
        console.error('Clipboard error:', err);
        this.fallbackCopyToClipboard(newsletter.emailContent);
      });
    } else {
      this.fallbackCopyToClipboard(newsletter.emailContent);
    }
  }

  // Fallback copy method
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showNotification('📧 Email HTML copied to clipboard!', 'success');
    } catch (err) {
      this.showNotification('❌ Could not copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
  }

  // Setup event listeners
  setupEventListeners() {
    // Newsletter generation will be handled in admin interface
  }

  // Mailchimp Integration Methods
  async sendToMailchimp(newsletter, options = {}) {
    if (!window.mailchimpIntegration) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const campaignData = {
        subject: newsletter.subject,
        html: newsletter.html,
        autoSend: options.autoSend || false
      };

      const campaign = await window.mailchimpIntegration.sendNewsletterViMailchimp(campaignData);
      
      // Update newsletter with Mailchimp campaign ID
      newsletter.mailchimpCampaignId = campaign.id;
      this.saveNewsletters();
      
      this.showNotification(`Newsletter sent to Mailchimp: ${newsletter.subject}`, 'success');
      return campaign;
    } catch (error) {
      this.showNotification(`Failed to send to Mailchimp: ${error.message}`, 'error');
      throw error;
    }
  }

  async createMailchimpCampaign(newsletter) {
    if (!window.mailchimpIntegration) {
      throw new Error('Mailchimp integration not configured');
    }

    try {
      const campaign = await window.mailchimpIntegration.createCampaign(
        newsletter.subject,
        newsletter.html,
        {
          title: `CVCWVUAA Newsletter - ${new Date(newsletter.date).toLocaleDateString()}`,
          fromName: 'CVCWVUAA Newsletter',
          replyTo: 'newsletter@cvawvuaa.org'
        }
      );

      // Update newsletter with Mailchimp campaign ID
      newsletter.mailchimpCampaignId = campaign.id;
      newsletter.mailchimpStatus = 'draft';
      this.saveNewsletters();
      
      this.showNotification(`Mailchimp campaign created: ${newsletter.subject}`, 'success');
      return campaign;
    } catch (error) {
      this.showNotification(`Failed to create Mailchimp campaign: ${error.message}`, 'error');
      throw error;
    }
  }

  async sendMailchimpCampaign(newsletter) {
    if (!newsletter.mailchimpCampaignId) {
      throw new Error('No Mailchimp campaign associated with this newsletter');
    }

    try {
      await window.mailchimpIntegration.sendCampaign(newsletter.mailchimpCampaignId);
      
      newsletter.mailchimpStatus = 'sent';
      newsletter.sentDate = new Date().toISOString();
      this.saveNewsletters();
      
      this.showNotification(`Newsletter sent via Mailchimp: ${newsletter.subject}`, 'success');
    } catch (error) {
      this.showNotification(`Failed to send via Mailchimp: ${error.message}`, 'error');
      throw error;
    }
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

// Initialize Newsletter Generator
const newsletterGenerator = new NewsletterGenerator();

// Make available globally for admin functions
window.newsletterGenerator = newsletterGenerator;