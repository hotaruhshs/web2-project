<?php
// Main entry point for UrbanThreadz website
// Redirect to index.html for the main website

// Set the correct content type
header('Content-Type: text/html; charset=UTF-8');

// Check if index.html exists
if (file_exists('index.html')) {
    // Include the HTML file
    include 'index.html';
} else {
    // Fallback if index.html doesn't exist
    echo '<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UrbanThreadz - Error</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <div class="alert alert-danger">
                <h4>Error</h4>
                <p>The main website file (index.html) could not be found.</p>
                <p>Please check if the file exists in the root directory.</p>
            </div>
        </div>
    </body>
    </html>';
}
?>
