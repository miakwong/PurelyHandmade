<?php
require_once __DIR__ . '/../../bootstrap.php';

use Controllers\AdminController;
use Utils\Request;
use Utils\Response;
use Middleware\AuthMiddleware;
use Middleware\AdminMiddleware;
use Middleware\CorsMiddleware;

// Apply CORS middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Only accept GET requests
if (getRequestMethod() !== 'GET') {
    $response = new Response();
    $response->error('Method not allowed', 405);
    exit;
}

try {
    // Apply Auth and Admin middleware
    $adminMiddleware = new AdminMiddleware();
    $adminMiddleware->handle();
    
    $request = new Request();
    $response = new Response();
    $adminController = new AdminController();
    
    // Get report parameters
    $type = $request->getParam('type', 'sales');
    $period = $request->getParam('period', 'monthly');
    $startDate = $request->getParam('start');
    $endDate = $request->getParam('end');
    
    // Get report data
    $result = $adminController->getReportData($type, $period, $startDate, $endDate);
    
    if ($result['success']) {
        $response->success($result['report']);
    } else {
        $response->error($result['message']);
    }
} catch (Exception $e) {
    $response = new Response();
    $response->serverError('An error occurred while processing your request: ' . $e->getMessage());
    
    // Log the error
    $logger = new Utils\Logger();
    $logger->error('Report generation error', Utils\Logger::formatException($e));
} 