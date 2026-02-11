/* =============================================
   UI Enhancements JavaScript
   ============================================= */

// ---- Form Tab Navigation ----
let currentFormTab = 0;

function switchFormTab(tabIndex) {
    currentFormTab = tabIndex;
    
    // Update tab buttons
    const tabs = document.querySelectorAll('.form-tab');
    tabs.forEach((tab, i) => {
        tab.classList.remove('active');
        if (i < tabIndex) {
            tab.classList.add('completed');
        } else {
            tab.classList.remove('completed');
        }
        if (i === tabIndex) {
            tab.classList.add('active');
        }
    });
    
    // Update panels
    const panels = document.querySelectorAll('.form-tab-panel');
    panels.forEach((panel, i) => {
        panel.classList.remove('active');
        if (i === tabIndex) {
            panel.classList.add('active');
        }
    });
    
    // Scroll modal to top of form
    const modalBody = document.querySelector('#productModal .modal-body');
    if (modalBody) modalBody.scrollTop = 0;
}

// Reset tabs when opening add modal
const _origOpenAddProductModal = window.openAddProductModal;
if (_origOpenAddProductModal) {
    window.openAddProductModal = function() {
        _origOpenAddProductModal.apply(this, arguments);
        switchFormTab(0);
    };
}

const _origOpenEditProductModal = window.openEditProductModal;
if (_origOpenEditProductModal) {
    window.openEditProductModal = function() {
        _origOpenEditProductModal.apply(this, arguments);
        switchFormTab(0);
    };
}

const _origOpenAddProductModalWithCategory = window.openAddProductModalWithCategory;
if (_origOpenAddProductModalWithCategory) {
    window.openAddProductModalWithCategory = function() {
        _origOpenAddProductModalWithCategory.apply(this, arguments);
        switchFormTab(0);
    };
}

// Expose globally
window.switchFormTab = switchFormTab;

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Filter Panel Toggle
function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    panel.classList.toggle('active');
}

// View Toggle (Table/Grid)
let currentView = 'table';
function toggleView(view) {
    currentView = view;
    const tableView = document.getElementById('productsTableView');
    const gridView = document.getElementById('productsGridView');
    const buttons = document.querySelectorAll('.view-toggle-btn');
    
    if (view === 'table') {
        tableView.closest('.card').style.display = 'block';
        gridView.style.display = 'none';
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        tableView.closest('.card').style.display = 'none';
        gridView.style.display = 'grid';
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        renderProductsGrid();
    }
}

