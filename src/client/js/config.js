// Basic configuration
const CONFIG = {
    // Base URL
    BASE_URL: '/~xzy2020c/PurelyHandmade',
    
    // Resource paths
    PATHS: {
        JS: '/js',
        CSS: '/css',
        VIEWS: '/views',
        IMAGES: '/assets/images',
        API: '/api'
    },

    // Track how many times getPath is called
    pathCallCount: 0,
    
    // Helper function to get the full path
    getPath: function(type, path = '') {
        this.pathCallCount++;
        
        if (!this.PATHS[type]) {
            console.error(`[CONFIG ERROR] Invalid path type: "${type}". Available types: ${Object.keys(this.PATHS).join(', ')}`);
            return '';
        }

        return `${this.BASE_URL}${this.PATHS[type]}${path}`;
    },
    
    // Get the absolute URL for a given path
    getAbsoluteUrl: function(type, path = '') {
        const fullPath = this.getPath(type, path);
        return window.location.origin + fullPath;
    },

    // Common path retrieval functions
    getJsPath: function(filename) {
        return this.getPath('JS', `/${filename}`);
    },
    
    getCssPath: function(filename) {
        return this.getPath('CSS', `/${filename}`);
    },
    
    getViewPath: function(filename) {
        return this.getPath('VIEWS', `/${filename}`);
    },
    
    getImagePath: function(filename) {
        return this.getPath('IMAGES', `/${filename}`);
    },
    
    getApiPath: function(endpoint) {
        return this.getPath('API', `/${endpoint}`);
    },
    getStats: function() {
        return {
            totalPathCalls: this.pathCallCount,
            availablePathTypes: Object.keys(this.PATHS)
        };
    }
};

// Prevent configuration from being modified
Object.freeze(CONFIG);
Object.freeze(CONFIG.PATHS);

// Export configuration
window.CONFIG = CONFIG;
