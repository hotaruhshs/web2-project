<?php
// User profile management for UrbanThreadz
require_once 'user_functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

// Check if user is logged in
if (!isUserLoggedIn()) {
    sendJsonResponse(false, 'User not logged in', null, 401);
}

$currentUser = getCurrentUser();
$method = $_SERVER['REQUEST_METHOD'];

// GET - Retrieve user profile
if ($method === 'GET') {
    $fullUser = findUserById($currentUser['id']);
    
    if (!$fullUser) {
        sendJsonResponse(false, 'User not found', null, 404);
    }
    
    // Remove password from response
    unset($fullUser['password']);
    
    sendJsonResponse(true, 'Profile retrieved successfully', $fullUser);
}

// POST/PUT - Update user profile
if ($method === 'POST' || $method === 'PUT') {
    $users = loadUsers();
    $userIndex = -1;
    
    // Find user in array
    foreach ($users as $index => $user) {
        if ($user['id'] == $currentUser['id']) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1) {
        sendJsonResponse(false, 'User not found', null, 404);
    }
    
    $user = $users[$userIndex];
    
    // Get form data
    $firstName = sanitizeInput($_POST['first_name'] ?? '');
    $lastName = sanitizeInput($_POST['last_name'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');
    $street = sanitizeInput($_POST['street'] ?? '');
    $city = sanitizeInput($_POST['city'] ?? '');
    $state = sanitizeInput($_POST['state'] ?? '');
    $zip = sanitizeInput($_POST['zip'] ?? '');
    $country = sanitizeInput($_POST['country'] ?? '');
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    $errors = [];
    
    // Email validation (if provided)
    if (!empty($email)) {
        if (!validateEmail($email)) {
            $errors['email'] = 'Please enter a valid email address';
        } else {
            // Check if email is already taken by another user
            $existingUser = findUserByEmail($email);
            if ($existingUser && $existingUser['id'] != $currentUser['id']) {
                $errors['email'] = 'Email is already taken by another user';
            }
        }
    }
    
    // Password change validation
    if (!empty($newPassword)) {
        if (empty($currentPassword)) {
            $errors['current_password'] = 'Current password is required to change password';
        } elseif (!verifyPassword($currentPassword, $user['password'])) {
            $errors['current_password'] = 'Current password is incorrect';
        }
        
        if (!validatePassword($newPassword)) {
            $errors['new_password'] = 'New password must be at least 8 characters and contain uppercase, lowercase, and number';
        }
        
        if ($newPassword !== $confirmPassword) {
            $errors['confirm_password'] = 'Passwords do not match';
        }
    }
    
    if (!empty($errors)) {
        sendJsonResponse(false, 'Validation failed', $errors);
    }
    
    // Update user data
    if (!empty($firstName)) $users[$userIndex]['profile']['first_name'] = $firstName;
    if (!empty($lastName)) $users[$userIndex]['profile']['last_name'] = $lastName;
    if (!empty($email)) $users[$userIndex]['email'] = $email;
    if (!empty($phone)) $users[$userIndex]['profile']['phone'] = $phone;
    if (!empty($street)) $users[$userIndex]['profile']['address']['street'] = $street;
    if (!empty($city)) $users[$userIndex]['profile']['address']['city'] = $city;
    if (!empty($state)) $users[$userIndex]['profile']['address']['state'] = $state;
    if (!empty($zip)) $users[$userIndex]['profile']['address']['zip'] = $zip;
    if (!empty($country)) $users[$userIndex]['profile']['address']['country'] = $country;
    
    // Update password if provided
    if (!empty($newPassword)) {
        $users[$userIndex]['password'] = hashPassword($newPassword);
    }
    
    // Add updated timestamp
    $users[$userIndex]['updated_at'] = date('Y-m-d H:i:s');
    
    // Save updated users
    if (!saveUsers($users)) {
        sendJsonResponse(false, 'Failed to save profile changes');
    }
    
    // Update session if email changed
    if (!empty($email)) {
        $_SESSION['email'] = $email;
    }
    
    // Log activity
    logActivity("User updated profile: " . $currentUser['username']);
    
    // Return updated user (without password)
    $updatedUser = $users[$userIndex];
    unset($updatedUser['password']);
    
    sendJsonResponse(true, 'Profile updated successfully', $updatedUser);
}

// Method not allowed
sendJsonResponse(false, 'Method not allowed', null, 405);
?>
