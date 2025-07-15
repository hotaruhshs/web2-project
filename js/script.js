// Main JavaScript for Clothing Shop Project

// Global variables
let allProducts = [];
let filteredProducts = [];
let currentUser = null;
let isLoggedIn = false;

// Utility function to format numbers with comma separators
function formatPriceWithCommas(price) {
    return parseFloat(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// XML loading function
function loadProductsFromXML() {
    const xhr = new XMLHttpRequest();
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('productsSection').style.display = 'none';
    document.getElementById('noProductsFound').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const xmlDoc = xhr.responseXML;
                    allProducts = parseProductsXML(xmlDoc);
                    filteredProducts = [...allProducts];
                    displayProducts(filteredProducts);
                    updateProductCount(filteredProducts.length);
                    
                    // Hide loading indicator and show products
                    document.getElementById('loadingIndicator').style.display = 'none';
                    document.getElementById('productsSection').style.display = 'block';
                } catch (error) {
                    console.error('Error parsing XML:', error);
                    showErrorMessage();
                }
            } else {
                console.error('Error loading XML:', xhr.status);
                showErrorMessage();
            }
        }
    };
    
    xhr.open('GET', 'data/products.xml', true);
    xhr.send();
}

// Parse XML to JavaScript objects
function parseProductsXML(xmlDoc) {
    const products = [];
    const productNodes = xmlDoc.getElementsByTagName('product');
    
    for (let i = 0; i < productNodes.length; i++) {
        const product = {
            id: productNodes[i].getElementsByTagName('id')[0].textContent,
            name: productNodes[i].getElementsByTagName('name')[0].textContent,
            price: parseFloat(productNodes[i].getElementsByTagName('price')[0].textContent),
            category: productNodes[i].getElementsByTagName('category')[0].textContent,
            description: productNodes[i].getElementsByTagName('description')[0].textContent,
            image: productNodes[i].getElementsByTagName('image')[0].textContent,
            sizes: productNodes[i].getElementsByTagName('sizes')[0].textContent.split(','),
            colors: productNodes[i].getElementsByTagName('colors')[0].textContent.split(','),
            inStock: productNodes[i].getElementsByTagName('inStock')[0].textContent === 'true'
        };
        products.push(product);
    }
    
    return products;
}

// Display products in grid
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    grid.className = 'd-flex flex-wrap justify-content-center gap-3';
    
    if (products.length === 0) {
        document.getElementById('productsSection').style.display = 'none';
        document.getElementById('noProductsFound').style.display = 'block';
        return;
    }
    
    // Ensure products section is visible
    document.getElementById('productsSection').style.display = 'block';
    document.getElementById('noProductsFound').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });
    
    // Add event listeners to "Add to Cart" buttons
    addCartEventListeners();
}

