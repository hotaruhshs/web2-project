<?php
// User registration script for UrbanThreadz
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Custom error handler to catch all errors
set_error_handler(function($severity, $message, $file, $line) {
    $error = [
        'severity' => $severity,
        'message' => $message,
        'file' => $file,
        'line' => $line
    ];
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred',
        'error' => $error
    ]);
    exit;
});

// Response function
function sendResponse($success, $message, $data = null) {
    http_response_code($success ? 200 : 400);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed');
}

// Get form data
$username = trim($_POST['username'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';
$terms = isset($_POST['terms']) ? true : false;

// Validation
$errors = [];

// Username validation
if (empty($username)) {
    $errors['username'] = 'Username is required';
} elseif (strlen($username) < 3) {
    $errors['username'] = 'Username must be at least 3 characters long';
} elseif (strlen($username) > 20) {
    $errors['username'] = 'Username must not exceed 20 characters';
} elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    $errors['username'] = 'Username can only contain letters, numbers, and underscores';
}

// Email validation
if (empty($email)) {
    $errors['email'] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address';
}

// Password validation
if (empty($password)) {
    $errors['password'] = 'Password is required';
} elseif (strlen($password) < 8) {
    $errors['password'] = 'Password must be at least 8 characters long';
} elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/', $password)) {
    $errors['password'] = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
}

// Confirm password validation
if (empty($confirmPassword)) {
    $errors['confirmPassword'] = 'Please confirm your password';
} elseif ($password !== $confirmPassword) {
    $errors['confirmPassword'] = 'Passwords do not match';
}

// Terms validation
if (!$terms) {
    $errors['terms'] = 'You must agree to the terms and conditions';
}

// If there are validation errors, return them
if (!empty($errors)) {
    sendResponse(false, 'Validation failed', $errors);
}

try {
    // File paths
    $usersFile = '../data/users.json';
    $backupFile = '../data/users_backup.json';

    // Check if users file exists and is readable
    if (!file_exists($usersFile)) {
        if (!file_put_contents($usersFile, '[]')) {
            sendResponse(false, 'Unable to create user database file');
        }
    }

    if (!is_readable($usersFile)) {
        sendResponse(false, 'Unable to read user database file');
    }

    if (!is_writable($usersFile)) {
        sendResponse(false, 'Unable to write to user database file');
    }

    // Read existing users
    $usersData = file_get_contents($usersFile);
    if ($usersData === false) {
        sendResponse(false, 'Failed to read user database');
    }

    $users = json_decode($usersData, true);
    if ($users === null && json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Invalid user database format: ' . json_last_error_msg());
    }

    if ($users === null) {
        $users = [];
    }

    // Check for duplicate username
    foreach ($users as $user) {
        if (strtolower($user['username']) === strtolower($username)) {
            sendResponse(false, 'Username already exists');
        }
    }

    // Check for duplicate email
    foreach ($users as $user) {
        if (strtolower($user['email']) === strtolower($email)) {
            sendResponse(false, 'Email already registered');
        }
    }

    // Generate new user ID
    $newUserId = 1;
    if (!empty($users)) {
        $lastUser = end($users);
        $newUserId = $lastUser['id'] + 1;
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    if (!$hashedPassword) {
        sendResponse(false, 'Failed to hash password');
    }

// Create new user
$newUser = [
    'id' => $newUserId,
    'username' => $username,
    'email' => $email,
    'password' => $hashedPassword,
    'created_at' => date('Y-m-d H:i:s'),
    'status' => 'active',
    'profile' => [
        'first_name' => '',
        'last_name' => '',
        'phone' => '',
        'address' => [
            'street' => '',
            'city' => '',
            'state' => '',
            'zip' => '',
            'country' => ''
        ]
    ]
];

    // Add user to array
    $users[] = $newUser;

    // Create backup
    if (file_exists($usersFile)) {
        if (!copy($usersFile, $backupFile)) {
            sendResponse(false, 'Failed to create backup file');
        }
    }

    // Save updated users
    $jsonData = json_encode($users, JSON_PRETTY_PRINT);
    if ($jsonData === false) {
        sendResponse(false, 'Failed to encode user data');
    }

    if (file_put_contents($usersFile, $jsonData) === false) {
        sendResponse(false, 'Failed to save user data');
    }

    // Remove password from response
    $userResponse = $newUser;
    unset($userResponse['password']);

    // Success response
    sendResponse(true, 'Registration successful! Welcome to UrbanThreadz!', $userResponse);

} catch (Exception $e) {
    sendResponse(false, 'An error occurred: ' . $e->getMessage());
} catch (Error $e) {
    sendResponse(false, 'A system error occurred: ' . $e->getMessage());
}
?>
