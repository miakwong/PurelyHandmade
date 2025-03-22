# Purely Handmade

A handcrafted products discussion and showcasing platform built with PHP, MySQL, HTML5, CSS3, and JavaScript.

## Project Objectives

### Website User Objectives:
- Browse site without registering
- Search for items/posts by keyword without registering
- Register at the site by providing name, email and image
- Login by providing user ID and password
- Create and comment on projects when logged in
- View and edit personal profile

### Website Administrator Objectives:
- Search for users by name, email or post
- Enable/disable users
- Edit/remove post items or complete posts

## Project Timeline and Deliverables

### 1. Proposal (February 7, 2025) - 5%
- Initial project proposal

### 2. Client-side Experience (March 1, 2025) - 30%
- Develop pages with client-side validation
- Develop styles for pages
- Create examples of each page type in the proposed site
- Create GitHub repository and add instructor and TAs
- Submit link to GitHub repository

### 3. Core Functionality (March 23, 2025) - 30%
- Client-side security implementation
- Server-side security implementation
- Discussion thread storage in database
- Asynchronous updates
- Complete database functionality
- Core functional components operational
- Preliminary summary document indicating implemented functionality
- Deployment to cosc360.ok.ubc.ca
- Submit link to repository and PDF document describing implementation

### 4. Full Site (April 10, 2025) - 35%
- Complete styling as per design
- Full deployment on server
- Client-side validation and security
- Complete server-side implementation
- User account information stored in database
- Items and associated details stored in database
- Chats/threads maintained in database
- Asynchronous updates for comments/posts/products
- Complete database functionality
- All core functional components operational
- Final summary document (2-3 pages) indicating implemented functionality and features
- User walkthrough document (2-3 pages) for site testing
- Technical implementation description (2-3 pages) from a developer's perspective
- 10% of this milestone is reserved for deployment, version control, and testing

## Functional Requirements

### Minimum Requirements:
- Hand-styled layout with contextual menus (changing when users log in)
- 2-3 column responsive layout following design principles
- Form validation with JavaScript
- Server-side scripting with PHP
- Data storage in MySQL
- Appropriate security for data
- State maintenance (user login sessions)
- Responsive design for different display sizes
- AJAX for asynchronous updates (real-time thread updates)
- User images and profiles stored in database
- Simple discussion topics grouping and display
- Navigation breadcrumb strategy
- Error handling for bad navigation

### Additional Features:
- Search and analysis for topics/items
- Hot threads/items tracking
- Visual display of site usage statistics
- Activity tracking by date
- Usage tracking with visualization tools
- Collapsible items/threads without page reloading
- Alerts on page changes
- Admin reports with filtering
- Styling flourishes
- Mobile responsive layout
- Comment history tracking for users
- Accessibility features

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap JS, jQuery
- **Backend:** PHP
- **Database:** MySQL

## Project Structure

```
PurelyHandmade/
├── .htaccess             # Apache configuration file, URL rewrite rules
└── src/                  # Source code directory
    ├── server/           # Backend code
    │   ├── index.php     # Backend entry point
    │   └── controllers/  # Controllers directory
    │       ├── AuthController.php        # Authentication controller
    │       ├── ProfileController.php     # Profile controller
    │       ├── AdminController.php       # Admin tools controller
    │       └── Database.php              # Database utility class
    └── client/           # Frontend code
        ├── html/         # HTML pages
        │   ├── index.html               # Website homepage
        │   ├── admin-tools.html         # Admin tools page
        │   └── 404.html                 # 404 error page
        ├── js/           # JavaScript code
        │   ├── test-login.js            # Login test script
        │   ├── test-profile.js          # User profile test script
        │   └── ...                      # Other JS files
        ├── css/          # CSS styles
        ├── img/          # Image resources
        └── views/        # View templates
```

## Installation and Configuration

### System Requirements

- PHP 7.4+
- MySQL 5.7+
- Apache Web server (with mod_rewrite module)

### Setup Steps

1. Clone or download this repository to your web server directory

2. Create MySQL database
```sql
CREATE DATABASE purely_handmade;
```

3. Configure database connection
   Edit `src/server/controllers/Database.php` file, set your database connection parameters:
```php
private $host = 'localhost';      // Database host
private $db_name = 'purely_handmade'; // Database name
private $username = 'root';       // Database username
private $password = '';           // Database password
```

4. Configure Apache URL rewriting
   Ensure Apache's mod_rewrite module is enabled and allow .htaccess overrides in your Apache configuration:
```apache
<Directory "/path/to/PurelyHandmade">
    AllowOverride All
</Directory>
```

5. Set file permissions
```bash
chmod -R 755 .
chmod -R 777 src/client/uploads  # If upload directory exists
```

### Accessing the Application

After setup, access the application via web browser:

- Homepage: http://your-domain/ or http://localhost/
- Admin Tools: http://your-domain/admin-tools.html or http://localhost/admin-tools.html

## Development Notes

### Frontend-Backend Separation

This project uses a frontend-backend separated structure within the same codebase:

- **Backend code** (`src/server/`): Contains all PHP processing logic, responsible for data handling, business logic, and API responses
- **Frontend code** (`src/client/`): Contains all JavaScript, CSS, HTML, and images, responsible for user interface and interactions

### Adding New Controllers

1. Create a new PHP class file in the `src/server/controllers/` directory
2. Add corresponding route rules in `src/server/index.php`

### Adding New Frontend Pages

1. Create new HTML files in the `src/client/html/` directory
2. If necessary, add new path mappings in the `$html_pages` array in `src/server/index.php`

### Testing

The project includes test scripts for login functionality and user profile pages:

- src/client/js/test-login.js: For testing login functionality
- src/client/js/test-profile.js: For testing user profile functionality

## License

[MIT License](LICENSE) 