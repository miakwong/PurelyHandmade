<?php
// Simple test to verify API endpoints are working
header('Content-Type: application/json');

// Create a basic response
$response = [
    'success' => true,
    'message' => 'API test successful',
    'data' => [
        'designers' => [
            [
                'id' => 1,
                'name' => 'Test Designer 1',
                'image' => '/src/client/img/designer1-bg.JPG',
                'bio' => 'This is a test designer for API testing',
                'featured' => 1
            ],
            [
                'id' => 2,
                'name' => 'Test Designer 2',
                'image' => '/src/client/img/designer2-bg.JPG',
                'bio' => 'Another test designer for API testing',
                'featured' => 1
            ]
        ]
    ]
];

// Output response
echo json_encode($response);
exit; 