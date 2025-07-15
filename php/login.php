<?php
// User login script for UrbanThreadz
require_once 'user_functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Method not allowed', null, 405);
}

// Get form data
$username = sanitizeInput($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Validation
$errors = [];

if (empty($username)) {
    $errors['username'] = 'Username is required';
}

if (empty($password)) {
    $errors['password'] = 'Password is required';
}

if (!empty($errors)) {
    sendJsonResponse(false, 'Validation failed', $errors);
}

// Load users
$users = loadUsers();

// Find user by username or email
$user = findUserByUsername($username);
if (!$user) {
    $user = findUserByEmail($username);
}

if (!$user) {
    sendJsonResponse(false, 'Invalid username or password');
}

// Check if account is active
if (isset($user['status']) && $user['status'] !== 'active') {
    sendJsonResponse(false, 'Account is not active');
}

// Verify password
if (!verifyPassword($password, $user['password'])) {
    sendJsonResponse(false, 'Invalid username or password');
}

// Create session
createUserSession($user);

// Debug: Log session info after creation
logActivity("Login - Session ID: " . session_id() . ", Data: " . json_encode($_SESSION));

// Log activity
logActivity("User logged in: " . $user['username']);

// Remove password from response
$userResponse = $user;
unset($userResponse['password']);

// Success response
sendJsonResponse(true, 'Login successful! Welcome back!', $userResponse);
?>
