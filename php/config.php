<?php
// Configuration file for UrbanThreadz

// Database settings (JSON file-based)
define('USERS_FILE', '../data/users.json');
define('ORDERS_FILE', '../data/orders.json');
define('PRODUCTS_FILE', '../data/products.xml');

// Security settings
define('SESSION_TIMEOUT', 3600); // 1 hour
define('MAX_LOGIN_ATTEMPTS', 5);
define('PASSWORD_MIN_LENGTH', 8);

// Application settings
define('APP_NAME', 'UrbanThreadz');
define('APP_VERSION', '1.0.0');
define('DEBUG_MODE', true); // Set to false in production

// Email settings (for future use)
define('SMTP_HOST', 'localhost');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');
define('FROM_EMAIL', 'noreply@urbanthreadz.com');
define('FROM_NAME', 'UrbanThreadz');

// File upload settings
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_DIR', '../uploads/');
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif']);

// Pagination settings
define('PRODUCTS_PER_PAGE', 12);
define('ORDERS_PER_PAGE', 10);

// Currency settings
define('CURRENCY_SYMBOL', '$');
define('CURRENCY_CODE', 'USD');

// Tax settings
define('TAX_RATE', 0.08); // 8% tax rate

// Shipping settings
define('FREE_SHIPPING_THRESHOLD', 50.00);
define('SHIPPING_COST', 5.99);

// Error messages
define('ERROR_MESSAGES', [
    'INVALID_CREDENTIALS' => 'Invalid username or password',
    'ACCOUNT_LOCKED' => 'Account is temporarily locked due to multiple failed login attempts',
    'ACCOUNT_INACTIVE' => 'Account is not active',
    'USER_NOT_FOUND' => 'User not found',
    'EMAIL_EXISTS' => 'Email already exists',
    'USERNAME_EXISTS' => 'Username already exists',
    'WEAK_PASSWORD' => 'Password does not meet security requirements',
    'PASSWORDS_MISMATCH' => 'Passwords do not match',
    'INVALID_EMAIL' => 'Invalid email address',
    'REQUIRED_FIELD' => 'This field is required',
    'FILE_TOO_LARGE' => 'File size exceeds maximum allowed size',
    'INVALID_FILE_TYPE' => 'Invalid file type',
    'DATABASE_ERROR' => 'Database operation failed',
    'PERMISSION_DENIED' => 'Permission denied',
    'SESSION_EXPIRED' => 'Session has expired',
    'CSRF_TOKEN_INVALID' => 'Invalid security token'
]);

// Success messages
define('SUCCESS_MESSAGES', [
    'REGISTRATION_SUCCESS' => 'Registration successful! Welcome to UrbanThreadz!',
    'LOGIN_SUCCESS' => 'Login successful! Welcome back!',
    'LOGOUT_SUCCESS' => 'Logged out successfully',
    'PROFILE_UPDATED' => 'Profile updated successfully',
    'PASSWORD_CHANGED' => 'Password changed successfully',
    'ORDER_PLACED' => 'Order placed successfully',
    'PRODUCT_ADDED' => 'Product added successfully',
    'PRODUCT_UPDATED' => 'Product updated successfully',
    'PRODUCT_DELETED' => 'Product deleted successfully'
]);

// Validation rules
define('VALIDATION_RULES', [
    'username' => [
        'min_length' => 3,
        'max_length' => 20,
        'pattern' => '/^[a-zA-Z0-9_]+$/'
    ],
    'password' => [
        'min_length' => 8,
        'require_uppercase' => true,
        'require_lowercase' => true,
        'require_number' => true,
        'require_special' => false
    ],
    'email' => [
        'max_length' => 255
    ],
    'phone' => [
        'pattern' => '/^[\d\s\+\-\(\)]+$/'
    ]
]);

// Helper function to get configuration value
function getConfig($key) {
    return defined($key) ? constant($key) : null;
}

// Helper function to get error message
function getErrorMessage($key) {
    $messages = ERROR_MESSAGES;
    return isset($messages[$key]) ? $messages[$key] : 'An error occurred';
}

// Helper function to get success message
function getSuccessMessage($key) {
    $messages = SUCCESS_MESSAGES;
    return isset($messages[$key]) ? $messages[$key] : 'Operation successful';
}

// Helper function to get validation rule
function getValidationRule($field, $rule) {
    $rules = VALIDATION_RULES;
    return isset($rules[$field][$rule]) ? $rules[$field][$rule] : null;
}
?>
