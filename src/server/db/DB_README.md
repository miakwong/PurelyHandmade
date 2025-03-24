# PurelyHandmade Database Initialization Tool

This toolkit is used to initialize the PurelyHandmade system database, including creating table structures and populating initial data.

## File Description

- `database_content.md` - Database content document, containing all table structures and data
- `init_database.php` - Core database initialization script
- `init_db.php` - User-friendly command line interface
- `init_database.sql` - Complete SQL script, can be executed directly in the database

## Usage

### Prerequisites

1. Ensure PHP (7.4+) and MySQL/MariaDB are installed
2. Ensure the .env file in the project root directory contains the correct database connection information:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=purely_handmade
   DB_SOCKET=/opt/homebrew/var/mysql/mysql.sock (optional, adjust according to your system)
   ```

### Initialize the Database

There are three ways to run the initialization:

1. **Interactive Mode** - Prompts for confirmation before execution:
   ```bash
   cd src/server/db
   php init_db.php
   ```

2. **Force Mode** - Executes directly without confirmation:
   ```bash
   cd src/server/db
   php init_db.php --force
   ```

3. **SQL Script Mode** - Execute the SQL file directly in the database:
   ```bash
   mysql -u username -p < src/server/db/init_database.sql
   ```

### Execution Process

1. The script will connect to the database
2. If the database does not exist, it will create the database
3. Deletes all existing tables (if any)
4. Creates all necessary table structures
5. Populates initial data

### Table Structure

The system includes the following tables:

- `User` - User information
- `Category` - Product categories
- `Designer` - Designer information
- `Product` - Product information
- `Order` - Order information
- `OrderItem` - Order items
- `Review` - Product reviews
- `Settings` - System settings
- `Cart` - Shopping cart main table
- `CartItem` - Shopping cart items

### Initial Data

The script will create the following initial data:

- User accounts (including admin and regular users)
- Product categories
- Designer information
- Product information
- Sample orders
- Product reviews
- System settings

## Notes

- **Warning**: Running this script will clear all existing data! Use with caution in production environments.
- It is recommended to back up the existing database before running
- If you encounter permission issues, ensure the database user has sufficient permissions to create/modify databases and tables