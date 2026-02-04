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

// Chart.js instances
let categoryChart = null;
let profitChart = null;

// Initialize Application
async function initializeApp() {
    // Initialize Supabase
    if (window.initSupabase && window.initSupabase()) {
        db = window.getSupabase();
        isOnline = true;
        console.log('Connected to Supabase');
    } else {
        console.error('Failed to connect to Supabase');
        alert('Failed to connect to database. Please check your connection and refresh.');
        return;
    }
    
    setupNavigation();
    setupFilters();
    populateCategoryFilter();
    setupSearch();
    
    // Load products from Supabase
    await loadProducts();
    
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
    initializeCharts();
    
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

// Load Products from Supabase
async function loadProducts() {
    if (!isOnline || !db) {
        console.error('No database connection');
        return;
    }
    
    try {
        const { data, error } = await db
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase error:', error);
            showToast('Error loading products: ' + error.message);
            products = [];
        } else {
            products = data.map(transformFromDb) || [];
            console.log(`Loaded ${products.length} products from Supabase`);
        }
    } catch (err) {
        console.error('Failed to load from Supabase:', err);
        showToast('Failed to load products');
        products = [];
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
        weightGrams: record.weight_grams,
        localPrice: record.local_price,
        localSelling: record.local_selling,
        abroadPrice: record.abroad_price,
        abroadSelling: record.abroad_selling,
        description: record.description,
        localImageFile: record.local_image_file,
        localImageUrl: record.local_image_url,
        abroadImageFile: record.abroad_image_file,
        abroadImageUrl: record.abroad_image_url,
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
        weight_grams: product.weightGrams || null,
        stock: product.stock,
        local_price: product.localPrice,
        local_selling: product.localSelling,
        abroad_price: product.abroadPrice,
        abroad_selling: product.abroadSelling,
        description: product.description || null,
        local_image_file: product.localImageFile || null,
        local_image_url: product.localImageUrl || null,
        abroad_image_file: product.abroadImageFile || null,
        abroad_image_url: product.abroadImageUrl || null
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
    document.getElementById('productWeight').value = product.weightGrams || '';
    document.getElementById('localPrice').value = product.localPrice;
    document.getElementById('localSelling').value = product.localSelling;
    document.getElementById('abroadPrice').value = product.abroadPrice;
    document.getElementById('abroadSelling').value = product.abroadSelling;
    document.getElementById('localImageUrl').value = product.localImageUrl || '';
    document.getElementById('abroadImageUrl').value = product.abroadImageUrl || '';
    
    // Show existing images
    if (product.localImageFile) {
        document.getElementById('localFilePreview').innerHTML = `<img src="${product.localImageFile}" alt="Local Product">`;
    }
    if (product.localImageUrl) {
        document.getElementById('localUrlPreview').innerHTML = `<img src="${product.localImageUrl}" alt="Local Product">`;
    }
    if (product.abroadImageFile) {
        document.getElementById('abroadFilePreview').innerHTML = `<img src="${product.abroadImageFile}" alt="Abroad Product">`;
    }
    if (product.abroadImageUrl) {
        document.getElementById('abroadUrlPreview').innerHTML = `<img src="${product.abroadImageUrl}" alt="Abroad Product">`;
    }
    
    document.getElementById('productModal').classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    // Clear image previews
    document.getElementById('localFilePreview').innerHTML = '';
    document.getElementById('localUrlPreview').innerHTML = '';
    document.getElementById('abroadFilePreview').innerHTML = '';
    document.getElementById('abroadUrlPreview').innerHTML = '';
}

// Save Product
async function saveProduct(e) {
    e.preventDefault();
    
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        showToast('⚠️ Please fill in all required fields', 'warning');
        return;
    }
    
    // Validate pricing
    const localPrice = parseFloat(document.getElementById('localPrice').value) || 0;
    const localSelling = parseFloat(document.getElementById('localSelling').value) || 0;
    const abroadPrice = parseFloat(document.getElementById('abroadPrice').value) || 0;
    const abroadSelling = parseFloat(document.getElementById('abroadSelling').value) || 0;
    
    if (localSelling < localPrice) {
        const confirmed = confirm('⚠️ Local selling price is lower than cost price. This will result in a loss. Continue anyway?');
        if (!confirmed) return;
    }
    
    if (abroadSelling < abroadPrice) {
        const confirmed = confirm('⚠️ Abroad selling price is lower than cost price. This will result in a loss. Continue anyway?');
        if (!confirmed) return;
    }
    
    const productId = document.getElementById('productId').value;
    const category = document.getElementById('productCategory').value;
    const type = document.getElementById('productType').value;
    
    // Handle image file uploads and URLs
    const localImageFile = document.getElementById('localImageFile').files[0];
    const abroadImageFile = document.getElementById('abroadImageFile').files[0];
    
    let localImageFileData = productId ? products.find(p => p.id == productId)?.localImageFile : null;
    let abroadImageFileData = productId ? products.find(p => p.id == productId)?.abroadImageFile : null;
    
    if (localImageFile) {
        localImageFileData = await fileToBase64(localImageFile);
    }
    
    if (abroadImageFile) {
        abroadImageFileData = await fileToBase64(abroadImageFile);
    }
    
    const productData = {
        id: productId || null,
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSKU').value || generateSKU(category, type),
        category: category,
        type: type,
        size: document.getElementById('productSize').value,
        quality: document.getElementById('productQuality').value,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        weightGrams: parseFloat(document.getElementById('productWeight').value) || null,
        localPrice: parseFloat(document.getElementById('localPrice').value) || 0,
        localSelling: parseFloat(document.getElementById('localSelling').value) || 0,
        abroadPrice: parseFloat(document.getElementById('abroadPrice').value) || 0,
        abroadSelling: parseFloat(document.getElementById('abroadSelling').value) || 0,
        localImageFile: localImageFileData,
        localImageUrl: document.getElementById('localImageUrl').value || null,
        abroadImageFile: abroadImageFileData,
        abroadImageUrl: document.getElementById('abroadImageUrl').value || null,
        createdAt: productId ? products.find(p => p.id == productId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Show loading state
    showToast('💾 Saving product...', 'info');
    
    if (productId) {
        // Update existing product
        productData.id = productId;
        const savedToCloud = await saveToSupabase(productData, true);
        
        const index = products.findIndex(p => p.id == productId);
        if (index !== -1) {
            products[index] = productData;
        }
        
        if (savedToCloud) {
            showToast('✅ Product updated successfully!', 'success');
        } else {
            showToast('⚠️ Product updated but sync failed', 'warning');
        }
    } else {
        // Add new product
        const savedToCloud = await saveToSupabase(productData, false);
        
        if (!savedToCloud && !productData.id) {
            productData.id = Date.now().toString();
        }
        
        products.unshift(productData);
        
        if (savedToCloud) {
            showToast('✅ Product added successfully!', 'success');
        } else {
            showToast('⚠️ Product added but sync failed', 'warning');
        }
        
        // Reset form for next product
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productType').innerHTML = '<option value="">Select Type</option>';
        document.getElementById('localFilePreview').innerHTML = '';
        document.getElementById('localUrlPreview').innerHTML = '';
        document.getElementById('abroadFilePreview').innerHTML = '';
        document.getElementById('abroadUrlPreview').innerHTML = '';
        document.getElementById('modalTitle').textContent = 'Add New Product';
    }
    
    // Only close modal if editing (not adding new)
    if (productId) {
        closeModal();
    }
    
    updateDashboard();
    renderProducts();
    renderInventory();
    renderPricing();
}

// Delete Product
async function deleteProduct(productId) {
    const product = products.find(p => p.id == productId);
    const productName = product ? product.name : 'this product';
    
    if (confirm(`🗑️ Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`)) {
        showToast('🗑️ Deleting product...', 'info');
        
        // Delete from Supabase
        const deleted = await deleteFromSupabase(productId);
        
        products = products.filter(p => p.id != productId);
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
        
        updateDashboard();
        renderProducts();
        renderInventory();
        showToast('Stock updated successfully!');
    }
    
    closeStockModal();
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
    
    // Update charts
    updateCharts();
}

// Render Recent Products
function renderRecentProducts() {
    const tbody = document.getElementById('recentProductsTable');
    const recentProducts = products.slice(0, 5);
    
    if (recentProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No products yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = recentProducts.map(product => `
        <tr>
            <td>
                <div class="product-image">
                    <img src="${getProductImage(product)}" alt="${product.name}">
                </div>
            </td>
            <td><strong>${product.name}</strong></td>
            <td>${product.category}</td>
            <td><span class="stock-badge ${getStockStatus(product.stock)}">${product.stock}</span></td>
            <td class="price">KSH ${product.localSelling.toFixed(2)}</td>
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

// Render Category Overview
function renderCategoryOverview() {
    const container = document.getElementById('categoryOverview');
    const categories = Object.keys(productTypes);
    
    container.innerHTML = categories.map(category => {
        const count = products.filter(p => p.category === category).length;
        const icon = categoryIcons[category] || 'fa-tag';
        
        return `
            <div class="category-item clickable" onclick="filterByCategory('${category}')" title="View ${category}">
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
                <td colspan="14" class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <h4>No products found</h4>
                    <p>Add your first product to get started</p>
                    <button class="btn-primary" onclick="openAddProductModal()">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productList.map(product => `
        <tr>
            <td class="checkbox-cell">
                <input type="checkbox" class="product-checkbox" value="${product.id}" 
                       onchange="toggleProductSelection(this, '${product.id}')">
            </td>
            <td><div class="product-image"><img src="${getProductImage(product)}" alt="${product.name}" onclick="openLightbox('${getProductImage(product)}')"></div></td>
            <td><strong>${product.name}</strong><br><small style="color: #9B9B9B;">${product.sku}</small></td>
            <td>${product.category}</td>
            <td>${product.type}</td>
            <td class="column-hideable">${product.quality}</td>
            <td class="column-hideable">${product.weightGrams ? product.weightGrams + 'g' : '-'}</td>
            <td><span class="stock-badge ${getStockStatus(product.stock)}">${product.stock}</span></td>
            <td class="column-hideable price">KSH ${product.localPrice.toFixed(2)}</td>
            <td class="price">KSH ${product.localSelling.toFixed(2)}</td>
            <td class="column-hideable price">KSH ${product.abroadPrice.toFixed(2)}</td>
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
                    <button class="action-btn edit" onclick="openEditProductModal('${product.id}')" title="Edit Product">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn stock" onclick="openStockModal('${product.id}')" title="Update Stock">
                        <i class="fas fa-boxes"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
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
                        <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
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

// Modern Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type] || icons.success}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
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

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Preview image upload for local file
async function previewImage(event, type) {
    const file = event.target.files[0];
    if (file) {
        const base64 = await fileToBase64(file);
        if (type === 'local-file') {
            document.getElementById('localFilePreview').innerHTML = `<img src="${base64}" alt="Preview">`;
        } else if (type === 'abroad-file') {
            document.getElementById('abroadFilePreview').innerHTML = `<img src="${base64}" alt="Preview">`;
        }
    }
}

// Preview image URL
function previewImageUrl(type) {
    let url, previewId;
    if (type === 'local-url') {
        url = document.getElementById('localImageUrl').value;
        previewId = 'localUrlPreview';
    } else if (type === 'abroad-url') {
        url = document.getElementById('abroadImageUrl').value;
        previewId = 'abroadUrlPreview';
    }
    
    if (url) {
        document.getElementById(previewId).innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'image-error\\'>Invalid image URL</div>'">`;
    }
}

// Get product image with priority: local file > local URL > abroad file > abroad URL > placeholder
function getProductImage(product) {
    if (product.localImageFile) {
        return product.localImageFile;
    } else if (product.localImageUrl) {
        return product.localImageUrl;
    } else if (product.abroadImageFile) {
        return product.abroadImageFile;
    } else if (product.abroadImageUrl) {
        return product.abroadImageUrl;
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f5f5f5" width="100" height="100"/%3E%3Ctext fill="%23c9a962" font-family="Arial" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
}

// =============================================
// Dashboard Analytics with Charts
// =============================================

function initializeCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    createCategoryChart();
    createProfitChart();
}

function createCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Count products by category
    const categoryCounts = {};
    products.forEach(product => {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });
    
    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);
    
    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Products',
                data: data,
                backgroundColor: [
                    '#B8860B',
                    '#DAA520',
                    '#8B6914',
                    '#C9A962',
                    '#D4AF37',
                    '#E6C770'
                ],
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Montserrat',
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} products (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createProfitChart() {
    const ctx = document.getElementById('profitChart');
    if (!ctx) return;
    
    // Calculate profit margins for each market
    const localProfits = [];
    const abroadProfits = [];
    const labels = [];
    
    // Get top 10 products by profit
    const productProfits = products.map(p => {
        const localProfit = ((p.localSelling - p.localPrice) / p.localPrice) * 100;
        const abroadProfit = ((p.abroadSelling - p.abroadPrice) / p.abroadPrice) * 100;
        return {
            name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
            localProfit: isFinite(localProfit) ? localProfit : 0,
            abroadProfit: isFinite(abroadProfit) ? abroadProfit : 0
        };
    }).slice(0, 10);
    
    productProfits.forEach(p => {
        labels.push(p.name);
        localProfits.push(p.localProfit);
        abroadProfits.push(p.abroadProfit);
    });
    
    // Destroy existing chart
    if (profitChart) {
        profitChart.destroy();
    }
    
    profitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Local Margin (%)',
                    data: localProfits,
                    backgroundColor: '#B8860B',
                    borderColor: '#8B6914',
                    borderWidth: 1
                },
                {
                    label: 'Abroad Margin (%)',
                    data: abroadProfits,
                    backgroundColor: '#DAA520',
                    borderColor: '#C9A962',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            family: 'Montserrat',
                            size: 11
                        }
                    },
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Montserrat',
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Montserrat',
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y.toFixed(1);
                            return `${label}: ${value}%`;
                        }
                    }
                }
            }
        }
    });
}

