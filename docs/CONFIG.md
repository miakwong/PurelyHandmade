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

**Example:**
```javascript
const apiPath = CONFIG.getPath('API', '/products');
console.log(apiPath); // Output: /~xzy2020c/PurelyHandmade/api/products
```

#### `getApiPath(endpoint)`
Generates API endpoint paths:
- Input: Endpoint path (e.g., 'products')
- Output: `/~xzy2020c/PurelyHandmade/api/products`

**Example:**
```javascript
const productsApi = CONFIG.getApiPath('products');
console.log(productsApi); // Output: /~xzy2020c/PurelyHandmade/api/products

const designerApi = CONFIG.getApiPath('designers/featured');
console.log(designerApi); // Output: /~xzy2020c/PurelyHandmade/api/designers/featured
```

#### `getJsPath(filename)`
Generates JavaScript file paths:
- Input: JS filename (e.g., 'main.js')
- Output: `/~xzy2020c/PurelyHandmade/js/main.js`

**Example:**
```javascript
const mainJs = CONFIG.getJsPath('main.js');
console.log(mainJs); // Output: /~xzy2020c/PurelyHandmade/js/main.js

const apiLoaderJs = CONFIG.getJsPath('api-data-loader.js');
console.log(apiLoaderJs); // Output: /~xzy2020c/PurelyHandmade/js/api-data-loader.js
```

#### `getCssPath(filename)`
Generates CSS file paths:
- Input: CSS filename (e.g., 'style.css')
- Output: `/~xzy2020c/PurelyHandmade/css/style.css`

**Example:**
```javascript
const styleCss = CONFIG.getCssPath('style.css');
console.log(styleCss); // Output: /~xzy2020c/PurelyHandmade/css/style.css

const navbarCss = CONFIG.getCssPath('navbar.css');
console.log(navbarCss); // Output: /~xzy2020c/PurelyHandmade/css/navbar.css
```

#### `getViewPath(path)`
Generates view file paths:
- Input: View path (e.g., 'products/detail.html')
- Output: `/~xzy2020c/PurelyHandmade/views/product/detail.html`

**Example:**
```javascript
const productView = CONFIG.getViewPath('product/detail.html');
console.log(productView); // Output: /~xzy2020c/PurelyHandmade/views/product/detail.html

const designerView = CONFIG.getViewPath('designer/designer-page.html');
console.log(designerView); // Output: /~xzy2020c/PurelyHandmade/views/designer/designer-page.html
```

#### `getImagePath(filename)`
Generates image file paths:
- Input: Image filename (e.g., 'logo.png')
- Output: `/~xzy2020c/PurelyHandmade/img/logo.png`

**Example:**
```javascript
const logoImage = CONFIG.getImagePath('logo.png');
console.log(logoImage); // Output: /~xzy2020c/PurelyHandmade/img/logo.png

const placeholderImage = CONFIG.getImagePath('placeholder.jpg');
console.log(placeholderImage); // Output: /~xzy2020c/PurelyHandmade/img/placeholder.jpg
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