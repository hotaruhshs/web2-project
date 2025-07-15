<?php
// Simple test script to verify PHP server is working
header('Content-Type: application/json');

$response = [
    'success' => true,
    'message' => 'PHP server is working correctly',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'php_version' => phpversion(),
    'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
