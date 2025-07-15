<?php
// Update user profile script for UrbanThreadz
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

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, 'Method not allowed', null, 405);
}

// Check if user is logged in
if (!isUserLoggedIn()) {
    sendJsonResponse(false, 'User not logged in', null, 401);
}

// Get current user
$currentUser = getCurrentUser();
if (!$currentUser) {
    sendJsonResponse(false, 'User session invalid', null, 401);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    sendJsonResponse(false, 'Invalid JSON data');
}

// Validate input data
$errors = [];

// Validate first name
if (isset($input['first_name']) && strlen($input['first_name']) > 50) {
    $errors['first_name'] = 'First name must be less than 50 characters';
}

// Validate last name
if (isset($input['last_name']) && strlen($input['last_name']) > 50) {
    $errors['last_name'] = 'Last name must be less than 50 characters';
}

// Validate phone
if (isset($input['phone']) && !empty($input['phone'])) {
    if (!preg_match('/^[\d\s\-\+\(\)]+$/', $input['phone'])) {
        $errors['phone'] = 'Invalid phone number format';
    }
    if (strlen($input['phone']) > 20) {
        $errors['phone'] = 'Phone number must be less than 20 characters';
    }
}

// Validate address fields
if (isset($input['address'])) {
    if (isset($input['address']['street']) && strlen($input['address']['street']) > 100) {
        $errors['street'] = 'Street address must be less than 100 characters';
    }
    if (isset($input['address']['city']) && strlen($input['address']['city']) > 50) {
        $errors['city'] = 'City must be less than 50 characters';
    }
    if (isset($input['address']['province']) && strlen($input['address']['province']) > 50) {
        $errors['province'] = 'Province must be less than 50 characters';
    }
    if (isset($input['address']['barangay']) && strlen($input['address']['barangay']) > 50) {
        $errors['barangay'] = 'Barangay must be less than 50 characters';
    }
}

if (!empty($errors)) {
    sendJsonResponse(false, 'Validation failed', $errors);
}

// Load users
$users = loadUsers();

// Find user in the array
$userIndex = -1;
for ($i = 0; $i < count($users); $i++) {
    if ($users[$i]['id'] == $currentUser['id']) {
        $userIndex = $i;
        break;
    }
}

if ($userIndex === -1) {
    sendJsonResponse(false, 'User not found');
}

// Update profile data
if (!isset($users[$userIndex]['profile'])) {
    $users[$userIndex]['profile'] = [
        'first_name' => '',
        'last_name' => '',
        'phone' => '',
        'profile_image' => '',
        'address' => [
            'street' => '',
            'city' => '',
            'province' => '',
            'barangay' => ''
        ]
    ];
}

// Update profile fields
$users[$userIndex]['profile']['first_name'] = sanitizeInput($input['first_name'] ?? '');
$users[$userIndex]['profile']['last_name'] = sanitizeInput($input['last_name'] ?? '');
$users[$userIndex]['profile']['phone'] = sanitizeInput($input['phone'] ?? '');

// Update address
if (isset($input['address'])) {
    $users[$userIndex]['profile']['address']['street'] = sanitizeInput($input['address']['street'] ?? '');
    $users[$userIndex]['profile']['address']['city'] = sanitizeInput($input['address']['city'] ?? '');
    $users[$userIndex]['profile']['address']['province'] = sanitizeInput($input['address']['province'] ?? '');
    $users[$userIndex]['profile']['address']['barangay'] = sanitizeInput($input['address']['barangay'] ?? '');
}

// Save updated users
if (saveUsers($users)) {
    // Update session data
    $_SESSION['user'] = $users[$userIndex];
    
    // Log activity
    logActivity("Profile updated for user: " . $users[$userIndex]['username']);
    
    // Remove password from response
    $userResponse = $users[$userIndex];
    unset($userResponse['password']);
    
    sendJsonResponse(true, 'Profile updated successfully', $userResponse);
} else {
    sendJsonResponse(false, 'Failed to save profile changes');
}
?>
