<?php
// Upload profile image script for UrbanThreadz
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

// Check if file was uploaded
if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
    sendJsonResponse(false, 'No file uploaded or upload error');
}

$file = $_FILES['profile_image'];

// Fast validation - check file type first (most common rejection)
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    sendJsonResponse(false, 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
}

// Quick file size check (before any file operations)
$maxSize = 5 * 1024 * 1024; // 5MB in bytes
if ($file['size'] > $maxSize) {
    sendJsonResponse(false, 'File too large. Maximum size is 5MB');
}

// Create upload directory if it doesn't exist (do this early)
$uploadDir = '../uploads/profiles/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate unique filename early
$fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
$fileName = 'profile_' . $currentUser['id'] . '_' . time() . '.' . $fileExtension;
$filePath = $uploadDir . $fileName;

// Load users and find user index early (before file operations)
$users = loadUsers();
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

// Store old image filename for cleanup (do this before file operations)
$oldImage = '';
if (isset($users[$userIndex]['profile']['profile_image']) && !empty($users[$userIndex]['profile']['profile_image'])) {
    $oldImage = $users[$userIndex]['profile']['profile_image'];
}

// Move uploaded file (main operation)
if (!move_uploaded_file($file['tmp_name'], $filePath)) {
    sendJsonResponse(false, 'Failed to save uploaded file');
}

// Update user profile with image filename (fast operation)
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

// Remove old profile image if exists (do this after new file is saved)
if (!empty($oldImage)) {
    $oldImagePath = $uploadDir . $oldImage;
    if (file_exists($oldImagePath)) {
        unlink($oldImagePath);
    }
}

// Update profile with new image filename
$users[$userIndex]['profile']['profile_image'] = $fileName;

// Save updated users
if (saveUsers($users)) {
    // Update session data
    $_SESSION['user'] = $users[$userIndex];
    
    // Log activity
    logActivity("Profile image updated for user: " . $users[$userIndex]['username']);
    
    // Return success with image URL
    sendJsonResponse(true, 'Profile image updated successfully', [
        'image_url' => 'uploads/profiles/' . $fileName
    ]);
} else {
    // Clean up uploaded file if save failed
    unlink($filePath);
    sendJsonResponse(false, 'Failed to save profile changes');
}
?>