// Create product card element
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-auto mb-4';
    
    const stockBadge = product.inStock ? 
        '<span class="badge bg-success">In Stock</span>' : 
        '<span class="badge bg-danger">Out of Stock</span>';
    
    // Check if product has size/color options
    const hasOptions = product.sizes.length > 0 || product.colors.length > 0;
    
    col.innerHTML = `
        <div class="card h-100 product-card shadow-sm" style="cursor: pointer; width: 250px;" data-product-id="${product.id}">
            <div class="position-relative">
                <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 280px; width: 250px; object-fit: cover;">
                <div class="position-absolute top-0 end-0 m-2">
                    ${stockBadge}
                </div>
            </div>
            <div class="card-body d-flex flex-column" style="width: 250px;">
                <div class="mb-2">
                    <h5 class="card-title mb-1" style="font-size: 1rem;">${product.name}</h5>
                    <span class="badge bg-secondary">${product.category}</span>
                </div>
                
                <div class="mb-3">
                    <h4 class="text-primary mb-2">₱${formatPriceWithCommas(product.price)}</h4>
                </div>
                
                <p class="card-text text-muted mb-4" style="font-size: 0.85rem; line-height: 1.3;">${product.description}</p>
                
                <div class="mt-auto">
                    <button class="btn btn-primary w-100 add-to-cart-btn" 
                            data-product-id="${product.id}" 
                            data-product-name="${product.name}"
                            data-product-price="${product.price}"
                            data-product-image="${product.image}"
                            ${!product.inStock ? 'disabled' : ''}
                            onclick="event.stopPropagation();">
                        <i class="bi bi-cart-plus me-1"></i>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Update product count display
function updateProductCount(count) {
    const countElement = document.getElementById('productCount');
    if (count === 1) {
        countElement.textContent = '1 product found';
    } else {
        countElement.textContent = `${count} products found`;
    }
}

// Show error message
function showErrorMessage() {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('productsSection').style.display = 'none';
    document.getElementById('noProductsFound').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
}

// Filter and search functions
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    // Check if we have products to filter
    if (allProducts.length === 0) {
        console.warn('No products loaded to filter');
        return;
    }
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm) ||
                            product.category.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    // Sort products
    sortProducts(filteredProducts, sortFilter);
    
    // Display filtered products
    displayProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
    
    // Show helpful message if no results but products exist
    if (filteredProducts.length === 0 && allProducts.length > 0) {
        showNoResultsMessage(searchTerm, categoryFilter);
    }
}

// Sort products function
function sortProducts(products, sortType) {
    switch (sortType) {
        case 'name':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
    }
}

// Clear filters function
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortFilter').value = 'name';
    
    // Reset to all products if they exist
    if (allProducts.length > 0) {
        filteredProducts = [...allProducts];
        sortProducts(filteredProducts, 'name');
        displayProducts(filteredProducts);
        updateProductCount(filteredProducts.length);
        
        // Hide no products message
        document.getElementById('noProductsFound').style.display = 'none';
        document.getElementById('productsSection').style.display = 'block';
    } else {
        // If no products loaded, try to reload
        console.warn('No products available, attempting to reload...');
        loadProductsFromXML();
    }
}

// Smart reset function that handles different scenarios
function smartReset() {
    if (allProducts.length === 0) {
        // No products loaded - reload from XML
        loadProductsFromXML();
    } else {
        // Products exist - just clear filters
        clearFilters();
    }
}

// Show contextual no results message
function showNoResultsMessage(searchTerm, categoryFilter) {
    const noProductsDiv = document.getElementById('noProductsFound');
    const messageContainer = noProductsDiv.querySelector('.col-md-6');
    
    let message = 'No products found';
    let suggestion = 'Try adjusting your search or filter criteria.';
    
    if (searchTerm && categoryFilter) {
        message = `No "${categoryFilter}" products found for "${searchTerm}"`;
        suggestion = 'Try removing the category filter or using different keywords.';
    } else if (searchTerm) {
        message = `No products found for "${searchTerm}"`;
        suggestion = 'Try different keywords or browse our categories.';
    } else if (categoryFilter) {
        message = `No products found in "${categoryFilter}" category`;
        suggestion = 'This category might be temporarily empty. Try other categories.';
    }
    
    messageContainer.innerHTML = `
        <i class="bi bi-search display-1 text-muted mb-3"></i>
        <h3 class="text-muted">${message}</h3>
        <p class="text-muted">${suggestion}</p>
        <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-primary" id="resetFilters">Clear Filters</button>
            <button class="btn btn-outline-secondary" id="reloadProducts">Reload Products</button>
        </div>
    `;
    
    // Re-attach event listeners for the new buttons
    document.getElementById('resetFilters').addEventListener('click', clearFilters);
    document.getElementById('reloadProducts').addEventListener('click', loadProductsFromXML);
}

// Add to cart functionality
function addCartEventListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const productPrice = parseFloat(this.dataset.productPrice);
            const productImage = this.dataset.productImage;
            
            // Check if this product has size/color options
            const product = allProducts.find(p => p.id === productId);
            const hasOptions = product && (product.sizes.length > 0 || product.colors.length > 0);
            
            if (hasOptions) {
                // If product has options, open modal for selection
                showProductModal(productId);
            } else {
                // Add directly to cart if no options
                addToCart(productId, productName, productPrice, productImage);
            }
        });
    });
    
    // Product card click events for modal
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.dataset.productId;
            showProductModal(productId);
        });
    });
}

// Add to cart function (for products without options)
function addToCart(productId, productName, productPrice, productImage) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId && !item.size && !item.color);
    
    if (existingItemIndex > -1) {
        // Update quantity if product exists
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count display
    updateCartCount();
    
    // Show success toast
    showAddToCartToast();
}

// Update cart count in navigation
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

// Show add to cart success toast
function showAddToCartToast() {
    const toastElement = document.getElementById('addToCartToast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Show product modal with size and color selection
function showProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modalContent = document.getElementById('productModalContent');
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.image}" class="img-fluid rounded shadow" alt="${product.name}">
            </div>
            <div class="col-md-6">
                <h4 class="fw-bold">${product.name}</h4>
                <p class="text-muted mb-2">${product.category}</p>
                <h5 class="text-primary mb-3">₱${formatPriceWithCommas(product.price)}</h5>
                <p class="text-muted mb-4">${product.description}</p>
                
                <!-- Size Selection -->
                <div class="mb-3">
                    <label class="form-label fw-semibold">Size:</label>
                    <div class="d-flex gap-2 flex-wrap" id="sizeOptions">
                        ${product.sizes.map(size => `
                            <input type="radio" class="btn-check" name="selectedSize" id="size-${size}" value="${size}" autocomplete="off">
                            <label class="btn btn-outline-secondary" for="size-${size}">${size}</label>
                        `).join('')}
                    </div>
                    <div class="text-danger small mt-1" id="sizeError" style="display: none;">Please select a size</div>
                </div>
                
                <!-- Color Selection -->
                <div class="mb-4">
                    <label class="form-label fw-semibold">Color:</label>
                    <div class="d-flex gap-2 flex-wrap" id="colorOptions">
                        ${product.colors.map(color => `
                            <input type="radio" class="btn-check" name="selectedColor" id="color-${color}" value="${color}" autocomplete="off">
                            <label class="btn btn-outline-secondary" for="color-${color}">${color}</label>
                        `).join('')}
                    </div>
                    <div class="text-danger small mt-1" id="colorError" style="display: none;">Please select a color</div>
                </div>
                
                <!-- Stock Status -->
                <div class="mb-3">
                    <span class="badge ${product.inStock ? 'bg-success' : 'bg-danger'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                
                <!-- Add to Cart Button -->
                <button class="btn btn-primary w-100 btn-lg" 
                        id="modalAddToCart" 
                        data-product-id="${product.id}" 
                        data-product-name="${product.name}"
                        data-product-price="${product.price}"
                        data-product-image="${product.image}"
                        ${!product.inStock ? 'disabled' : ''}>
                    <i class="bi bi-cart-plus me-2"></i>Add to Cart
                </button>
            </div>
        </div>
    `;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
    
    // Add event listener for the modal add to cart button
    document.getElementById('modalAddToCart').addEventListener('click', function() {
        const selectedSize = document.querySelector('input[name="selectedSize"]:checked');
        const selectedColor = document.querySelector('input[name="selectedColor"]:checked');
        
        // Reset previous error messages
        document.getElementById('sizeError').style.display = 'none';
        document.getElementById('colorError').style.display = 'none';
        
        // Validate selections
        let hasError = false;
        if (product.sizes.length > 0 && !selectedSize) {
            document.getElementById('sizeError').style.display = 'block';
            hasError = true;
        }
        if (product.colors.length > 0 && !selectedColor) {
            document.getElementById('colorError').style.display = 'block';
            hasError = true;
        }
        
        if (hasError) return;
        
        // Add to cart with size and color
        const productId = this.dataset.productId;
        const productName = this.dataset.productName;
        const productPrice = parseFloat(this.dataset.productPrice);
        const productImage = this.dataset.productImage;
        
        const size = selectedSize ? selectedSize.value : null;
        const color = selectedColor ? selectedColor.value : null;
        
        addToCartWithOptions(productId, productName, productPrice, productImage, size, color);
        
        // Close modal and show success
        modal.hide();
        showAddToCartToast();
    });
}

