// Main Application - SIMPLE URL OPENER WITH TAGS
class NeonPortal {
    constructor() {
        this.currentTag = '?host=1yh71uwZQTsGkEO&magicunblock=www.wi.k12.ny.us%TAK%d%U';
        this.history = [];
        this.maxHistory = 10;
        
        this.init();
    }
    
    init() {
        this.loadHistory();
        this.bindEvents();
        this.setupNavigation();
        this.updateStatus('Ready to open websites');
        this.updateHistoryDisplay();
    }
    
    bindEvents() {
        // Open button
        document.getElementById('openBtn').addEventListener('click', () => this.openWebsite());
        
        // Enter key in input
        document.getElementById('urlInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.openWebsite();
        });
        
        // Tag buttons
        document.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTag(e.target));
        });
        
        // Custom tag button
        document.getElementById('applyCustomTag').addEventListener('click', () => {
            const customTag = document.getElementById('customTag').value.trim();
            if (customTag) {
                this.currentTag = customTag.startsWith('?') ? customTag : `?${customTag}`;
                this.showNotification(`Custom tag set: ${this.currentTag}`, 'info');
                
                // Update active tag button
                document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
            }
        });
        
        // Shortcut buttons
        document.querySelectorAll('.shortcut-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.closest('.shortcut-btn').dataset.url;
                document.getElementById('urlInput').value = url;
                setTimeout(() => this.openWebsite(), 300);
            });
        });
    }
    
    setupNavigation() {
        const sections = {
            'navHome': 'hero',
            'navGames': document.querySelector('.shortcuts'),
            'navStudy': document.querySelector('.recent-section'),
            'navTools': document.querySelector('.info-section')
        };
        
        Object.entries(sections).forEach(([navId, section]) => {
            document.getElementById(navId).addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active nav
                document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
                e.target.closest('a').classList.add('active');
                
                // Scroll to section
                if (section && typeof section.scrollIntoView === 'function') {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
    
    selectTag(button) {
        document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentTag = button.dataset.tag;
        this.showNotification(`Tag selected: ${this.currentTag}`, 'info');
    }
    
    validateUrl(url) {
        if (!url || url.trim() === '') {
            throw new Error('Please enter a website URL');
        }
        
        let cleanUrl = url.trim();
        
        // Remove any quotes
        cleanUrl = cleanUrl.replace(/^['"]+|['"]+$/g, '');
        
        // Add https:// if no protocol specified
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }
        
        // Basic URL validation
        try {
            new URL(cleanUrl);
            return cleanUrl;
        } catch (error) {
            throw new Error('Please enter a valid website address (e.g., example.com)');
        }
    }
    
    openWebsite() {
        const urlInput = document.getElementById('urlInput');
        const originalUrl = urlInput.value;
        
        try {
            // Validate URL
            const validatedUrl = this.validateUrl(originalUrl);
            
            // Create final URL with tag
            const finalUrl = this.addTagToUrl(validatedUrl, this.currentTag);
            
            // Open in new tab
            this.openInNewTab(finalUrl);
            
            // Add to history
            this.addToHistory(validatedUrl, this.currentTag);
            
            // Update UI
            this.updateStatus(`Opened: ${new URL(validatedUrl).hostname}`);
            this.showNotification(`Successfully opened ${new URL(validatedUrl).hostname}`, 'success');
            
        } catch (error) {
            this.showNotification(error.message, 'error');
            this.updateStatus(`Error: ${error.message}`);
        }
    }
    
    addTagToUrl(url, tag) {
        // Parse URL
        const urlObj = new URL(url);
        
        // Add tag/query parameter
        if (tag && tag.trim() !== '') {
            // Remove ? from tag if present
            const cleanTag = tag.startsWith('?') ? tag.substring(1) : tag;
            
            // Parse existing query params
            const params = new URLSearchParams(urlObj.search);
            
            // Parse tag params and add them
            const tagParams = new URLSearchParams(cleanTag);
            tagParams.forEach((value, key) => {
                params.set(key, value);
            });
            
            // Update URL with new params
            urlObj.search = params.toString();
        }
        
        return urlObj.toString();
    }
    
    openInNewTab(url) {
        // Try different methods to bypass popup blockers
        try {
            // Method 1: Standard window.open
            const newWindow = window.open(url, '_blank');
            
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // Method 2: Use form submission (bypasses some blockers)
                this.openViaForm(url);
            }
            
        } catch (error) {
            // Method 3: Last resort - show URL to copy
            this.showNotification(`URL ready: ${url}. Press Ctrl+C to copy.`, 'info');
            document.getElementById('urlInput').value = url;
            document.getElementById('urlInput').select();
        }
    }
    
    openViaForm(url) {
        // Create a hidden form to submit
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = url;
        form.target = '_blank';
        form.style.display = 'none';
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }
    
    addToHistory(url, tag) {
        const historyItem = {
            url: url,
            tag: tag,
            timestamp: new Date().toLocaleTimeString(),
            hostname: new URL(url).hostname
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last N items
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    saveHistory() {
        try {
            localStorage.setItem('neonPortalHistory', JSON.stringify(this.history));
        } catch (error) {
            console.log('Could not save history to localStorage');
        }
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('neonPortalHistory');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (error) {
            console.log('Could not load history from localStorage');
        }
    }
    
    updateHistoryDisplay() {
        const container = document.getElementById('recentList');
        const countElement = document.getElementById('historyCount');
        
        countElement.textContent = `${this.history.length} site${this.history.length !== 1 ? 's' : ''} opened`;
        
        if (this.history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-globe-americas"></i>
                    <p>No sites opened yet. Try opening one above!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.history.map(item => `
            <div class="recent-item" data-url="${item.url}">
                <div class="recent-url">
                    <i class="fas fa-external-link-alt"></i>
                    <span title="${item.url}">${item.hostname} ${item.tag}</span>
                </div>
                <div class="recent-time">${item.timestamp}</div>
            </div>
        `).join('');
        
        // Make history items clickable
        container.querySelectorAll('.recent-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                document.getElementById('urlInput').value = url;
                this.openWebsite();
            });
        });
    }
    
    updateStatus(message) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = message;
        statusDot.style.background = '#00cc66';
        statusDot.style.boxShadow = '0 0 10px #00cc66';
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle'
        }[type] || 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.neonPortal = new NeonPortal();
    
    // Set default tag
    document.querySelector('.tag-btn[data-tag="?host=1yh71uwZQTsGkEO&magicunblock=www.wi.k12.ny.us%TAK%d%U"]').click();
    
    // Add animation to logo
    const logoIcon = document.querySelector('.logo-icon');
    setInterval(() => {
        logoIcon.style.textShadow = `0 0 ${10 + Math.random() * 15}px var(--neon-blue)`;
    }, 1000);
    
    // Add some demo history items if empty
    setTimeout(() => {
        if (window.neonPortal.history.length === 0) {
            // Add some example history items
            const examples = [
                { url: 'https://coolmathgames.com', tag: '?host=1yh71uwZQTsGkEO&magicunblock=www.wi.k12.ny.us%TAK%d%U' },
                { url: 'https://google.com', tag: '?cache=refresh' },
                { url: 'https://youtube.com', tag: '?host=1yh71uwZQTsGkEO&magicunblock=www.wi.k12.ny.us%TAK%d%U' }
            ];
            
            examples.forEach(example => {
                window.neonPortal.addToHistory(example.url, example.tag);
            });
        }
    }, 1000);
});
