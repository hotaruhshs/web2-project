<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

function getOrderById($orderId) {
    $ordersFile = ORDERS_FILE;
    
    if (!file_exists($ordersFile)) {
        return null;
    }
    
    $ordersData = file_get_contents($ordersFile);
    $orders = json_decode($ordersData, true);
    
    if (!$orders) {
        return null;
    }
    
    // Find order by ID
    foreach ($orders as $order) {
        if ($order['orderId'] == $orderId) {
            return $order;
        }
    }
    
    return null;
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $orderId = $_GET['orderId'] ?? '';
    
    if (empty($orderId)) {
        echo json_encode([
            'success' => false,
            'error' => 'Order ID is required'
        ]);
        exit;
    }
    
    $order = getOrderById($orderId);
    
    if ($order) {
        echo json_encode([
            'success' => true,
            'order' => $order
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Order not found'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
