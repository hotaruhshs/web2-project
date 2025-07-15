<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';
require_once 'user_functions.php';

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isUserLoggedIn()) {
    echo json_encode([
        'success' => false,
        'error' => 'User not logged in'
    ]);
    exit;
}

// Get current user
$currentUser = getCurrentUser();
$userId = $currentUser['id'];

function getUserOrders($userId) {
    $ordersFile = ORDERS_FILE;
    
    if (!file_exists($ordersFile)) {
        return [];
    }
    
    $ordersData = file_get_contents($ordersFile);
    $orders = json_decode($ordersData, true);
    
    if (!$orders) {
        return [];
    }
    
    // Filter orders by user ID
    $userOrders = array_filter($orders, function($order) use ($userId) {
        return isset($order['userId']) && $order['userId'] == $userId;
    });
    
    // Sort by date (newest first)
    usort($userOrders, function($a, $b) {
        return strtotime($b['orderDate']) - strtotime($a['orderDate']);
    });
    
    return array_values($userOrders);
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $orders = getUserOrders($userId);
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'count' => count($orders)
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