// Enhanced add to cart function with size and color options
function addToCartWithOptions(productId, productName, productPrice, productImage, size, color) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Create unique identifier for product with size and color
    const uniqueId = `${productId}-${size || 'none'}-${color || 'none'}`;
    
    // Check if this exact combination already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && 
        item.size === size && 
        item.color === color
    );
    
    if (existingItemIndex > -1) {
        // Increase quantity if same product with same size and color exists
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item with size and color
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            size: size,
            color: color,
            quantity: 1,
            uniqueId: uniqueId
        });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count display
    updateCartCount();
}

// Navigation highlighting function
function highlightActiveNavigation() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remove active class from all nav links (excluding cart icon for now)
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.cart-icon)');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Also handle cart icon separately
    const cartIcon = document.querySelector('.navbar-nav .nav-link.cart-icon');
    if (cartIcon) {
        cartIcon.classList.remove('active');
    }
    
    // Add active class to current page link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage === 'index.html' && href === 'index.html') ||
            (currentPage === 'products.html' && href === 'products.html') ||
            (currentPage === 'login.html' && href === 'login.html') ||
            (currentPage === 'register.html' && href === 'register.html') ||
            (currentPage === 'profile.html' && href === 'profile.html') ||
            (currentPage === 'checkout.html' && href === 'checkout.html') ||
            (currentPage === 'thankyou.html' && href === 'thankyou.html')) {
            link.classList.add('active');
        }
    });
    
    // Handle cart icon highlighting for cart and checkout pages
    if (cartIcon && (currentPage === 'cart.html' || currentPage === 'checkout.html')) {
        cartIcon.classList.add('active');
    }
}

