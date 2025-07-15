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
            quantity: 1,
            selected: true // Default to selected for new items
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
            uniqueId: uniqueId,
            selected: true // Default to selected for new items
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
    return fetch('php/check_session.php', {
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
            return data.success;
        })
        .catch(error => {
            console.error('Error checking authentication state:', error);
            currentUser = null;
            isLoggedIn = false;
            updateNavigationForLoggedOutUser();
            displayProfile();
            return false;
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
        
        // Check if user has a profile image
        const hasProfileImage = currentUser.profile && currentUser.profile.profile_image;
        const profileImageHtml = hasProfileImage 
            ? `<img src="uploads/profiles/${currentUser.profile.profile_image}" class="rounded-circle me-2" style="width: 24px; height: 24px; object-fit: cover;" alt="Profile" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
               <i class="bi bi-person-circle me-2" style="display: none;"></i>`
            : `<i class="bi bi-person-circle me-2"></i>`;
        
        authSection.innerHTML = `
            <div class="dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center ${isProfilePage ? 'active' : ''}" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    ${profileImageHtml}${currentUser.username}
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
    console.log('=== displayProfile called ===');
    const profileLoading = document.getElementById('profile-loading');
    const profileContent = document.getElementById('profile-content');
    const notLoggedIn = document.getElementById('not-logged-in');
    
    // Debug: Check if we're on the profile page
    console.log('displayProfile called - Elements found:', {
        profileLoading: !!profileLoading,
        profileContent: !!profileContent,
        notLoggedIn: !!notLoggedIn,
        isLoggedIn: isLoggedIn,
        currentUser: currentUser,
        timestamp: new Date().toISOString()
    });
    
    if (!profileLoading || !profileContent || !notLoggedIn) {
        console.log('Not on profile page or elements not found');
        return; // Not on profile page
    }
    
    if (isLoggedIn && currentUser) {
        console.log('User is logged in, displaying profile');
        
        // Display user information with error handling
        try {
            const usernameElement = document.getElementById('profile-username');
            const emailElement = document.getElementById('profile-email');
            const firstNameElement = document.getElementById('profile-first-name');
            const lastNameElement = document.getElementById('profile-last-name');
            const phoneElement = document.getElementById('profile-phone');
            const addressElement = document.getElementById('profile-address');
            const createdElement = document.getElementById('profile-created');
            const statusElement = document.getElementById('profile-status');
            
            console.log('Profile elements check:', {
                usernameElement: !!usernameElement,
                emailElement: !!emailElement,
                firstNameElement: !!firstNameElement,
                lastNameElement: !!lastNameElement,
                phoneElement: !!phoneElement,
                addressElement: !!addressElement,
                createdElement: !!createdElement,
                statusElement: !!statusElement
            });
            
            if (usernameElement) usernameElement.textContent = currentUser.username;
            if (emailElement) emailElement.textContent = currentUser.email;
            if (createdElement) createdElement.textContent = formatDate(currentUser.created_at);
            if (statusElement) statusElement.textContent = currentUser.status ? (currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)) : 'Active';
            
            // Handle profile fields
            if (currentUser.profile) {
                if (firstNameElement) firstNameElement.textContent = currentUser.profile.first_name || '-';
                if (lastNameElement) lastNameElement.textContent = currentUser.profile.last_name || '-';
                if (phoneElement) phoneElement.textContent = currentUser.profile.phone || '-';
                
                // Handle profile image
                const profileImage = document.getElementById('profile-image');
                const profileImagePlaceholder = document.getElementById('profile-image-placeholder');
                
                if (profileImage && profileImagePlaceholder) {
                    if (currentUser.profile.profile_image) {
                        const imageUrl = 'uploads/profiles/' + currentUser.profile.profile_image;
                        
                        // Add onload event to ensure proper display
                        profileImage.onload = function() {
                            profileImage.style.display = 'block';
                            profileImagePlaceholder.style.display = 'none';
                            console.log('Profile image loaded successfully');
                        };
                        
                        // Add onerror event in case image fails to load
                        profileImage.onerror = function() {
                            console.error('Failed to load profile image:', imageUrl);
                            profileImage.style.display = 'none';
                            profileImagePlaceholder.style.display = 'flex';
                        };
                        
                        // Set the image source to trigger loading
                        profileImage.src = imageUrl;
                    } else {
                        // No profile image - show placeholder
                        profileImage.style.display = 'none';
                        profileImagePlaceholder.style.display = 'flex';
                    }
                }
                
                // Handle individual address fields
                const streetElement = document.getElementById('profile-street');
                const cityElement = document.getElementById('profile-city');
                const provinceElement = document.getElementById('profile-province');
                const barangayElement = document.getElementById('profile-barangay');
                
                if (streetElement) streetElement.textContent = currentUser.profile.address?.street || '-';
                if (cityElement) cityElement.textContent = currentUser.profile.address?.city || '-';
                if (provinceElement) provinceElement.textContent = currentUser.profile.address?.province || '-';
                if (barangayElement) barangayElement.textContent = currentUser.profile.address?.barangay || '-';
            } else {
                // If no profile data, show dashes
                if (firstNameElement) firstNameElement.textContent = '-';
                if (lastNameElement) lastNameElement.textContent = '-';
                if (phoneElement) phoneElement.textContent = '-';
                
                // Hide profile image and show placeholder
                const profileImage = document.getElementById('profile-image');
                const profileImagePlaceholder = document.getElementById('profile-image-placeholder');
                
                if (profileImage && profileImagePlaceholder) {
                    profileImage.style.display = 'none';
                    profileImagePlaceholder.style.display = 'flex';
                }
                
                const streetElement = document.getElementById('profile-street');
                const cityElement = document.getElementById('profile-city');
                const provinceElement = document.getElementById('profile-province');
                const barangayElement = document.getElementById('profile-barangay');
                
                if (streetElement) streetElement.textContent = '-';
                if (cityElement) cityElement.textContent = '-';
                if (provinceElement) provinceElement.textContent = '-';
                if (barangayElement) barangayElement.textContent = '-';
            }
            
            // Initialize profile editing functionality
            initProfileEditing();
            
            console.log('Profile elements updated successfully');
        } catch (error) {
            console.error('Error updating profile elements:', error);
        }
        
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

// ==================== CART FUNCTIONALITY ====================

// Cart management functions
function loadCartPage() {
    console.log('Loading cart page...');
    displayCartItems();
    updateCartSummary();
    updateCartCount();
}

// Display cart items on cart page
function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        emptyCartMessage.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartSummary.style.display = 'block';
    
    // Add select all header
    const selectAllHTML = `
        <div class="card mb-3 bg-light">
            <div class="card-body py-2">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <div class="form-check">
                            <input class="form-check-input" 
                                   type="checkbox" 
                                   id="select-all-checkbox">
                            <label class="form-check-label fw-bold" for="select-all-checkbox">
                                Select All Items
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6 text-end">
                        <small class="text-muted">Select items to include in checkout</small>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    cartItemsContainer.innerHTML = selectAllHTML + cart.map(item => createCartItemHTML(item)).join('');
    
    // Add event listeners for cart interactions
    addCartItemEventListeners();
    
    // Add select all checkbox event listener
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            toggleSelectAll(this.checked);
        });
    }
    
    // Update select all checkbox state
    updateSelectAllCheckbox();
}

