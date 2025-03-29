// Basic configuration
// 检查全局CONFIG是否已存在，如果存在则不重新定义
if (typeof window.CONFIG === 'undefined') {
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
        
        // Helper function to get the full path
        getPath: function(type, path = '') {
            if (!this.PATHS[type]) {
                console.error(`Invalid path type: ${type}`);
                return '';
            }
            return `${this.BASE_URL}${this.PATHS[type]}${path}`;
        },
        
        // Common path retrieval function
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
            return this.getPath('API', `${endpoint}`);
        }
    };

    // Prevent configuration from being modified
    Object.freeze(CONFIG);
    Object.freeze(CONFIG.PATHS);

    // Export configuration
    window.CONFIG = CONFIG;
    console.log('CONFIG initialized');
} else {
    console.log('CONFIG already defined, skipping initialization');
} 