// Render Products Grid View
function renderProductsGrid() {
    const gridView = document.getElementById('productsGridView');
    if (!products || products.length === 0) {
        gridView.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <h4>No products yet</h4>
                <p>Start by adding your first product</p>
                <button class="btn-primary" onclick="openAddProductModal()">
                    <i class="fas fa-plus"></i> Add Product
                </button>
            </div>
        `;
        return;
    }
    
    gridView.innerHTML = products.map(product => `
        <div class="product-card" onclick="openEditProductModal('${product.id}')">
            <div class="product-card-image">
                <img src="${getProductImage(product)}" alt="${product.name}">
            </div>
            <div class="product-card-content">
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-details">
                    ${product.category} • ${product.type}<br>
                    <span class="stock-badge ${getStockStatus(product.stock)}">${product.stock} pcs</span>
                </div>
                <div class="product-card-price">
                    <div>
                        <small>Local</small><br>
                        <strong>KSH ${product.localSelling.toFixed(2)}</strong>
                    </div>
                    <div>
                        <small>Abroad</small><br>
                        <strong>KSH ${product.abroadSelling.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Bulk Selection
let selectedProducts = new Set();

function toggleSelectAll(checkbox) {
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
        if (checkbox.checked) {
            selectedProducts.add(cb.value);
        } else {
            selectedProducts.delete(cb.value);
        }
    });
    updateBulkActionsBar();
}

function toggleProductSelection(checkbox, productId) {
    if (checkbox.checked) {
        selectedProducts.add(productId);
    } else {
        selectedProducts.delete(productId);
    }
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulkActionsBar');
    const count = document.getElementById('bulkSelectedCount');
    
    if (selectedProducts.size > 0) {
        bar.classList.add('active');
        count.textContent = `${selectedProducts.size} selected`;
    } else {
        bar.classList.remove('active');
    }
}

function clearSelection() {
    selectedProducts.clear();
    document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('selectAllProducts').checked = false;
    updateBulkActionsBar();
}

function bulkDelete() {
    if (selectedProducts.size === 0) return;
    
    showConfirmation(
        'Delete Products',
        `Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`,
        () => {
            selectedProducts.forEach(id => {
                deleteProduct(id, true); // silent delete
            });
            clearSelection();
            updateDashboard();
            renderProducts();
            showToast(`${selectedProducts.size} products deleted successfully!`);
        }
    );
}

function bulkExport() {
    if (selectedProducts.size === 0) return;
    
    const exportData = products.filter(p => selectedProducts.has(p.id));
    const csv = convertToCSV(exportData);
    downloadCSV(csv, 'leridia-products-export.csv');
    showToast(`Exported ${selectedProducts.size} products!`);
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = ['Name', 'SKU', 'Category', 'Type', 'Quality', 'Quantity', 'Weight(g)', 'Local Cost', 'Local Selling', 'Abroad Cost', 'Abroad Selling'];
    const rows = data.map(p => [
        p.name,
        p.sku,
        p.category,
        p.type,
        p.quality,
        p.stock,
        p.weightGrams || '',
        p.localPrice,
        p.localSelling,
        p.abroadPrice,
        p.abroadSelling
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Image Lightbox
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('imageLightbox');
    const image = document.getElementById('lightboxImage');
    image.src = imageSrc;
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    lightbox.classList.remove('active');
}

// Confirmation Dialog
let confirmCallback = null;

function showConfirmation(title, message, callback) {
    const dialog = document.getElementById('confirmationDialog');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    dialog.style.display = 'block';
}

function closeConfirmation() {
    document.getElementById('confirmationDialog').style.display = 'none';
    confirmCallback = null;
}

function confirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmation();
}

// Loading Overlay
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Enhanced Delete with Confirmation
const originalDeleteProduct = window.deleteProduct;
window.deleteProduct = function(productId, silent = false) {
    if (silent) {
        originalDeleteProduct(productId);
        return;
    }
    
    const product = products.find(p => p.id == productId);
    if (!product) return;
    
    showConfirmation(
        'Delete Product',
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
        () => {
            originalDeleteProduct(productId);
        }
    );
};

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+N or Cmd+N: New Product
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddProductModal();
    }
    
    // Escape: Close modal or lightbox
    if (e.key === 'Escape') {
        closeLightbox();
        if (document.getElementById('confirmationDialog').style.display === 'block') {
            closeConfirmation();
        }
    }
});

// Auto-save form drafts to localStorage
let formDraftTimeout;
function saveDraft() {
    clearTimeout(formDraftTimeout);
    formDraftTimeout = setTimeout(() => {
        const draft = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            type: document.getElementById('productType').value,
            // ... save other fields
        };
        localStorage.setItem('productFormDraft', JSON.stringify(draft));
    }, 1000);
}

// Restore draft on form open
function restoreDraft() {
    const draft = localStorage.getItem('productFormDraft');
    if (draft) {
        const data = JSON.parse(draft);
        if (data.name) document.getElementById('productName').value = data.name;
        // ... restore other fields
    }
}

// Clear draft after successful save
function clearDraft() {
    localStorage.removeItem('productFormDraft');
}

// Click product image to view in lightbox
window.addEventListener('click', function(e) {
    if (e.target.closest('.product-image img')) {
        const img = e.target.closest('.product-image img');
        openLightbox(img.src);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Setup form input listeners for auto-save
    const formInputs = document.querySelectorAll('#productForm input, #productForm select, #productForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', saveDraft);
    });
});