// Create HTML for individual cart item
function createCartItemHTML(item) {
    const itemTotal = item.price * item.quantity;
    const sizeColorInfo = (item.size || item.color) ? 
        `<p class="text-muted mb-0">
            ${item.size ? `Size: ${item.size}` : ''}${item.size && item.color ? ', ' : ''}${item.color ? `Color: ${item.color}` : ''}
        </p>` : '';
    
    // Check if item is selected (default to true for new items)
    const isSelected = item.selected !== false;
    
    return `
        <div class="card mb-3 cart-item" data-item-id="${item.uniqueId || item.id}">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-1">
                        <div class="form-check">
                            <input class="form-check-input item-checkbox" 
                                   type="checkbox" 
                                   ${isSelected ? 'checked' : ''}
                                   data-item-id="${item.uniqueId || item.id}"
                                   id="checkbox-${item.uniqueId || item.id}">
                            <label class="form-check-label" for="checkbox-${item.uniqueId || item.id}"></label>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <img src="${item.image}" class="img-fluid rounded" alt="${item.name}">
                    </div>
                    <div class="col-md-3">
                        <h6 class="card-title mb-1">${item.name}</h6>
                        ${sizeColorInfo}
                        <p class="text-primary mb-0">₱${formatPriceWithCommas(item.price)}</p>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                    data-action="decrease" 
                                    data-item-id="${item.uniqueId || item.id}">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="mx-3 quantity-display">${item.quantity}</span>
                            <button class="btn btn-outline-secondary btn-sm quantity-btn" 
                                    data-action="increase" 
                                    data-item-id="${item.uniqueId || item.id}">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <p class="mb-0 fw-bold">₱${formatPriceWithCommas(itemTotal)}</p>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-danger btn-sm remove-item-btn" 
                                data-item-id="${item.uniqueId || item.id}"
                                title="Remove item">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add event listeners for cart item interactions
function addCartItemEventListeners() {
    // Quantity change buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.itemId;
            const action = this.dataset.action;
            updateCartItemQuantity(itemId, action);
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.dataset.itemId;
            removeCartItem(itemId);
        });
    });
    
    // Item selection checkboxes
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const itemId = this.dataset.itemId;
            updateItemSelection(itemId, this.checked);
        });
    });
}

// Update item quantity in cart
function updateCartItemQuantity(itemId, action) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemIndex = cart.findIndex(item => (item.uniqueId || item.id) === itemId);
    
    if (itemIndex > -1) {
        if (action === 'increase') {
            cart[itemIndex].quantity += 1;
        } else if (action === 'decrease') {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                // Remove item if quantity becomes 0
                cart.splice(itemIndex, 1);
            }
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
        updateCartCount();
    }
}

// Remove item from cart
function removeCartItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemIndex = cart.findIndex(item => (item.uniqueId || item.id) === itemId);
    
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartSummary();
        updateCartCount();
        
        // Show removal toast
        showCartUpdateToast('Item removed from cart');
    }
}

// Update item selection status
function updateItemSelection(itemId, isSelected) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemIndex = cart.findIndex(item => (item.uniqueId || item.id) === itemId);
    
    if (itemIndex > -1) {
        cart[itemIndex].selected = isSelected;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartSummary();
        updateSelectAllCheckbox();
    }
}

// Update cart summary (totals, shipping, etc.) - only for selected items
function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const selectedItems = cart.filter(item => item.selected !== false);
    
    const totalItems = selectedItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 2000 ? 0 : (subtotal > 0 ? 150 : 0); // Free shipping for orders over ₱2000, no shipping if no items selected
    const total = subtotal + shipping;
    
    // Update summary display
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('subtotal').textContent = `₱${formatPriceWithCommas(subtotal)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₱${formatPriceWithCommas(shipping)}`;
    document.getElementById('total-price').textContent = `₱${formatPriceWithCommas(total)}`;
    
    // Enable/disable checkout button based on selected items
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = selectedItems.length === 0;
    }
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const selectedItems = cart.filter(item => item.selected !== false);
        
        if (cart.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedItems.length === cart.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (selectedItems.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// Toggle selection of all items
function toggleSelectAll(selectAll) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart.forEach(item => {
        item.selected = selectAll;
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update all checkboxes
    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    
    updateCartSummary();
}

// Remove selected items from cart (used after successful checkout)
function removeSelectedItems() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Filter out selected items, keeping only unselected ones
    cart = cart.filter(item => item.selected === false);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Clear entire cart
function clearCart() {
    localStorage.removeItem('cart');
    displayCartItems();
    updateCartSummary();
    updateCartCount();
    showCartUpdateToast('Cart cleared');
}

// Show cart update toast notification
function showCartUpdateToast(message) {
    // Create toast HTML if it doesn't exist
    if (!document.getElementById('cartUpdateToast')) {
        const toastHTML = `
            <div class="toast-container position-fixed top-0 end-0 p-3">
                <div id="cartUpdateToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <i class="bi bi-cart-check text-success me-2"></i>
                        <strong class="me-auto">Cart Update</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body" id="cartUpdateToastBody">
                        ${message}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHTML);
    }
    
    // Update message and show toast
    document.getElementById('cartUpdateToastBody').textContent = message;
    const toast = new bootstrap.Toast(document.getElementById('cartUpdateToast'));
    toast.show();
}

