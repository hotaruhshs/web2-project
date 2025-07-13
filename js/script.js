// Main JavaScript for Clothing Shop Project

// Global variables
let allProducts = [];
let filteredProducts = [];

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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
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
