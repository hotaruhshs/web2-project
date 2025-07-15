<?php
// User logout script for UrbanThreadz
require_once 'user_functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Check if user is logged in
if (!isUserLoggedIn()) {
    sendJsonResponse(false, 'User not logged in', null, 401);
}

// Get current user for logging
$currentUser = getCurrentUser();

// Logout user
logoutUser();

// Log activity
if ($currentUser) {
    logActivity("User logged out: " . $currentUser['username']);
}

// Success response
sendJsonResponse(true, 'Logged out successfully');
?>