// Update charts when data changes
function updateCharts() {
    if (typeof Chart !== 'undefined') {
        createCategoryChart();
        createProfitChart();
    }
}

// =============================================
// Real-time Form Enhancements
// =============================================

// Calculate and display profit margin in real-time
function calculateMargin(market) {
    const costId = market === 'local' ? 'localPrice' : 'abroadPrice';
    const sellingId = market === 'local' ? 'localSelling' : 'abroadSelling';
    const marginId = market === 'local' ? 'localMargin' : 'abroadMargin';
    
    const cost = parseFloat(document.getElementById(costId).value) || 0;
    const selling = parseFloat(document.getElementById(sellingId).value) || 0;
    
    const marginElement = document.getElementById(marginId);
    if (!marginElement) return;
    
    if (cost > 0 && selling > 0) {
        const margin = ((selling - cost) / cost * 100).toFixed(1);
        const profit = (selling - cost).toFixed(2);
        
        if (margin > 0) {
            marginElement.innerHTML = `<i class="fas fa-chart-line"></i> Profit: KSH ${profit} (${margin}% margin)`;
            marginElement.style.color = '#4CAF50';
        } else if (margin < 0) {
            marginElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Loss: KSH ${profit} (${margin}% margin)`;
            marginElement.style.color = '#F44336';
        } else {
            marginElement.innerHTML = `<i class="fas fa-info-circle"></i> No profit margin`;
            marginElement.style.color = '#FF9800';
        }
    } else {
        marginElement.innerHTML = `<i class="fas fa-chart-line"></i> Profit margin: 0%`;
        marginElement.style.color = '#9B9B9B';
    }
}



// Form validation with visual feedback
function validateFormField(field) {
    if (field.hasAttribute('required') && !field.value) {
        field.classList.add('error');
        return false;
    } else {
        field.classList.remove('error');
        return true;
    }
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productForm');
    if (form) {
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateFormField(this);
            });
            
            field.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateFormField(this);
                }
            });
        });
    }
});

// Auto-format price inputs
function formatPriceInput(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('blur', function() {
            if (this.value) {
                this.value = parseFloat(this.value).toFixed(2);
            }
        });
    }
}

// Initialize price formatting on load
document.addEventListener('DOMContentLoaded', function() {
    ['localPrice', 'localSelling', 'abroadPrice', 'abroadSelling'].forEach(formatPriceInput);
});

// Keyboard shortcuts for better UX
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const modal = document.getElementById('productModal');
        if (modal && modal.classList.contains('active')) {
            const saveBtn = document.querySelector('.btn-primary[onclick*=\"saveProduct\"]');
            if (saveBtn) saveBtn.click();
        }
    }
});

// Filter products by category
function filterByCategory(category) {
    showSection('products');
    setTimeout(() => {
        const filterSelect = document.getElementById('filterCategory');
        if (filterSelect) {
            filterSelect.value = category;
            filterProducts();
        }
    }, 100);
}

// Filter inventory by stock status
function filterInventoryByStatus(status) {
    // This will be called after switching to inventory section
    // We'll use a short timeout to ensure the section is visible first
    setTimeout(() => {
        const filterSelect = document.getElementById('filterStock');
        if (filterSelect) {
            filterSelect.value = status;
            filterProducts();
        }
    }, 100);
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
window.previewImage = previewImage;
window.previewImageUrl = previewImageUrl;
window.calculateMargin = calculateMargin;
window.filterInventoryByStatus = filterInventoryByStatus;
window.filterByCategory = filterByCategory;

