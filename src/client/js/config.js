/**
 * Basic configuration for Purely Handmade
 */
const CONFIG = {
    // Base URL
    BASE_URL: '/~xzy2020c/PurelyHandmade',
    
    // Resource paths
    PATHS: {
        JS: '/js',
        CSS: '/css',
        VIEWS: '/views',
        IMAGES: '/img',
        API: '/api'
    },
    
    /**
     * Helper function to get the full path
     * @param {string} type - The type of resource path (e.g., 'JS', 'CSS', 'VIEWS', 'IMAGES', 'API')
     * @param {string} [path=''] - The specific path or filename
     * @returns {string} - The full path
     */
    getPath: function(type, path = '') {
        if (!this.PATHS[type]) {
            console.error(`Invalid path type: ${type}`);
            return '';
        }
        return `${this.BASE_URL}${this.PATHS[type]}${path}`;
    },
    
    /**
     * Get the full JavaScript file path
     * @param {string} filename - The JavaScript file name
     * @returns {string} - The full JavaScript file path
     */
    getJsPath: function(filename) {
        return this.getPath('JS', `/${filename}`);
    },
    
    /**
     * Get the full CSS file path
     * @param {string} filename - The CSS file name
     * @returns {string} - The full CSS file path
     */
    getCssPath: function(filename) {
        return this.getPath('CSS', `/${filename}`);
    },
    
    /**
     * Get the full view file path
     * @param {string} filename - The view file name
     * @returns {string} - The full view file path
     */
    getViewPath: function(filename) {
        return this.getPath('VIEWS', `/${filename}`);
    },
    
    /**
     * Get the full image file path
     * @param {string} filename - The image file name
     * @returns {string} - The full image file path
     */
    getImagePath: function(filename) {
        return this.getPath('IMAGES', `/${filename}`);
    },
    
    /**
     * Get the full API endpoint path
     * @param {string} endpoint - The API endpoint
     * @returns {string} - The full API endpoint path
     */
    getApiPath: function(endpoint) {
        return this.getPath('API', `${endpoint}`);
    }
};

// Prevent configuration from being modified
Object.freeze(CONFIG);
Object.freeze(CONFIG.PATHS);

// Export configuration
window.CONFIG = CONFIG;