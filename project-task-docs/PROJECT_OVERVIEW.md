# Clothing Shop Project Overview

## Purpose
A modern, user-friendly online clothing shop allowing customers to browse products, register, manage their cart, and place orders. Includes an admin panel for managing products and orders.

## Tech Stack
- **HTML**: Structure for all pages
- **CSS**: Styling, layout, and responsive design (Bootstrap 5.3.0 + custom CSS)
- **JavaScript**: Cart logic, AJAX, dynamic UI, navigation highlighting
- **XML**: Product data storage (`products.xml`)
- **JSON**: Cart/order data exchange

**AJAX (XMLHttpRequest)**: Asynchronous communication
**PHP**: Server-side processing, authentication, data handling
**Bootstrap 5.3.0**: Responsive framework for consistent UI components
**MySQL** (optional): User registration data

## Architecture
**Frontend**: HTML, CSS, JS (modular, event-driven, accessible)
**Backend**: PHP scripts for login, registration, order processing, admin functions
**Data**: Products in XML, orders in JSON, users in JSON
**Framework**: Bootstrap 5.3.0 for responsive design and UI components
**Features**: Dynamic navigation highlighting, standardized layouts, product catalog

## Project Structure
```text
/clothing-shop
├── index.html                 ← Homepage
├── products.html              ← Product listing
├── register.html              ← User registration
├── login.html                 ← User login
├── profile.html               ← User profile
├── cart.html                  ← Cart page
├── checkout.html              ← Checkout page
├── thankyou.html              ← Order confirmation
├── admin/
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── admin-orders.php
│   ├── add-product.html
│   └── edit-products.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── data/
│   ├── products.xml           ← Product catalog with 15 items
│   ├── users.json             ← Registered users
│   └── orders.json            ← Orders saved here
├── php/
│   ├── register.php
│   ├── login.php
│   ├── profile.php
│   ├── submit_order.php
│   ├── add_product.php
│   ├── check_session.php
│   ├── config.php
│   ├── logout.php
│   └── user_functions.php
```

---

# Project Requirements

## User Pages

| Page               | File Name       | Description                                    | Status      |
| ------------------ | --------------- | ---------------------------------------------- | ----------- |
| Homepage           | `index.html`    | Welcome, banners, shop info                    | ✅ Completed |
| Product Listing    | `products.html` | Browse products (from `products.xml`)          | ✅ Completed |
| Register           | `register.html` | New user registration (JSON/MySQL)             | 🔄 In Progress |
| Login              | `login.html`    | User login (PHP validation)                    | 🔄 In Progress |
| Profile            | `profile.html`  | View/edit user info                            | 🔄 In Progress |
| Cart               | `cart.html`     | View/manage cart items                         | 🔄 In Progress |
| Checkout           | `checkout.html` | Place order via AJAX (JSON)                    | 🔄 In Progress |
| Order Success      | `thankyou.html` | Confirmation page                              | 🔄 In Progress |

## Admin Pages

| Page             | File Name                         | Description                                 | Status      |
| ---------------- | --------------------------------- | ------------------------------------------- | ----------- |
| Admin Login      | `admin-login.html`                | Admin authentication                        | 🔄 Pending |
| Dashboard        | `admin-dashboard.html`            | Overview: orders, products, stats           | 🔄 Pending |
| Manage Orders    | `admin-orders.php`                | View/manage orders (`orders.json`)          | 🔄 Pending |
| Add Product      | `add-product.html`                | Add products to `products.xml`              | 🔄 Pending |
| Edit Products    | `edit-products.html`                | Edit/delete products                        | 🔄 Pending |

## Functional Requirements

### ✅ Completed Features
- **Product Catalog**: 15 products loaded from XML with categories (Tops, Bottoms, Accessories)
- **Homepage**: Complete with hero section, featured products, and about section
- **Navigation System**: Dynamic highlighting of active pages across all site pages
- **Responsive Design**: Bootstrap 5.3.0 implementation with mobile-first approach
- **Standardized Layout**: Consistent navigation and footer across all pages
- **Product Display**: Grid-based product listing with filtering and search capabilities

### 🔄 In Progress Features
- Product listing loads from XML, displayed with semantic HTML and accessible design.
- Cart actions (add/remove/update) handled via JavaScript, data sent as JSON.
- Registration and login use PHP for validation and security.
- Orders placed via AJAX, stored in JSON, confirmation shown on success.
- Admin panel allows product and order management, with secure access.
- All user data is validated and sanitized on both client and server sides.
- Sensitive info (e.g., DB credentials) stored in environment variables.

## Non-Functional Requirements

### ✅ Implemented
- **Responsive Design**: Bootstrap 5.3.0 for desktop and mobile compatibility
- **Clean Code**: Maintainable code structure with proper commenting
- **Accessibility**: Alt attributes, semantic HTML, keyboard navigation support
- **Performance**: Optimized images (WebP format) and efficient CSS/JS loading
- **Cross-browser Compatibility**: Standards-compliant HTML/CSS/JS

### 🔄 In Development
- Error handling for failed AJAX requests and invalid data
- Complete form validation on both client and server sides
- Security measures for user authentication and data handling

---

## Project Progress Summary

**Overall Progress**: ~35% Complete

**Completed Components**:
- Project structure and organization
- Homepage with hero section and featured products
- Product listing page with 15 products from XML
- Navigation highlighting system
- Responsive Bootstrap framework integration
- Basic styling and layout standardization

**Next Priority Tasks**:
1. User registration and login system
2. Cart functionality with JavaScript
3. Checkout process with AJAX
4. Order management system
5. Admin panel development