// Authentication state management
function checkAuthenticationState() {
    console.log('Checking authentication state...');
    fetch('php/check_session.php', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Authentication response:', data);
            if (data.success) {
                currentUser = data.data;
                isLoggedIn = true;
                updateNavigationForLoggedInUser();
                checkLoginRedirect();
                displayProfile();
            } else {
                currentUser = null;
                isLoggedIn = false;
                updateNavigationForLoggedOutUser();
                displayProfile();
            }
        })
        .catch(error => {
            console.error('Error checking authentication state:', error);
            currentUser = null;
            isLoggedIn = false;
            updateNavigationForLoggedOutUser();
            displayProfile();
        });
}

// Session refresh function
function refreshSession() {
    console.log('Refreshing session...');
    checkAuthenticationState();
}

// Check authentication state every 30 seconds
setInterval(refreshSession, 30000);

// Update navigation for logged in user
function updateNavigationForLoggedInUser() {
    const authSection = document.querySelector('.navbar-nav.position-absolute');
    if (authSection) {
        // Get current page to determine if profile should be highlighted
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isProfilePage = currentPage === 'profile.html';
        
        authSection.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center ${isProfilePage ? 'active' : ''}" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle me-2"></i>${currentUser.username}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logoutUser()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;
    }
}

// Update navigation for logged out user
function updateNavigationForLoggedOutUser() {
    const authSection = document.querySelector('.navbar-nav.position-absolute');
    if (authSection) {
        authSection.innerHTML = `
            <a class="nav-link me-3" href="login.html">Login</a>
            <a class="btn btn-primary signup-btn" href="register.html">Sign Up for Free</a>
        `;
    }
}