// Get cart total for checkout
function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= 2000 ? 0 : 150;
    return subtotal + shipping;
}

// Get cart items for checkout (only selected items)
function getCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.filter(item => item.selected !== false);
}

// Get all cart items (including unselected ones)
function getAllCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Initialize cart page functionality
function initializeCartPage() {
    // Check if we're on the cart page
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
        
        // Add checkout button event listener
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                if (!this.disabled) {
                    window.location.href = 'checkout.html';
                }
            });
        }
    }
}

// ==================== END CART FUNCTIONALITY ====================

// ==================== CHECKOUT FUNCTIONALITY ====================

// Checkout page functionality
function initializeCheckoutPage() {
    console.log('Initializing checkout page...');
    
    const checkoutForm = document.getElementById('checkout-form');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const cardDetailsSection = document.getElementById('card-details');
    const emptyCartWarning = document.getElementById('empty-cart-warning');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    if (checkoutForm) {
        // Check if cart is empty
        const cart = getCartItems();
        if (cart.length === 0) {
            if (emptyCartWarning) emptyCartWarning.classList.remove('d-none');
            if (placeOrderBtn) placeOrderBtn.disabled = true;
            checkoutForm.style.opacity = '0.5';
        } else {
            if (emptyCartWarning) emptyCartWarning.classList.add('d-none');
            if (placeOrderBtn) placeOrderBtn.disabled = false;
            checkoutForm.style.opacity = '1';
        }
        
        // Load order summary
        loadOrderSummary();
        
        // Pre-fill form if user is logged in (with a small delay to ensure form is ready)
        setTimeout(() => {
            prefillFormFromProfile();
        }, 100);
        
        // Handle payment method change
        if (paymentMethodSelect) {
            paymentMethodSelect.addEventListener('change', function() {
                if (this.value === 'credit_card' || this.value === 'debit_card') {
                    cardDetailsSection.style.display = 'block';
                    makeCardFieldsRequired(true);
                } else {
                    cardDetailsSection.style.display = 'none';
                    makeCardFieldsRequired(false);
                }
            });
        }
        
        // Handle form submission
        console.log('Adding form submission event listener');
        checkoutForm.addEventListener('submit', function(e) {
            console.log('Form submission event triggered');
            e.preventDefault();
            handleOrderSubmission();
        });
        
        // Format card number input
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }
        
        // Format expiry date input
        const expiryInput = document.getElementById('expiryDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }
        
        // Format CVV input
        const cvvInput = document.getElementById('cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
            });
        }
    }
}

