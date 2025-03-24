<?php
/**
 * Database initialization command line tool
 * 
 * Usage:
 * php init_db.php          - interactive mode
 * php init_db.php --force  - force mode, no confirmation required
 */

// Parse command line arguments
$forceMode = false;
foreach ($argv as $arg) {
    if ($arg === '--force') {
        $forceMode = true;
    }
}

// If not in force mode, show warning and request confirmation
if (!$forceMode) {
    echo "=======================================================\n";
    echo "        PurelyHandmade Database Initialization Tool\n";
    echo "=======================================================\n\n";
    echo "Warning: This operation will reset the database, and all existing data will be deleted!\n";
    echo "The database will be recreated and populated with initial data according to the database_content.md file.\n\n";
    
    echo "Are you sure you want to continue? [y/N]: ";
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);
    
    if (strtolower($line) !== 'y') {
        echo "Operation cancelled\n";
        exit;
    }
    
    echo "\nStarting database initialization...\n\n";
}

// Execute database initialization script
require_once __DIR__ . '/init_database.php';

echo "\n=======================================================\n";
echo "         Database initialization completed!\n";
echo "=======================================================\n\n";
echo "Database summary:\n";
echo "- Users: 12 (including admin and regular users)\n";
echo "- Product categories: 8\n";
echo "- Designers: 8\n";
echo "- Products: 10\n";
echo "- Orders: 10\n";
echo "- Reviews: 10\n\n";

echo "Admin account:\n";
echo "- Username: admin@purelyhandmade.com / Password: password hash stored\n";
echo "- Username: newadmin@example.com / Password: password hash stored\n\n";

echo "Regular user accounts:\n";
echo "- Username: user@purelyhandmade.com / Password: password hash stored\n";
echo "- Username: customer1@example.com / Password: password hash stored\n\n";

echo "You can use these accounts to test the system.\n";
echo "The database structure and relationships have been set up according to the database_content.md file.\n"; 