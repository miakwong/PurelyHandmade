# Database Initialization Tool

This directory contains the database initialization tools for the PurelyHandmade system. For detailed instructions, please refer to the [DB_README.md](./DB_README.md) file.

## Directory Contents

- `init_database.php` - Core script for database initialization
- `init_db.php` - User-friendly command line interface
- `database_content.md` - Complete database content documentation
- `.env.example` - Example environment variable file
- `DB_README.md` - Detailed usage documentation

## Quick Start Guide

1. Ensure there is a properly configured `.env` file in the root directory
2. Run the initialization script:

```bash
cd src/server/db
php init_db.php
```

The initialization script will create and populate database tables, including necessary data for users, products, categories, designers, orders, and reviews.

## Notes

- This tool will clear existing database content, please use with caution
- Backup before using in a production environment
- Default test accounts provided:
  - Admin: admin@purelyhandmade.com
  - Regular user: user@purelyhandmade.com