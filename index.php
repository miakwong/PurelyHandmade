<?php
// Main application entry point

// Route API requests to the server
if (strpos($_SERVER['REQUEST_URI'], '/api') === 0) {
    require_once __DIR__ . '/src/server/index.php';
} else {
    // For now, just show a basic response for non-API requests
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'PurelyHandmade API server is running',
        'api_base' => '/api'
    ]);
}
?> 