# Apache .htaccess Configuration Documentation

## Overview
The .htaccess file manages URL routing and request handling for the PurelyHandmade application. It provides a robust routing system for both API endpoints and frontend resources.

## Configuration Sections

### Base Configuration
```apache
RewriteEngine On
RewriteBase /~xzy2020c/PurelyHandmade/
```
- Enables Apache's rewrite engine
- Sets the base URL for all rewrite rules

### API Request Handling
```apache
RewriteCond %{REQUEST_URI} ^/~xzy2020c/PurelyHandmade/api [NC]
RewriteRule ^api/([^/]+)/([^/]+)$ src/server/api/$1/$2.php [QSA,L]
RewriteRule ^api/([^/]+)$ src/server/api/$1/index.php [QSA,L]
```
- Handles API requests with priority
- Supports both nested endpoints (e.g., `/api/designers/featured`)
- Supports root endpoints (e.g., `/api/products`)

### Static Resource Routing
```apache
RewriteRule ^css/(.*)$ src/client/css/$1 [QSA,L]
RewriteRule ^js/(.*)$ src/client/js/$1 [QSA,L]
RewriteRule ^img/(.*)$ src/client/img/$1 [QSA,L]
RewriteRule ^assets/(.*)$ src/client/assets/$1 [QSA,L]
```
- Routes requests for static resources to appropriate directories
- Maintains clean URLs without exposing internal directory structure

### View Routing
```apache
RewriteRule ^views/(.*)$ src/client/views/$1 [QSA,L]
```
- Handles dynamic view requests
- Maps to the client-side view directory

## Security Configuration

### File Access Protection
```apache
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```
- Prevents access to dot files
- Enhances security by hiding sensitive files

### CORS Configuration
```apache
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```
- Enables Cross-Origin Resource Sharing
- Configures allowed HTTP methods and headers

## URL Examples

### API Endpoints
- `/api/products` → `src/server/api/products/index.php`
- `/api/designers/featured` → `src/server/api/designers/featured.php`
- `/api/categories` → `src/server/api/categories/index.php`

### Frontend Resources
- `/css/style.css` → `src/client/css/style.css`
- `/js/main.js` → `src/client/js/main.js`
- `/img/logo.png` → `src/client/img/logo.png`

## Best Practices
1. Always test new rewrite rules thoroughly
2. Keep rules organized by functionality
3. Use [L] flag to prevent unnecessary rule processing
4. Include clear comments for complex rules
5. Monitor server error logs for routing issues

## Integration with Config.js
The .htaccess configuration complements the Config.js system by:
- Matching the same base URL structure
- Supporting the path generation patterns
- Ensuring consistent resource routing 