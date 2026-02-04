/* =============================================
   Leridia Jewels - Inventory Management System
   JavaScript Application Logic with Supabase
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

// Products array
let products = [];

// Supabase client reference
let db = null;

// Connection status
let isOnline = false;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
async function initializeApp() {
    // Initialize Supabase
    if (window.initSupabase && window.initSupabase()) {
        db = window.getSupabase();
        isOnline = true;
        console.log('Connected to Supabase');
    } else {
        console.log('Running in offline mode (localStorage)');
        isOnline = false;
    }
    
    setupNavigation();
    setupFilters();
    populateCategoryFilter();
    setupSearch();
    
    // Load products from Supabase or localStorage
    await loadProducts();
    
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
    
    // Update connection status indicator
    updateConnectionStatus();
}

// Update Connection Status UI
function updateConnectionStatus() {
    const statusIndicator = document.querySelector('.connection-status');
    if (statusIndicator) {
        if (isOnline) {
            statusIndicator.innerHTML = '<i class="fas fa-cloud"></i> Cloud Sync';
            statusIndicator.classList.add('online');
            statusIndicator.classList.remove('offline');
        } else {
            statusIndicator.innerHTML = '<i class="fas fa-database"></i> Local Storage';
            statusIndicator.classList.add('offline');
            statusIndicator.classList.remove('online');
        }
    }
}

// Load Products from Supabase or localStorage
async function loadProducts() {
    if (isOnline && db) {
        try {
            const { data, error } = await db
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Supabase error:', error);
                // Fallback to localStorage
                products = JSON.parse(localStorage.getItem('leridiaProducts')) || [];
            } else {
                products = data.map(transformFromDb) || [];
                // Also save to localStorage as backup
                localStorage.setItem('leridiaProducts', JSON.stringify(products));
            }
        } catch (err) {
            console.error('Failed to load from Supabase:', err);
            products = JSON.parse(localStorage.getItem('leridiaProducts')) || [];
        }
    } else {
        products = JSON.parse(localStorage.getItem('leridiaProducts')) || [];
    }
}

// Transform database record to app format
function transformFromDb(record) {
    return {
        id: record.id,
        name: record.name,
        sku: record.sku,
        category: record.category,
        type: record.type,
        size: record.size,
        quality: record.quality,
        stock: record.stock,
        localPrice: record.local_price,
        localSelling: record.local_selling,
        abroadPrice: record.abroad_price,
        abroadSelling: record.abroad_selling,
        description: record.description,
        createdAt: record.created_at,
        updatedAt: record.updated_at
    };
}

// Transform app format to database record
function transformToDb(product) {
    return {
        name: product.name,
        sku: product.sku,
        category: product.category,
        type: product.type,
        size: product.size || null,
        quality: product.quality,
        stock: product.stock,
        local_price: product.localPrice,
        local_selling: product.localSelling,
        abroad_price: product.abroadPrice,
        abroad_selling: product.abroadSelling,
        description: product.description || null
    };
}

// Save Product to Supabase
async function saveToSupabase(product, isUpdate = false) {
    if (!isOnline || !db) return false;
    
    try {
        const dbRecord = transformToDb(product);
        
        if (isUpdate) {
            const { error } = await db
                .from('products')
                .update(dbRecord)
                .eq('id', product.id);
            
            if (error) throw error;
        } else {
            const { data, error } = await db
                .from('products')
                .insert(dbRecord)
                .select()
                .single();
            
            if (error) throw error;
            
            // Update product with database-generated ID
            if (data) {
                product.id = data.id;
            }
        }
        return true;
    } catch (err) {
        console.error('Supabase save error:', err);
        return false;
    }
}

// Delete from Supabase
async function deleteFromSupabase(productId) {
    if (!isOnline || !db) return false;
    
    try {
        const { error } = await db
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Supabase delete error:', err);
        return false;
    }
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
    const product = products.find(p => p.id == productId);
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
async function saveProduct(e) {
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
        id: productId || null,
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
        createdAt: productId ? products.find(p => p.id == productId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Show loading state
    showToast('Saving product...');
    
    if (productId) {
        // Update existing product
        productData.id = productId;
        const savedToCloud = await saveToSupabase(productData, true);
        
        const index = products.findIndex(p => p.id == productId);
        if (index !== -1) {
            products[index] = productData;
        }
        showToast(savedToCloud ? 'Product updated & synced!' : 'Product updated locally!');
    } else {
        // Add new product
        const savedToCloud = await saveToSupabase(productData, false);
        
        if (!savedToCloud && !productData.id) {
            productData.id = Date.now().toString();
        }
        
        products.unshift(productData);
        showToast(savedToCloud ? 'Product added & synced!' : 'Product added locally!');
    }
    
    saveToLocalStorage();
    closeModal();
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
}

// Delete Product
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        // Delete from Supabase
        await deleteFromSupabase(productId);
        
        products = products.filter(p => p.id != productId);
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
    const product = products.find(p => p.id == productId);
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
async function updateStock(e) {
    e.preventDefault();
    
    const productId = document.getElementById('stockProductId').value;
    const newStock = parseInt(document.getElementById('newStock').value);
    
    const product = products.find(p => p.id == productId);
    if (product) {
        product.stock = newStock;
        product.updatedAt = new Date().toISOString();
        
        // Update in Supabase
        await saveToSupabase(product, true);
        
        saveToLocalStorage();
        updateDashboard();
        renderProducts();
        renderInventory();
        showToast('Stock updated successfully!');
    }
    
    closeStockModal();
}

// Save to Local Storage (backup)
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
    
    const headers = ['Name', 'SKU', 'Category', 'Type', 'Size', 'Quality', 'Stock', 'Local Price (KSH)', 'Local Selling (KSH)', 'Abroad Price (KSH)', 'Abroad Selling (KSH)'];
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

// Sync with Supabase (manual sync)
async function syncWithCloud() {
    if (!isOnline || !db) {
        showToast('Not connected to cloud');
        return;
    }
    
    showToast('Syncing with cloud...');
    await loadProducts();
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
    showToast('Sync complete!');
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
window.syncWithCloud = syncWithCloud;