// Logout function
function logoutUser() {
    fetch('php/logout.php', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = null;
            isLoggedIn = false;
            updateNavigationForLoggedOutUser();
            
            // Show success message
            showLogoutMessage('Logged out successfully!');
            
            // Redirect to homepage after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            console.error('Logout failed:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}

// Show logout message
function showLogoutMessage(message) {
    // Remove existing messages
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create success alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// Check if user is already logged in and redirect accordingly
function checkLoginRedirect() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Only redirect if we're on login or register pages and user is logged in
    if (isLoggedIn && (currentPage === 'login.html' || currentPage === 'register.html')) {
        window.location.href = 'profile.html';
    }
}

// Profile page functionality
function displayProfile() {
    const profileLoading = document.getElementById('profile-loading');
    const profileContent = document.getElementById('profile-content');
    const notLoggedIn = document.getElementById('not-logged-in');
    
    // Debug: Check if we're on the profile page
    console.log('displayProfile called - Elements found:', {
        profileLoading: !!profileLoading,
        profileContent: !!profileContent,
        notLoggedIn: !!notLoggedIn,
        isLoggedIn: isLoggedIn,
        currentUser: currentUser
    });
    
    if (!profileLoading || !profileContent || !notLoggedIn) {
        console.log('Not on profile page or elements not found');
        return; // Not on profile page
    }
    
    if (isLoggedIn && currentUser) {
        console.log('User is logged in, displaying profile');
        // Display user information
        document.getElementById('profile-username').textContent = currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('profile-id').textContent = currentUser.id;
        document.getElementById('profile-created').textContent = formatDate(currentUser.created_at);
        document.getElementById('profile-status').textContent = currentUser.status ? (currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)) : 'Active';
        
        // Show profile content
        profileLoading.classList.add('d-none');
        profileContent.classList.remove('d-none');
        notLoggedIn.classList.add('d-none');
    } else {
        console.log('User is not logged in, showing login prompt');
        // Show not logged in message
        profileLoading.classList.add('d-none');
        profileContent.classList.add('d-none');
        notLoggedIn.classList.remove('d-none');
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication state on all pages
    checkAuthenticationState();
    
    // Only run products-specific code if we're on the products page
    if (document.getElementById('loadingIndicator')) {
        // Load products from XML
        loadProductsFromXML();
        
        // Add event listeners for filters
        document.getElementById('searchInput').addEventListener('input', filterProducts);
        document.getElementById('categoryFilter').addEventListener('change', filterProducts);
        document.getElementById('sortFilter').addEventListener('change', filterProducts);
        document.getElementById('clearFilters').addEventListener('click', clearFilters);
        
        // Check if resetFilters button exists (it's dynamically created)
        const resetFiltersBtn = document.getElementById('resetFilters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', clearFilters);
        }
    }
    
    // Update cart count on all pages
    updateCartCount();
});

// Initialize navigation highlighting for all pages
document.addEventListener('DOMContentLoaded', function() {
    highlightActiveNavigation();
});

// Enhanced registration form functionality
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
        // Initialize password toggle functionality
        initPasswordToggle();
        
        // Add form validation
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Clear previous validation states
            clearValidationStates();
            
            let isValid = true;
            
            // Username validation
            if (username.length < 3) {
                showValidationError('username', 'Username must be at least 3 characters long');
                isValid = false;
            } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                showValidationError('username', 'Username can only contain letters, numbers, and underscores');
                isValid = false;
            } else {
                showValidationSuccess('username');
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showValidationError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                showValidationSuccess('email');
            }
            
            // Password validation
            if (password.length < 8) {
                showValidationError('password', 'Password must be at least 8 characters long');
                isValid = false;
            } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
                showValidationError('password', 'Password must contain uppercase, lowercase, and number');
                isValid = false;
            } else {
                showValidationSuccess('password');
            }
            
            // Confirm password validation
            if (password !== confirmPassword) {
                showValidationError('confirmPassword', 'Passwords do not match');
                isValid = false;
            } else if (confirmPassword.length > 0) {
                showValidationSuccess('confirmPassword');
            }
            
            // Terms validation
            if (!terms) {
                showValidationError('terms', 'You must agree to the terms and conditions');
                isValid = false;
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin me-2"></i>Creating Account...';
                submitBtn.disabled = true;
                
                // Prepare form data
                const formData = new FormData();
                formData.append('username', username);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('confirmPassword', confirmPassword);
                formData.append('terms', terms);
                
                // Submit to backend
                fetch('php/register.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Show success message
                        showSuccessMessage(data.message);
                        
                        // Redirect to login page after 2 seconds
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    } else {
                        // Handle validation errors from backend
                        if (data.data && typeof data.data === 'object') {
                            Object.keys(data.data).forEach(field => {
                                showValidationError(field, data.data[field]);
                            });
                        } else {
                            showErrorMessage(data.message);
                        }
                        
                        // Reset button
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Registration error:', error);
                    showErrorMessage('An error occurred. Please try again.');
                    
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
            }
        });
        
        // Real-time validation
        document.getElementById('username').addEventListener('input', function() {
            const username = this.value.trim();
            if (username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)) {
                showValidationSuccess('username');
            } else if (username.length > 0) {
                if (username.length < 3) {
                    showValidationError('username', 'Username must be at least 3 characters long');
                } else {
                    showValidationError('username', 'Username can only contain letters, numbers, and underscores');
                }
            } else {
                clearFieldValidation('username');
            }
        });
        
        document.getElementById('email').addEventListener('input', function() {
            const email = this.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(email)) {
                showValidationSuccess('email');
            } else if (email.length > 0) {
                showValidationError('email', 'Please enter a valid email address');
            } else {
                clearFieldValidation('email');
            }
        });
        
        document.getElementById('password').addEventListener('input', function() {
            const password = this.value;
            if (password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
                showValidationSuccess('password');
            } else if (password.length > 0) {
                if (password.length < 8) {
                    showValidationError('password', 'Password must be at least 8 characters long');
                } else {
                    showValidationError('password', 'Password must contain uppercase, lowercase, and number');
                }
            } else {
                clearFieldValidation('password');
            }
            
            // Check password match when password changes
            checkPasswordMatch();
        });
        
        document.getElementById('confirmPassword').addEventListener('input', function() {
            checkPasswordMatch();
        });
    }
});

