<?php
// Load the .env file to retrieve database configuration
$envFile = __DIR__ . '/../../../.env';
if (!file_exists($envFile)) {
    die("Error: .env file not found. Please create one.\n");
}

$env = parse_ini_file($envFile);
if (!$env) {
    die("Error: Unable to parse $envFile.\n");
}

// Database connection settings
$DB_HOST = $env['DB_HOST'];       // Database host (e.g., localhost or remote server)
$DB_USER = $env['DB_USER'];       // Database username
$DB_PASS = $env['DB_PASSWORD'];   // Database password
$DB_NAME = $env['DB_NAME'];       // The database name from the .env file (ignored in this script)
$DB_PORT = $env['DB_PORT'] ?? 3306; // Database port (default is 3306)

// !!Force the database name to "miakuang" instead of using the .env value
$DB_NAME_REAL = "miakuang";

try {
    // Establish database connection
    $dsn = "mysql:host=$DB_HOST;port=$DB_PORT;charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Enable error reporting
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC // Fetch results as associative arrays
    ]);

    echo "✅ Successfully connected to the database server\n";

    // !!Force using the "cwl" database
    $pdo->exec("USE `$DB_NAME_REAL`");
    echo "✅ Using database: $DB_NAME_REAL\n";

    // Read SQL initialization file
    $sqlFile = file_get_contents("init_database.sql");

    // Replace all occurrences of "purely_handmade" with "miakuang"
    $sqlFile = str_replace("purely_handmade", "miakuang", $sqlFile);

    // Execute SQL queries one by one
    $queries = explode(";", $sqlFile);
    foreach ($queries as $query) {
        if (trim($query) !== '') {
            $pdo->exec($query);
        }
    }

    echo "✅ Database initialization completed!\n";

} catch (PDOException $e) {
    die("❌ Database error: " . $e->getMessage() . "\n");
}
?>
