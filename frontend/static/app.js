/**
 * Main JavaScript file for One Night Werewolf Assistant
 */

// API base URL
const API_BASE_URL = '';

/**
 * Make an API call and display the response
 */
async function makeApiCall(endpoint, responseElement) {
    try {
        responseElement.innerHTML = '<p class="loading">Loading...</p>';
        const response = await fetch(API_BASE_URL + endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        responseElement.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (error) {
        responseElement.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
}

/**
 * Initialize event listeners when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    const healthBtn = document.getElementById('health-btn');
    const infoBtn = document.getElementById('info-btn');
    const responseBox = document.getElementById('api-response');

    // Health check button
    if (healthBtn) {
        healthBtn.addEventListener('click', () => {
            makeApiCall('/api/health', responseBox);
        });
    }

    // Info button
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            makeApiCall('/api/info', responseBox);
        });
    }

    // Log when app is ready
    console.log('One Night Werewolf Assistant loaded successfully!');
});
