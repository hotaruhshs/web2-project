# Copilot Instructions for UrbanThreadz Clothing Shop

## Architecture Overview

This is a PHP-based e-commerce clothing shop with a file-based data layer (XML/JSON) and Bootstrap 5.3.0 frontend. The project follows a traditional multi-page application pattern with AJAX enhancements.

**Key Components:**
- **Frontend**: Bootstrap 5.3.0 + vanilla JavaScript with XMLHttpRequest/fetch
- **Backend**: PHP scripts in `php/` directory  
- **Data Layer**: XML for products (`data/products.xml`), JSON for users/orders (`data/users.json`, `data/orders.json`)
- **Session Management**: PHP sessions with file-based user authentication

## Critical Development Patterns

### 1. Bootstrap-First Styling Approach
Always use Bootstrap 5.3.0 classes before custom CSS. Every HTML file must include:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```
Custom styles go in `css/styles.css` and should enhance, not replace, Bootstrap components.

### 2. Data Flow Patterns
- **Product Data**: XML → JavaScript parsing → DOM manipulation
- **User Data**: JSON file-based storage with PHP validation
- **Cart Data**: localStorage → JavaScript → JSON for checkout
- **Navigation**: Dynamic based on session state via `php/check_session.php`

### 3. AJAX Communication Pattern
Mixed XMLHttpRequest (for XML) and fetch (for JSON APIs):
```javascript
// Product loading (XML)
const xhr = new XMLHttpRequest();
xhr.open('GET', 'data/products.xml', true);

// User operations (JSON)
fetch('php/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
})
```

## Essential Workflows

### Local Development Setup
```bash
# Start PHP development server
./start_server.bat
# Access at http://127.0.0.1:8000
```

### Task Management Workflow
1. **Before starting**: Check `project-task-docs/main-task-list.md` for status
2. **During development**: Reference `project-task-docs/PROJECT_OVERVIEW.md` for architecture
3. **After completion**: Update task status AND create detailed log in `task-completion-logs/`

### File Structure Navigation
- `index.html` → Main entry point with hero section
- `products.html` → Product listing with XML parsing
- `cart.html` → Cart management with localStorage
- `checkout.html` → **Currently incomplete** - needs AJAX order submission
- `php/` → Backend scripts (login, register, profile, orders)
- `data/` → XML/JSON data files and activity logs

## Project-Specific Conventions

### 1. Navigation System
Every page uses the same navigation structure with dynamic login/logout state:
```html
<nav class="navbar navbar-expand-lg navbar-dark border-bottom">
    <!-- Dynamic content based on php/check_session.php -->
</nav>
```

### 2. Error Handling Pattern
```javascript
// AJAX error handling
.catch(error => {
    console.error('Error:', error);
    showToast('An error occurred. Please try again.', 'error');
});
```

### 3. Cart Management
Cart data flows: localStorage → JavaScript functions → JSON for PHP processing.
Key functions in `js/script.js`:
- `addToCart()`, `removeFromCart()`, `updateCartCount()`
- Cart persistence across page loads via localStorage

### 4. Configuration Constants
All app settings centralized in `php/config.php`:
- File paths, session settings, validation rules
- Currency/shipping configuration
- Error message constants

## Integration Points

### 1. Session Management
PHP sessions bridge frontend/backend state:
- `php/check_session.php` → Returns user login status
- `php/logout.php` → Clears session, redirects to login
- Navigation updates dynamically based on session state

### 2. Product Data Pipeline
XML → JavaScript parser → Bootstrap cards → Cart localStorage:
```javascript
// Key function: loadProductsFromXML() in script.js
// Parses products.xml and creates Bootstrap card components
```

### 3. Order Processing (Pending Implementation)
Expected flow: Cart localStorage → `php/submit_order.php` → `data/orders.json`

## Common Pitfalls to Avoid

1. **Don't bypass Bootstrap**: Always use Bootstrap classes first, custom CSS second
2. **File paths**: Use relative paths from web root (`data/products.xml`, not `../data/products.xml`)
3. **Session validation**: Check session state before displaying user-specific content
4. **Error boundaries**: Wrap AJAX calls in try-catch blocks with user-friendly messages

## Current Priority: Checkout Implementation
The checkout process (`checkout.html`) is incomplete. It needs:
- Form validation and submission to `php/submit_order.php`
- Order data structure matching `data/orders.json` format
- Integration with existing cart localStorage system
- Success redirect to `thankyou.html`

## Documentation Requirements
After completing any task, update both:
1. `project-task-docs/main-task-list.md` (status/date)
2. Create detailed log in `task-completion-logs/Task_[Name]_Log.md`
