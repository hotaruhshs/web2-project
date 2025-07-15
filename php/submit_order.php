<?php
// Submit order script
session_start();

// Add error handling for debugging
try {
    // Include required files
    require_once 'config.php';
    require_once 'user_functions.php';

    // Set content type to JSON
    header('Content-Type: application/json');

    // Enable error reporting for debugging
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
    }

    // Response function
    function sendResponse($success, $message, $data = null) {
        $response = [
            'success' => $success,
            'message' => $message,
            'data' => $data
        ];
        
        logActivity("Order Submission Response: " . json_encode($response), __DIR__ . '/../data/activity.log');
        echo json_encode($response);
        exit;
    }

    // Log that script started
    logActivity("Order submission script started", __DIR__ . '/../data/activity.log');

    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        // For debugging, allow GET requests to test connectivity
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            sendResponse(false, 'GET request received - endpoint is working. Use POST for order submission.');
        } else {
            sendResponse(false, 'Invalid request method. Only POST is allowed.');
        }
    }

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);    if (!$data) {
        sendResponse(false, 'Invalid JSON data');
    }

    logActivity("Order Submission Data: " . json_encode($data), __DIR__ . '/../data/activity.log');

// Validate required fields
$requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'paymentMethod', 'cartItems', 'total'];
foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        sendResponse(false, "Missing required field: {$field}");
    }
}

// Validate cart items
if (!is_array($data['cartItems']) || empty($data['cartItems'])) {
    sendResponse(false, 'Cart is empty');
}

// Validate payment method
$validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'];
if (!in_array($data['paymentMethod'], $validPaymentMethods)) {
    sendResponse(false, 'Invalid payment method');
}

// Validate card details if payment method is credit_card or debit_card
if (in_array($data['paymentMethod'], ['credit_card', 'debit_card'])) {
    $cardRequiredFields = ['cardNumber', 'expiryDate', 'cvv'];
    foreach ($cardRequiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendResponse(false, "Missing required card field: {$field}");
        }
    }
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email format');
}

// Validate phone number (simple validation)
if (!preg_match('/^[0-9+\-\s()]+$/', $data['phone'])) {
    sendResponse(false, 'Invalid phone number format');
}

// Calculate order totals
$subtotal = 0;
foreach ($data['cartItems'] as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

$shipping = $subtotal >= 2000 ? 0 : 150; // Free shipping for orders over ₱2000
$total = $subtotal + $shipping;

// Validate total amount
if (abs($total - $data['total']) > 0.01) {
    sendResponse(false, 'Total amount mismatch');
}

// Load existing orders
$ordersFile = __DIR__ . '/../data/orders.json';
if (file_exists($ordersFile)) {
    $orders = json_decode(file_get_contents($ordersFile), true);
    if ($orders === null) {
        $orders = [];
    }
} else {
    $orders = [];
}

// Generate order ID
$orderId = time() . '_' . rand(1000, 9999);

// Get user ID from session if logged in
$userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

// Create order object
$order = [
    'orderId' => $orderId,
    'userId' => $userId,
    'orderDate' => date('Y-m-d H:i:s'),
    'status' => 'pending',
    'customer' => [
        'firstName' => $data['firstName'],
        'lastName' => $data['lastName'],
        'email' => $data['email'],
        'phone' => $data['phone']
    ],
    'shipping' => [
        'address' => $data['address'],
        'city' => $data['city'],
        'state' => $data['state'],
        'zipCode' => $data['zipCode']
    ],
    'items' => $data['cartItems'],
    'payment' => [
        'method' => $data['paymentMethod'],
        'status' => 'pending'
    ],
    'totals' => [
        'subtotal' => $subtotal,
        'shipping' => $shipping,
        'total' => $total
    ],
    'notes' => isset($data['orderNotes']) ? $data['orderNotes'] : ''
];

// Add order to orders array
$orders[] = $order;

// Save orders to file
if (file_put_contents($ordersFile, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    logActivity("Order saved successfully. Order ID: {$orderId}", __DIR__ . '/../data/activity.log');
    
    // Send success response
    sendResponse(true, 'Order placed successfully!', [
        'orderId' => $orderId,
        'orderDate' => $order['orderDate'],
        'total' => $total
    ]);
} else {
    logActivity("Failed to save order. Order ID: {$orderId}", __DIR__ . '/../data/activity.log');
    sendResponse(false, 'Failed to save order. Please try again.');
}

} catch (Exception $e) {
    // Log the error
    logActivity("PHP Error: " . $e->getMessage(), __DIR__ . '/../data/activity.log');
    
    // Send error response
    sendResponse(false, 'Server error occurred: ' . $e->getMessage());
}
?>
