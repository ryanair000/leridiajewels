/* =============================================
   Leridia Jewels - Inventory Management System
   JavaScript Application Logic
   ============================================= */

// Product Types by Category
const productTypes = {
    'Earrings': ['Studs', 'Hoops', 'Drop', 'Huggie', 'Statement', 'Fashion'],
    'Necklaces': [
        'Statement', 'Pendant', 'Beaded', 'Layered', 
        'Choker (14–16 in)', 'Collar', 'Princess necklace (18 in)', 
        'Matinee necklace (20–24 in)', 'Opera necklace (28–36 in)', 
        'Rope / Lariat necklace (36+ in)'
    ],
    'Rings': [
        'Fashion rings', 'Promise rings', 'Signet rings', 'Cocktail rings', 
        'Birthstone rings', 'Solitaire ring', 'Halo ring', 'Cluster ring', 
        'Minimalist ring', 'Vintage / Antique ring', 'Geometric ring', 
        'Adjustable ring', "Men's signet ring", "Statement men's ring", 'Band rings'
    ],
    'Bracelets/Bangles': [
        'Bangle bracelets', 'Cuff bracelets', 'Chain bracelets',
        'Plain metal bangle', 'Textured bangle', 'Stacked bangles',
        'Open cuff bracelet', 'Statement cuff bracelet', 'Chunky bracelet',
        'Sculptural bracelet', 'Wide cuff bracelet', 'Multi-layer bracelet',
        "Leather men's bracelet", "Chain men's bracelet", "Beaded men's bracelet",
        "Cuff men's bracelet", 'Tennis bracelet', 'Rigid bangles', 'Open bangles',
        'Hinged bangles', 'Adjustable bangles', 'Cuff-style bangles', 'Oval bangles',
        'Flat bangles', 'Plain / minimalist bangles', 'Textured bangles',
        'Twisted / rope bangles', 'Stackable bangles', 'Statement bangles',
        'Chunky bangles', 'Slim bangles', 'Geometric bangles'
    ],
    'Anklets': ['Chain anklet', 'Beaded anklet', 'Charm anklet', 'Layered anklet'],
    'Accessories': [
        'Hair pins', 'Hair clips', 'Hair combs', 'Bag charms', 'Keychain charms',
        'Phone charms', 'Bracelet/necklace add-on charms', 'Ring boxes',
        'Earring boxes', 'Necklace boxes', 'Bracelet/bangle boxes',
        'Multi-slot jewelry boxes', 'Travel jewelry cases', 'Gift bags',
        'Satin pouches', 'Thank-you cards', 'Branded stickers/tags'
    ]
};

// Category Icons
const categoryIcons = {
    'Earrings': 'fa-star',
    'Necklaces': 'fa-link',
    'Rings': 'fa-ring',
    'Bracelets/Bangles': 'fa-circle-notch',
    'Anklets': 'fa-ankh',
    'Accessories': 'fa-gift'
};

// Initialize products from localStorage or empty array
let products = JSON.parse(localStorage.getItem('leridiaProducts')) || [];

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupFilters();
    populateCategoryFilter();
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
    setupSearch();
}

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

// Show Section
function showSection(sectionId) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Setup Filters
function setupFilters() {
    const filters = ['filterCategory', 'filterQuality', 'filterSize', 'filterStock'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', filterProducts);
        }
    });
}

// Populate Category Filter
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('filterCategory');
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    Object.keys(productTypes).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Search Setup
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterProducts(searchTerm);
    });
}

// Update Type Options based on Category
function updateTypeOptions() {
    const category = document.getElementById('productCategory').value;
    const typeSelect = document.getElementById('productType');
    
    typeSelect.innerHTML = '<option value="">Select Type</option>';
    
    if (category && productTypes[category]) {
        productTypes[category].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
    }
}

