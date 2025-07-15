<?php
// Check user session for UrbanThreadz
require_once 'user_functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Debug: Log session info
logActivity("Session check - Session ID: " . session_id() . ", Data: " . json_encode($_SESSION) . ", Cookies: " . json_encode($_COOKIE));

// Check if user is logged in
if (isUserLoggedIn()) {
    $currentUser = getCurrentUser();
    
    // Get full user data
    $fullUser = findUserById($currentUser['id']);
    
    if ($fullUser) {
        // Remove password from response
        unset($fullUser['password']);
        sendJsonResponse(true, 'User is logged in', $fullUser);
    } else {
        // User not found in database, clear session
        logoutUser();
        sendJsonResponse(false, 'User session invalid', null, 401);
    }
} else {
    sendJsonResponse(false, 'User not logged in', null, 401);
}
?>
