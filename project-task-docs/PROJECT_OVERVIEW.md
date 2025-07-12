# Clothing Shop Project Overview

## Purpose
A modern, user-friendly online clothing shop allowing customers to browse products, register, manage their cart, and place orders. Includes an admin panel for managing products and orders.

## Tech Stack
- **HTML**: Structure for all pages
- **CSS**: Styling, layout, and responsive design
- **JavaScript**: Cart logic, AJAX, dynamic UI
- **XML**: Product data storage (`products.xml`)
- **JSON**: Cart/order data exchange

**AJAX (XMLHttpRequest)**: Asynchronous communication
**PHP**: Server-side processing, authentication, data handling
**MySQL** (optional): User registration data

## Architecture
**Frontend**: HTML, CSS, JS (modular, event-driven, accessible)
**Backend**: PHP scripts for login, registration, order processing, admin functions
**Data**: Products in XML, orders in JSON, users in JSON

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
│   ├── products.xml
│   ├── users.json             ← Registered users
│   └── orders.json            ← Orders saved here
├── php/
│   ├── register.php
│   ├── login.php
│   ├── profile.php
│   ├── submit_order.php
│   └── add_product.php
```

---

# Project Requirements

## User Pages

| Page               | File Name       | Description                                    |
| ------------------ | --------------- | ---------------------------------------------- |
| Homepage           | `index.html`    | Welcome, banners, shop info                    |
| Product Listing    | `products.html` | Browse products (from `products.xml`)          |
| Register           | `register.html` | New user registration (JSON/MySQL)             |
| Login              | `login.html`    | User login (PHP validation)                    |
| Profile            | `profile.html`  | View/edit user info                            |
| Cart               | `cart.html`     | View/manage cart items                         |
| Checkout           | `checkout.html` | Place order via AJAX (JSON)                    |
| Order Success      | `thankyou.html` | Confirmation page                              |

## Admin Pages

| Page             | File Name                         | Description                                 |
| ---------------- | --------------------------------- | ------------------------------------------- |
| Admin Login      | `admin-login.html`                | Admin authentication                        |
| Dashboard        | `admin-dashboard.html`            | Overview: orders, products, stats           |
| Manage Orders    | `admin-orders.php`                | View/manage orders (`orders.json`)          |
| Add Product      | `add-product.html`                | Add products to `products.xml`              |
| Edit Products    | `edit-products.html`                | Edit/delete products                        |

## Functional Requirements

- Product listing loads from XML, displayed with semantic HTML and accessible design.
- Cart actions (add/remove/update) handled via JavaScript, data sent as JSON.
- Registration and login use PHP for validation and security.
- Orders placed via AJAX, stored in JSON, confirmation shown on success.
- Admin panel allows product and order management, with secure access.
- All user data is validated and sanitized on both client and server sides.
- Sensitive info (e.g., DB credentials) stored in environment variables.

## Non-Functional Requirements

- Responsive design for desktop and mobile.
- Clean, maintainable code with comments for complex logic.
- Error handling for failed AJAX requests and invalid data.
- Accessibility: alt attributes, labels, keyboard navigation.
