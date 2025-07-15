<?php
// Common functions for UrbanThreadz user management

// Sanitize input data
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Validate email format
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Validate username format
function validateUsername($username) {
    return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username);
}

// Validate password strength
function validatePassword($password) {
    return strlen($password) >= 8 && 
           preg_match('/[a-z]/', $password) && 
           preg_match('/[A-Z]/', $password) && 
           preg_match('/\d/', $password);
}

// Load users from JSON file
function loadUsers($filePath = '../data/users.json') {
    if (!file_exists($filePath)) {
        return [];
    }
    
    $data = file_get_contents($filePath);
    $users = json_decode($data, true);
    
    return $users ?: [];
}

// Save users to JSON file
function saveUsers($users, $filePath = '../data/users.json') {
    $jsonData = json_encode($users, JSON_PRETTY_PRINT);
    return file_put_contents($filePath, $jsonData) !== false;
}

// Find user by username
function findUserByUsername($username, $users = null) {
    if ($users === null) {
        $users = loadUsers();
    }
    
    foreach ($users as $user) {
        if (strtolower($user['username']) === strtolower($username)) {
            return $user;
        }
    }
    
    return null;
}

// Find user by email
function findUserByEmail($email, $users = null) {
    if ($users === null) {
        $users = loadUsers();
    }
    
    foreach ($users as $user) {
        if (strtolower($user['email']) === strtolower($email)) {
            return $user;
        }
    }
    
    return null;
}

// Find user by ID
function findUserById($id, $users = null) {
    if ($users === null) {
        $users = loadUsers();
    }
    
    foreach ($users as $user) {
        if ($user['id'] == $id) {
            return $user;
        }
    }
    
    return null;
}

// Generate next user ID
function getNextUserId($users = null) {
    if ($users === null) {
        $users = loadUsers();
    }
    
    if (empty($users)) {
        return 1;
    }
    
    $lastUser = end($users);
    return $lastUser['id'] + 1;
}

// Create user session
function createUserSession($user) {
    // Configure session settings
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', 0); // Set to 1 for HTTPS
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_lifetime', 86400); // 24 hours
    
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['logged_in'] = true;
    
    // Force session write
    session_write_close();
    session_start();
    
    // Debug log
    logActivity("Session created - ID: " . session_id() . ", Data: " . json_encode($_SESSION));
}

// Check if user is logged in
function isUserLoggedIn() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

// Get current user from session
function getCurrentUser() {
    if (!isUserLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email']
    ];
}

// Logout user
function logoutUser() {
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    session_destroy();
}

// Send JSON response
function sendJsonResponse($success, $message, $data = null, $statusCode = null) {
    if ($statusCode) {
        http_response_code($statusCode);
    } else {
        http_response_code($success ? 200 : 400);
    }
    
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Log activity (optional - for debugging)
function logActivity($message, $logFile = '../data/activity.log') {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// Generate secure random token
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Hash password securely
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Verify password against hash
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
?>
