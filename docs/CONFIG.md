# Configuration System Documentation

## Overview
The configuration system is designed to manage paths and endpoints across the PurelyHandmade application. It provides a centralized way to handle resource paths, API endpoints, and view routing.

## Core Features

### Base URL Configuration
- Base URL is set to `/~xzy2020c/PurelyHandmade/`
- All paths are generated relative to this base URL
- Easily modifiable for different deployment environments

### Path Generation Methods

#### `getPath(type, endpoint)`
Base method for generating all types of paths. Parameters:
- `type`: Resource type (API, JS, CSS, etc.)
- `endpoint`: Specific resource path

#### `getApiPath(endpoint)`
Generates API endpoint paths:
- Input: Endpoint path (e.g., 'products')
- Output: `/~xzy2020c/PurelyHandmade/api/products`

#### `getJsPath(filename)`
Generates JavaScript file paths:
- Input: JS filename (e.g., 'main.js')
- Output: `/~xzy2020c/PurelyHandmade/js/main.js`

#### `getCssPath(filename)`
Generates CSS file paths:
- Input: CSS filename (e.g., 'style.css')
- Output: `/~xzy2020c/PurelyHandmade/css/style.css`

#### `getViewPath(path)`
Generates view file paths:
- Input: View path (e.g., 'product/detail.html')
- Output: `/~xzy2020c/PurelyHandmade/views/product/detail.html`

## Usage Examples

```javascript
// API path generation
const productsApi = CONFIG.getApiPath('products');
const designerApi = CONFIG.getApiPath('designers/featured');

// Resource path generation
const mainJs = CONFIG.getJsPath('main.js');
const styleCss = CONFIG.getCssPath('style.css');
const productView = CONFIG.getViewPath('product/detail.html');
```

## Security Features
- Configuration object is frozen using `Object.freeze()`
- Prevents accidental modifications to path configurations
- Ensures consistent path handling across the application

## Best Practices
1. Always use the configuration methods instead of hardcoding paths
2. Keep the base URL in a single location for easy updates
3. Use the appropriate method for each resource type
4. Handle path generation errors gracefully

## Integration with .htaccess
The configuration system works in conjunction with the .htaccess routing rules to ensure:
- Correct API endpoint routing
- Proper resource file access
- Consistent path handling across the application 