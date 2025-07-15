<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Simple debug endpoint - no session required
$ordersFile = realpath(__DIR__ . '/../data/orders.json');

if (!$ordersFile || !file_exists($ordersFile)) {
    echo json_encode([
        'success' => false,
        'error' => 'Orders file not found',
        'path_attempted' => __DIR__ . '/../data/orders.json',
        'realpath' => $ordersFile,
        'current_dir' => __DIR__,
        'files_in_data' => is_dir(__DIR__ . '/../data/') ? scandir(__DIR__ . '/../data/') : 'data dir not found'
    ]);
    exit;
}

$ordersData = file_get_contents($ordersFile);
if (!$ordersData) {
    echo json_encode([
        'success' => false,
        'error' => 'Could not read orders file'
    ]);
    exit;
}

$orders = json_decode($ordersData, true);
if (!$orders) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON in orders file',
        'json_error' => json_last_error_msg()
    ]);
    exit;
}

// Filter orders for user ID 1 (hardcoded for testing)
$testUserId = 1;
$userOrders = array_filter($orders, function($order) use ($testUserId) {
    return isset($order['userId']) && $order['userId'] == $testUserId;
});

// Sort by date (newest first)
usort($userOrders, function($a, $b) {
    $dateA = isset($a['orderDate']) ? strtotime($a['orderDate']) : 0;
    $dateB = isset($b['orderDate']) ? strtotime($b['orderDate']) : 0;
    return $dateB - $dateA;
});

echo json_encode([
    'success' => true,
    'orders' => array_values($userOrders),
    'count' => count($userOrders),
    'total_orders' => count($orders),
    'debug' => [
        'file_exists' => file_exists($ordersFile),
        'file_size' => filesize($ordersFile),
        'test_user_id' => $testUserId
    ]
]);
?>
