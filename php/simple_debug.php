<?php
// Ultra-simple debug endpoint
header('Content-Type: application/json');

try {
    // Just return success with hardcoded data for now
    $sampleOrder = [
        'orderId' => 'TEST123',
        'orderDate' => '2025-07-16 10:00:00',
        'status' => 'pending',
        'total' => 100.00,
        'items' => [
            ['name' => 'Test Item', 'price' => 100.00, 'quantity' => 1]
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'orders' => [$sampleOrder],
        'count' => 1,
        'message' => 'Debug endpoint working'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