// Generate SKU
function generateSKU(category, type) {
    const prefix = category.substring(0, 2).toUpperCase();
    const typePrefix = type.substring(0, 2).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LJ-${prefix}${typePrefix}-${random}`;
}

// Open Add Product Modal
function openAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productType').innerHTML = '<option value="">Select Type</option>';
    document.getElementById('productModal').classList.add('active');
}

// Open Edit Product Modal
function openEditProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productSKU').value = product.sku;
    document.getElementById('productCategory').value = product.category;
    
    // Update type options and set value
    updateTypeOptions();
    document.getElementById('productType').value = product.type;
    
    document.getElementById('productSize').value = product.size || '';
    document.getElementById('productQuality').value = product.quality;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('localPrice').value = product.localPrice;
    document.getElementById('localSelling').value = product.localSelling;
    document.getElementById('abroadPrice').value = product.abroadPrice;
    document.getElementById('abroadSelling').value = product.abroadSelling;
    document.getElementById('productDescription').value = product.description || '';
    
    document.getElementById('productModal').classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

// Save Product
function saveProduct(e) {
    e.preventDefault();
    
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const productId = document.getElementById('productId').value;
    const category = document.getElementById('productCategory').value;
    const type = document.getElementById('productType').value;
    
    const productData = {
        id: productId || Date.now().toString(),
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSKU').value || generateSKU(category, type),
        category: category,
        type: type,
        size: document.getElementById('productSize').value,
        quality: document.getElementById('productQuality').value,
        stock: parseInt(document.getElementById('productStock').value),
        localPrice: parseFloat(document.getElementById('localPrice').value),
        localSelling: parseFloat(document.getElementById('localSelling').value),
        abroadPrice: parseFloat(document.getElementById('abroadPrice').value),
        abroadSelling: parseFloat(document.getElementById('abroadSelling').value),
        description: document.getElementById('productDescription').value,
        createdAt: productId ? products.find(p => p.id === productId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = productData;
        }
        showToast('Product updated successfully!');
    } else {
        // Add new product
        products.unshift(productData);
        showToast('Product added successfully!');
    }
    
    saveToLocalStorage();
    closeModal();
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
}

// Delete Product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveToLocalStorage();
        updateDashboard();
        renderProducts();
        renderInventory();
        renderPricing();
        showToast('Product deleted successfully!');
    }
}

// Open Stock Modal
function openStockModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('stockProductId').value = product.id;
    document.getElementById('stockProductName').textContent = product.name;
    document.getElementById('newStock').value = product.stock;
    document.getElementById('stockModal').classList.add('active');
}

// Close Stock Modal
function closeStockModal() {
    document.getElementById('stockModal').classList.remove('active');
}

// Update Stock
function updateStock(e) {
    e.preventDefault();
    
    const productId = document.getElementById('stockProductId').value;
    const newStock = parseInt(document.getElementById('newStock').value);
    
    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock = newStock;
        product.updatedAt = new Date().toISOString();
        saveToLocalStorage();
        updateDashboard();
        renderProducts();
        renderInventory();
        showToast('Stock updated successfully!');
    }
    
    closeStockModal();
}

// Save to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('leridiaProducts', JSON.stringify(products));
}

// Update Dashboard
function updateDashboard() {
    // Total products
    document.getElementById('totalProducts').textContent = products.length;
    
    // Low stock (<=10)
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    document.getElementById('lowStock').textContent = lowStock;
    
    // In stock
    const inStock = products.filter(p => p.stock > 0).length;
    document.getElementById('inStock').textContent = inStock;
    
    // Recent products table
    renderRecentProducts();
    
    // Category overview
    renderCategoryOverview();
}

// Render Recent Products
function renderRecentProducts() {
    const tbody = document.getElementById('recentProductsTable');
    const recentProducts = products.slice(0, 5);
    
    if (recentProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No products yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentProducts.map(product => `
        <tr>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td><span class="stock-badge ${getStockStatus(product.stock)}">${product.stock}</span></td>
            <td class="price">KSH ${product.localSelling.toFixed(2)}</td>
            <td class="price">KSH ${product.abroadSelling.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Render Category Overview
function renderCategoryOverview() {
    const container = document.getElementById('categoryOverview');
    const categories = Object.keys(productTypes);
    
    container.innerHTML = categories.map(category => {
        const count = products.filter(p => p.category === category).length;
        const icon = categoryIcons[category] || 'fa-tag';
        
        return `
            <div class="category-item">
                <div class="category-item-info">
                    <div class="category-item-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <span class="category-item-name">${category}</span>
                </div>
                <span class="category-item-count">${count}</span>
            </div>
        `;
    }).join('');
}

// Render Products Table
function renderProducts(filteredProducts = null) {
    const tbody = document.getElementById('productsTable');
    const productList = filteredProducts || products;
    
    if (productList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h4>No products found</h4>
                    <p>Add your first product to get started</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productList.map(product => `
        <tr>
            <td><strong>${product.name}</strong><br><small style="color: #9B9B9B;">${product.sku}</small></td>
            <td>${product.category}</td>
            <td>${product.type}</td>
            <td>${product.size || '-'}</td>
            <td>${product.quality}</td>
            <td><span class="stock-badge ${getStockStatus(product.stock)}">${product.stock}</span></td>
            <td class="price">KSH ${product.localPrice.toFixed(2)}</td>
            <td class="price">KSH ${product.localSelling.toFixed(2)}</td>
            <td class="price">KSH ${product.abroadPrice.toFixed(2)}</td>
            <td class="price">KSH ${product.abroadSelling.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="openEditProductModal('${product.id}')" title="Edit">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render Inventory Table
function renderInventory() {
    const tbody = document.getElementById('inventoryTable');
    
    // Update inventory stats
    const inStock = products.filter(p => p.stock > 10).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    document.getElementById('invInStock').textContent = inStock;
    document.getElementById('invLowStock').textContent = lowStock;
    document.getElementById('invOutStock').textContent = outOfStock;
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-warehouse"></i>
                    <h4>No inventory items</h4>
                    <p>Add products to manage inventory</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by stock (lowest first)
    const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
    
    tbody.innerHTML = sortedProducts.map(product => `
        <tr>
            <td><strong>${product.name}</strong></td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td><strong>${product.stock}</strong></td>
            <td><span class="stock-badge ${getStockStatus(product.stock)}">${getStockLabel(product.stock)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn stock" onclick="openStockModal('${product.id}')" title="Update Stock">
                        <i class="fas fa-boxes"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render Pricing Table
function renderPricing() {
    const tbody = document.getElementById('pricingTable');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-dollar-sign"></i>
                    <h4>No pricing data</h4>
                    <p>Add products to manage pricing</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        const localMargin = ((product.localSelling - product.localPrice) / product.localPrice * 100).toFixed(1);
        const abroadMargin = ((product.abroadSelling - product.abroadPrice) / product.abroadPrice * 100).toFixed(1);
        
        return `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.category}</td>
                <td class="price">KSH ${product.localPrice.toFixed(2)}</td>
                <td class="price">KSH ${product.localSelling.toFixed(2)}</td>
                <td class="${parseFloat(localMargin) >= 0 ? 'margin-positive' : 'margin-negative'}">${localMargin}%</td>
                <td class="price">KSH ${product.abroadPrice.toFixed(2)}</td>
                <td class="price">KSH ${product.abroadSelling.toFixed(2)}</td>
                <td class="${parseFloat(abroadMargin) >= 0 ? 'margin-positive' : 'margin-negative'}">${abroadMargin}%</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="openEditProductModal('${product.id}')" title="Edit Pricing">
                            <i class="fas fa-pen"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter Products
function filterProducts(searchTerm = '') {
    const category = document.getElementById('filterCategory').value;
    const quality = document.getElementById('filterQuality').value;
    const size = document.getElementById('filterSize').value;
    const stockFilter = document.getElementById('filterStock').value;
    const search = typeof searchTerm === 'string' ? searchTerm : document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = products.filter(product => {
        let match = true;
        
        if (category && product.category !== category) match = false;
        if (quality && product.quality !== quality) match = false;
        if (size && product.size !== size) match = false;
        
        if (stockFilter) {
            if (stockFilter === 'in-stock' && product.stock <= 10) match = false;
            if (stockFilter === 'low-stock' && (product.stock === 0 || product.stock > 10)) match = false;
            if (stockFilter === 'out-of-stock' && product.stock !== 0) match = false;
        }
        
        if (search) {
            const searchMatch = 
                product.name.toLowerCase().includes(search) ||
                product.sku.toLowerCase().includes(search) ||
                product.category.toLowerCase().includes(search) ||
                product.type.toLowerCase().includes(search);
            if (!searchMatch) match = false;
        }
        
        return match;
    });
    
    renderProducts(filtered);
}

// Get Stock Status Class
function getStockStatus(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
}

// Get Stock Label
function getStockLabel(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
}

// Show Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Export Inventory
function exportInventory() {
    if (products.length === 0) {
        showToast('No products to export');
        return;
    }
    
    const headers = ['Name', 'SKU', 'Category', 'Type', 'Size', 'Quality', 'Stock', 'Local Price', 'Local Selling', 'Abroad Price', 'Abroad Selling'];
    const csvContent = [
        headers.join(','),
        ...products.map(p => [
            `"${p.name}"`,
            p.sku,
            p.category,
            `"${p.type}"`,
            p.size || '',
            p.quality,
            p.stock,
            p.localPrice,
            p.localSelling,
            p.abroadPrice,
            p.abroadSelling
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `leridia_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Inventory exported successfully!');
}

// Add sample products for demo
function addSampleProducts() {
    const sampleProducts = [
        {
            id: '1',
            name: 'Golden Rose Stud Earrings',
            sku: 'LJ-EAST-0001',
            category: 'Earrings',
            type: 'Studs',
            size: 'Small',
            quality: 'Gold plated',
            stock: 25,
            localPrice: 15.00,
            localSelling: 29.99,
            abroadPrice: 18.00,
            abroadSelling: 39.99,
            description: 'Elegant rose design stud earrings',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Pearl Drop Necklace',
            sku: 'LJ-NEST-0002',
            category: 'Necklaces',
            type: 'Pendant',
            size: 'Medium',
            quality: 'Silver 925',
            stock: 8,
            localPrice: 45.00,
            localSelling: 89.99,
            abroadPrice: 55.00,
            abroadSelling: 119.99,
            description: 'Beautiful pearl pendant necklace',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '3',
            name: 'Minimalist Band Ring',
            sku: 'LJ-RIMI-0003',
            category: 'Rings',
            type: 'Minimalist ring',
            size: 'Small',
            quality: 'Stainless steel',
            stock: 0,
            localPrice: 12.00,
            localSelling: 24.99,
            abroadPrice: 15.00,
            abroadSelling: 34.99,
            description: 'Simple and elegant minimalist ring',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '4',
            name: 'Twisted Rope Bangle',
            sku: 'LJ-BRBA-0004',
            category: 'Bracelets/Bangles',
            type: 'Twisted / rope bangles',
            size: 'Large',
            quality: 'Gold plated',
            stock: 15,
            localPrice: 28.00,
            localSelling: 54.99,
            abroadPrice: 35.00,
            abroadSelling: 74.99,
            description: 'Beautiful twisted rope design bangle',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '5',
            name: 'Crystal Charm Anklet',
            sku: 'LJ-ANCH-0005',
            category: 'Anklets',
            type: 'Charm anklet',
            size: 'Medium',
            quality: 'Gemstones',
            stock: 12,
            localPrice: 22.00,
            localSelling: 44.99,
            abroadPrice: 28.00,
            abroadSelling: 59.99,
            description: 'Sparkling crystal charm anklet',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    products = sampleProducts;
    saveToLocalStorage();
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
    showToast('Sample products added!');
}

// Clear all products (for testing)
function clearAllProducts() {
    if (confirm('Are you sure you want to delete ALL products? This cannot be undone.')) {
        products = [];
        saveToLocalStorage();
        updateDashboard();
        renderProducts();
        renderInventory();
        renderPricing();
        showToast('All products cleared!');
    }
}

// Expose functions to window for HTML onclick handlers
window.showSection = showSection;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeModal = closeModal;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.openStockModal = openStockModal;
window.closeStockModal = closeStockModal;
window.updateStock = updateStock;
window.updateTypeOptions = updateTypeOptions;
window.exportInventory = exportInventory;
window.addSampleProducts = addSampleProducts;
window.clearAllProducts = clearAllProducts;