// Load order summary from cart
function loadOrderSummary() {
    const cart = getCartItems();
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('order-subtotal');
    const shippingElement = document.getElementById('order-shipping');
    const totalElement = document.getElementById('order-total');
    
    if (!orderItemsContainer) return;
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p class="text-dark">Your cart is empty</p>';
        if (subtotalElement) subtotalElement.textContent = '₱0.00';
        if (shippingElement) shippingElement.textContent = '₱0.00';
        if (totalElement) totalElement.textContent = '₱0.00';
        return;
    }
    
    let subtotal = 0;
    
    // Display each cart item with image
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        // Handle missing image
        const itemImage = item.image || 'images/classic-graphic-tee.webp';
        
        const itemElement = document.createElement('div');
        itemElement.className = 'd-flex align-items-center mb-3 p-2 border rounded';
        itemElement.innerHTML = `
            <div class="me-3">
                <img src="${itemImage}" alt="${item.name}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" 
                     onerror="this.src='images/classic-graphic-tee.webp'">
            </div>
            <div class="flex-grow-1">
                <h6 class="mb-1 text-dark">${item.name}</h6>
                <div class="d-flex align-items-center small" style="color: #333;">
                    <span class="me-2">Qty: ${item.quantity}</span>
                    ${item.quantity > 1 ? `<span style="color: #666;">× ₱${item.price.toFixed(2)}</span>` : ''}
                </div>
                ${item.size ? `<small class="d-block" style="color: #666;">Size: ${item.size}</small>` : ''}
                ${item.color ? `<small class="d-block" style="color: #666;">Color: ${item.color}</small>` : ''}
            </div>
            <div class="text-end">
                <span class="fw-bold text-dark">₱${itemTotal.toFixed(2)}</span>
                ${item.quantity === 1 ? `<br><small style="color: #666;">₱${item.price.toFixed(2)}</small>` : ''}
            </div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
    
    // Calculate shipping
    const shipping = subtotal >= 2000 ? 0 : 150;
    const total = subtotal + shipping;
    
    // Update totals
    if (subtotalElement) subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
    if (shippingElement) {
        shippingElement.textContent = `₱${shipping.toFixed(2)}`;
        shippingElement.className = shipping === 0 ? 'text-success' : '';
    }
    if (totalElement) totalElement.textContent = `₱${total.toFixed(2)}`;
}

// Pre-fill form with user profile data if logged in
function prefillFormFromProfile() {
    console.log('Prefilling form with profile data...');
    console.log('Current user:', currentUser);
    console.log('Is logged in:', isLoggedIn);
    
    if (!isLoggedIn || !currentUser) {
        console.log('User not logged in or currentUser is null');
        return;
    }
    
    let hasFilledData = false;
    
    try {
        const profile = currentUser.profile;
        console.log('User profile:', profile);
        
        // Fill personal information
        if (profile?.first_name) {
            const firstNameField = document.getElementById('firstName');
            if (firstNameField) {
                firstNameField.value = profile.first_name;
                hasFilledData = true;
                console.log('Set firstName:', profile.first_name);
            }
        }
        
        if (profile?.last_name) {
            const lastNameField = document.getElementById('lastName');
            if (lastNameField) {
                lastNameField.value = profile.last_name;
                hasFilledData = true;
                console.log('Set lastName:', profile.last_name);
            }
        }
        
        if (currentUser.email) {
            const emailField = document.getElementById('email');
            if (emailField) {
                emailField.value = currentUser.email;
                hasFilledData = true;
                console.log('Set email:', currentUser.email);
            }
        }
        
        if (profile?.phone) {
            const phoneField = document.getElementById('phone');
            if (phoneField) {
                phoneField.value = profile.phone;
                hasFilledData = true;
                console.log('Set phone:', profile.phone);
            }
        }
        
        // Fill address information
        if (profile?.address) {
            const address = profile.address;
            console.log('Address data:', address);
            
            if (address.street) {
                const addressField = document.getElementById('address');
                if (addressField) {
                    addressField.value = address.street;
                    hasFilledData = true;
                    console.log('Set address:', address.street);
                }
            }
            
            if (address.city) {
                const cityField = document.getElementById('city');
                if (cityField) {
                    cityField.value = address.city;
                    hasFilledData = true;
                    console.log('Set city:', address.city);
                }
            }
            
            if (address.province) {
                const stateField = document.getElementById('state');
                if (stateField) {
                    stateField.value = address.province;
                    hasFilledData = true;
                    console.log('Set state/province:', address.province);
                }
            }
            
            if (address.barangay) {
                const zipField = document.getElementById('zipCode');
                if (zipField) {
                    zipField.value = address.barangay;
                    hasFilledData = true;
                    console.log('Set barangay:', address.barangay);
                }
            }
        }
        
        // Show notification if data was filled
        if (hasFilledData) {
            const notification = document.getElementById('autofill-notification');
            if (notification) {
                notification.classList.remove('d-none');
                // Hide notification after 5 seconds
                setTimeout(() => {
                    notification.classList.add('d-none');
                }, 5000);
            }
        }
        
        console.log('Form prefill completed successfully');
    } catch (error) {
        console.error('Error prefilling form:', error);
    }
}

// Make card fields required or optional
function makeCardFieldsRequired(required) {
    const cardFields = ['cardNumber', 'expiryDate', 'cvv'];
    cardFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (required) {
                field.setAttribute('required', 'required');
            } else {
                field.removeAttribute('required');
            }
        }
    });
}

// Handle order submission
function handleOrderSubmission() {
    console.log('handleOrderSubmission called');
    
    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('place-order-btn');
    
    console.log('Form element:', form);
    console.log('Submit button:', submitBtn);
    
    // Validate form
    if (!form.checkValidity()) {
        console.log('Form validation failed');
        form.classList.add('was-validated');
        return;
    }
    
    console.log('Form validation passed');
    
    // Get cart items
    const cartItems = getCartItems();
    console.log('Cart items:', cartItems);
    
    if (cartItems.length === 0) {
        console.log('Cart is empty');
        showToast('Your cart is empty', 'error');
        return;
    }
    
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 2000 ? 0 : 150;
    const total = subtotal + shipping;
    
    // Prepare order data
    const orderData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        paymentMethod: document.getElementById('paymentMethod').value,
        orderNotes: document.getElementById('orderNotes').value.trim(),
        cartItems: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        total: total
    };
    
    // Add card details if payment method requires it
    if (orderData.paymentMethod === 'credit_card' || orderData.paymentMethod === 'debit_card') {
        orderData.cardNumber = document.getElementById('cardNumber').value.trim();
        orderData.expiryDate = document.getElementById('expiryDate').value.trim();
        orderData.cvv = document.getElementById('cvv').value.trim();
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Order...';
    
    // Submit order
    console.log('Submitting order data:', orderData);
    
    fetch('php/submit_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Try to parse as JSON
        return response.json();
    })
    .then(data => {
        console.log('Order submission response:', data);
        if (data.success) {
            // Store cart items for thank you page before removing them
            localStorage.setItem('orderItems', JSON.stringify(cartItems));
            
            // Remove only selected items from cart
            removeSelectedItems();
            
            // Store order details for thank you page
            localStorage.setItem('lastOrder', JSON.stringify(data.data));
            
            // Show success message
            showToast('Order placed successfully!', 'success');
            
            // Redirect to thank you page with order ID
            setTimeout(() => {
                window.location.href = `thankyou.html?orderId=${data.data.orderId}`;
            }, 1000);
        } else {
            console.error('Order submission failed:', data.message);
            showToast(data.message || 'Failed to place order. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting order:', error);
        
        // More detailed error handling
        if (error.message.includes('HTTP error')) {
            showToast('Server error occurred. Please check if the server is running and try again.', 'error');
        } else if (error.message.includes('Failed to fetch')) {
            showToast('Network error. Please check your connection and try again.', 'error');
        } else {
            showToast('An error occurred while placing your order. Please try again.', 'error');
        }
    })
    .finally(() => {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-credit-card me-2"></i>Place Order';
    });
}

// Validate card number (basic Luhn algorithm)
function validateCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(cleanNumber)) return false;
    
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber.charAt(i));
        
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
}

// Validate expiry date
function validateExpiryDate(expiryDate) {
    const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]);
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }
    
    return true;
}

// ==================== THANK YOU PAGE FUNCTIONALITY ====================

// Thank you page functionality
function initializeThankYouPage() {
    const lastOrder = localStorage.getItem('lastOrder');
    
    if (lastOrder) {
        const orderData = JSON.parse(lastOrder);
        displayOrderConfirmation(orderData);
        
        // Clear the stored order data
        localStorage.removeItem('lastOrder');
    } else {
        // If no order data, redirect to home
        window.location.href = 'index.html';
    }
}

// Display order confirmation details
function displayOrderConfirmation(orderData) {
    const orderIdElement = document.getElementById('order-id');
    const orderDateElement = document.getElementById('order-date');
    const orderTotalElement = document.getElementById('order-total');
    
    if (orderIdElement) orderIdElement.textContent = orderData.orderId;
    if (orderDateElement) orderDateElement.textContent = new Date(orderData.orderDate).toLocaleDateString();
    if (orderTotalElement) orderTotalElement.textContent = `₱${orderData.total.toFixed(2)}`;
}

// Initialize checkout functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Current page:', currentPage);
    
    if (currentPage === 'checkout.html') {
        console.log('Initializing checkout page');
        // Wait for authentication check to complete before initializing checkout
        checkAuthenticationState().then(() => {
            console.log('Authentication check completed, initializing checkout');
            initializeCheckoutPage();
        });
    } else if (currentPage === 'thankyou.html') {
        initializeThankYouPage();
    }
});

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
    
    // Initialize cart page functionality
    initializeCartPage();
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

// Profile editing functionality
function initProfileEditing() {
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', enableProfileEditing);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfileChanges);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelProfileEditing);
    }
    
    // Add image upload functionality
    const profileImageInput = document.getElementById('profile-image-input');
    if (profileImageInput) {
        profileImageInput.addEventListener('change', handleProfileImageUpload);
    }
}

function enableProfileEditing() {
    // Hide display elements and show edit inputs
    document.querySelectorAll('.profile-display').forEach(element => {
        element.classList.add('d-none');
    });
    
    document.querySelectorAll('.profile-edit').forEach(element => {
        element.classList.remove('d-none');
    });
    
    // Populate edit fields with current values
    if (currentUser.profile) {
        document.getElementById('edit-first-name').value = currentUser.profile.first_name || '';
        document.getElementById('edit-last-name').value = currentUser.profile.last_name || '';
        document.getElementById('edit-phone').value = currentUser.profile.phone || '';
        
        if (currentUser.profile.address) {
            document.getElementById('edit-street').value = currentUser.profile.address.street || '';
            document.getElementById('edit-city').value = currentUser.profile.address.city || '';
            document.getElementById('edit-province').value = currentUser.profile.address.province || '';
            document.getElementById('edit-barangay').value = currentUser.profile.address.barangay || '';
        }
    }
    
    // Toggle buttons
    document.getElementById('edit-profile-btn').classList.add('d-none');
    document.getElementById('save-profile-btn').classList.remove('d-none');
    document.getElementById('cancel-edit-btn').classList.remove('d-none');
}

function cancelProfileEditing() {
    console.log('cancelProfileEditing called');
    
    // Show display elements and hide edit inputs
    document.querySelectorAll('.profile-display').forEach(element => {
        element.classList.remove('d-none');
    });
    
    document.querySelectorAll('.profile-edit').forEach(element => {
        console.log('Hiding profile-edit element:', element);
        element.classList.add('d-none');
    });
    
    // Specifically hide camera overlay
    const cameraOverlay = document.querySelector('.profile-image-container .profile-edit');
    if (cameraOverlay) {
        cameraOverlay.classList.add('d-none');
        console.log('Camera overlay hidden');
    }
    
    // Toggle buttons
    document.getElementById('edit-profile-btn').classList.remove('d-none');
    document.getElementById('save-profile-btn').classList.add('d-none');
    document.getElementById('cancel-edit-btn').classList.add('d-none');
}

function saveProfileChanges() {
    const saveBtn = document.getElementById('save-profile-btn');
    const originalText = saveBtn.innerHTML;
    
    // Show loading state
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
    saveBtn.disabled = true;
    
    // Collect form data
    const profileData = {
        first_name: document.getElementById('edit-first-name').value.trim(),
        last_name: document.getElementById('edit-last-name').value.trim(),
        phone: document.getElementById('edit-phone').value.trim(),
        address: {
            street: document.getElementById('edit-street').value.trim(),
            city: document.getElementById('edit-city').value.trim(),
            province: document.getElementById('edit-province').value.trim(),
            barangay: document.getElementById('edit-barangay').value.trim()
        }
    };
    
    // Send update request
    fetch('php/update_profile.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update current user data
            currentUser.profile = profileData;
            
            // Update display elements
            updateProfileDisplay();
            
            // Exit edit mode
            cancelProfileEditing();
            
            // Show success message
            showProfileUpdateSuccess('Profile updated successfully!');
        } else {
            showProfileUpdateError(data.message || 'Failed to update profile');
        }
    })
    .catch(error => {
        console.error('Profile update error:', error);
        showProfileUpdateError('An error occurred while updating your profile');
    })
    .finally(() => {
        // Reset button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    });
}

// Profile image upload functionality
function handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showProfileUpdateError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showProfileUpdateError('File too large. Maximum size is 5MB.');
        return;
    }
    
    // Show immediate preview using FileReader for instant feedback
    const reader = new FileReader();
    reader.onload = function(e) {
        const profileImage = document.getElementById('profile-image');
        const profileImagePlaceholder = document.getElementById('profile-image-placeholder');
        
        if (profileImage && profileImagePlaceholder) {
            // Show preview immediately
            profileImage.src = e.target.result;
            profileImage.style.display = 'block';
            profileImagePlaceholder.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
    
    // Show loading state on upload button
    const uploadButton = document.querySelector('button[onclick*="profile-image-input"]');
    if (uploadButton) {
        uploadButton.innerHTML = '<div class="spinner-border spinner-border-sm text-white" style="width: 16px; height: 16px;"></div>';
        uploadButton.disabled = true;
    }
    
    // Create FormData for upload
    const formData = new FormData();
    formData.append('profile_image', file);
    
    // Upload image with faster response handling
    fetch('php/upload_profile_image.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
    .then(response => {
        console.log('Upload response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Upload response data:', data);
        if (data.success) {
            // Update current user data immediately (no server refresh needed)
            if (!currentUser.profile) {
                currentUser.profile = {};
            }
            // The response structure is: data.data.image_url
            const imageUrl = data.data?.image_url || '';
            if (imageUrl) {
                currentUser.profile.profile_image = imageUrl.split('/').pop(); // Extract filename
                
                // Update the preview with the actual uploaded image URL
                const profileImage = document.getElementById('profile-image');
                if (profileImage) {
                    profileImage.src = imageUrl;
                }
            }
            
            // Exit edit mode immediately
            cancelProfileEditing();
            
            // Update navigation to show new profile picture
            updateNavigationForLoggedInUser();
            
            // Show success message
            showProfileUpdateSuccess('Profile image updated successfully!');
        } else {
            showProfileUpdateError(data.message || 'Failed to upload image');
        }
    })
    .catch(error => {
        console.error('Image upload error:', error);
        showProfileUpdateError('An error occurred while uploading the image: ' + error.message);
        
        // Restore placeholder on error
        const profileImage = document.getElementById('profile-image');
        const profileImagePlaceholder = document.getElementById('profile-image-placeholder');
        if (profileImage && profileImagePlaceholder) {
            profileImage.style.display = 'none';
            profileImagePlaceholder.style.display = 'flex';
        }
    })
    .finally(() => {
        // Reset button state
        if (uploadButton) {
            uploadButton.innerHTML = '<i class="bi bi-camera text-white"></i>';
            uploadButton.disabled = false;
        }
        
        // Clear file input
        event.target.value = '';
    });
}

// Update profile display after changes
function updateProfileDisplay() {
    // Update profile image
    const profileImage = document.getElementById('profile-image');
    const profileImagePlaceholder = document.getElementById('profile-image-placeholder');
    
    if (profileImage && profileImagePlaceholder) {
        if (currentUser.profile?.profile_image) {
            const imageUrl = 'uploads/profiles/' + currentUser.profile.profile_image;
            
            // Add onload event to ensure proper display
            profileImage.onload = function() {
                profileImage.style.display = 'block';
                profileImagePlaceholder.style.display = 'none';
                console.log('Profile image loaded and displayed');
            };
            
            // Add onerror event in case image fails to load
            profileImage.onerror = function() {
                console.error('Failed to load profile image:', imageUrl);
                profileImage.style.display = 'none';
                profileImagePlaceholder.style.display = 'flex';
            };
            
            // Force hide placeholder immediately and show image
            profileImagePlaceholder.style.display = 'none';
            profileImage.style.display = 'block';
            profileImage.src = imageUrl;
        } else {
            profileImage.style.display = 'none';
            profileImagePlaceholder.style.display = 'flex';
        }
    }
    
    // Update other profile fields
    const firstNameElement = document.getElementById('profile-first-name');
    const lastNameElement = document.getElementById('profile-last-name');
    const phoneElement = document.getElementById('profile-phone');
    
    if (firstNameElement) firstNameElement.textContent = currentUser.profile?.first_name || '-';
    if (lastNameElement) lastNameElement.textContent = currentUser.profile?.last_name || '-';
    if (phoneElement) phoneElement.textContent = currentUser.profile?.phone || '-';
    
    // Update address fields
    const streetElement = document.getElementById('profile-street');
    const cityElement = document.getElementById('profile-city');
    const provinceElement = document.getElementById('profile-province');
    const barangayElement = document.getElementById('profile-barangay');
    
    if (streetElement) streetElement.textContent = currentUser.profile?.address?.street || '-';
    if (cityElement) cityElement.textContent = currentUser.profile?.address?.city || '-';
    if (provinceElement) provinceElement.textContent = currentUser.profile?.address?.province || '-';
    if (barangayElement) barangayElement.textContent = currentUser.profile?.address?.barangay || '-';
}

// Success and error message for profile update
function showProfileUpdateSuccess(message) {
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

function showProfileUpdateError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Force refresh current user data from server
function refreshCurrentUserData() {
    return fetch('php/check_session.php', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.user) {
            currentUser = data.user;
            console.log('Current user data refreshed:', currentUser);
            return true;
        }
        return false;
    })
    .catch(error => {
        console.error('Error refreshing user data:', error);
        return false;
    });
}

// General toast notification function
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    // Show toast
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}