// Password toggle functionality
function initPasswordToggle() {
    const passwordToggle = document.getElementById('togglePassword');
    const confirmPasswordToggle = document.getElementById('toggleConfirmPassword');
    
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility('password', 'togglePasswordIcon');
        });
    }
    
    if (confirmPasswordToggle) {
        confirmPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility('confirmPassword', 'toggleConfirmPasswordIcon');
        });
    }
}

function togglePasswordVisibility(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(iconId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword.length === 0) {
        clearFieldValidation('confirmPassword');
        return;
    }
    
    if (password === confirmPassword) {
        showValidationSuccess('confirmPassword');
    } else {
        showValidationError('confirmPassword', 'Passwords do not match');
    }
}

// Validation helper functions
function showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const feedback = field.parentNode.querySelector('.invalid-feedback') || createFeedbackElement(field.parentNode, 'invalid-feedback');
    
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    feedback.textContent = message;
    feedback.style.display = 'block';
}

function showValidationSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    const invalidFeedback = field.parentNode.querySelector('.invalid-feedback');
    
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    
    if (invalidFeedback) {
        invalidFeedback.style.display = 'none';
    }
}

function clearFieldValidation(fieldId) {
    const field = document.getElementById(fieldId);
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    
    field.classList.remove('is-valid', 'is-invalid');
    
    if (feedback) {
        feedback.style.display = 'none';
    }
}

function clearValidationStates() {
    ['username', 'email', 'password', 'confirmPassword'].forEach(fieldId => {
        clearFieldValidation(fieldId);
    });
}

function createFeedbackElement(parent, className) {
    const feedback = document.createElement('div');
    feedback.className = className;
    feedback.style.display = 'none';
    parent.appendChild(feedback);
    return feedback;
}

// Success and error message functions
function showSuccessMessage(message) {
    removeExistingMessages();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.getElementById('register-form');
    form.parentNode.insertBefore(alertDiv, form);
}

function showErrorMessage(message) {
    removeExistingMessages();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.getElementById('register-form');
    form.parentNode.insertBefore(alertDiv, form);
}

function removeExistingMessages() {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
}

// CSS animation for spinning icon
const spinCSS = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;

// Add CSS to head
const style = document.createElement('style');
style.textContent = spinCSS;
document.head.appendChild(style);

// Login form functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            // Clear previous messages
            clearMessages();
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
            
            // Create form data
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            
            // Send login request
            fetch('php/login.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessMessage(data.message);
                    
                    // Update global state
                    currentUser = data.data;
                    isLoggedIn = true;
                    
                    // Update navigation
                    updateNavigationForLoggedInUser();
                    
                    // Redirect to profile or intended page
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                } else {
                    showErrorMessage(data.message);
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showErrorMessage('An error occurred during login. Please try again.');
            })
            .finally(() => {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In';
            });
        });
    }
});

// Helper functions for login form
function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.getElementById('login-form');
    form.parentNode.insertBefore(alertDiv, form);
}

function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.getElementById('login-form');
    form.parentNode.insertBefore(alertDiv, form);
}

function clearMessages() {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
}
