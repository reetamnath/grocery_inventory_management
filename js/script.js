// Global variables
let allItems = [];
let categories = [];
let units = [];
let stockStatuses = [];
let config = null;
let currentFilter = {
    category: '',
    status: '',
    search: ''
};
let itemToDelete = null;
let scriptUrl = localStorage.getItem('scriptUrl') || '';

// Shopping Cart
let cart = [];
const CART_STORAGE_KEY = 'groceryCart';

// Column name mapping (will be updated from backend)
let columnNames = {
    ITEM_NAME: 'Item Name',
    CATEGORY: 'Category',
    STOCK_STATUS: 'Stock Status',
    QUANTITY: 'Quantity',
    UNIT: 'Unit',
    LAST_UPDATED: 'Last Updated',
    NOTES: 'Notes'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    loadCart();

    if (scriptUrl) {
        loadData();
    } else {
        openConfigModal();
    }

// Close cart when clicking outside (but not when clicking inside cart dropdown)
document.addEventListener('click', function(e) {
  const cartContainer = document.querySelector('.cart-container');
  const cartDropdown = document.getElementById('cart-dropdown');
  if (cartContainer && !cartContainer.contains(e.target) && cartDropdown.classList.contains('active')) {
    cartDropdown.classList.remove('active');
  }
});

// Prevent cart dropdown from closing when interacting with its content
document.getElementById('cart-dropdown').addEventListener('click', function(e) {
  e.stopPropagation();
});
});

// Load data from Google Apps Script
async function loadData() {
    showLoading(true);

    try {
        // Fetch dropdown values first (includes config)
        const dropdownsResponse = await fetch(`${scriptUrl}?action=getDropdowns`);
        const dropdownsData = await dropdownsResponse.json();

        if (dropdownsData.error) {
            throw new Error(dropdownsData.error);
        }

        categories = dropdownsData.categories || [];
        units = dropdownsData.units || [];
        stockStatuses = dropdownsData.stockStatuses || [];

        // Update column names from config if available
        if (dropdownsData.config && dropdownsData.config.COLUMNS) {
            columnNames = dropdownsData.config.COLUMNS;
        }

        // Fetch all items
        const itemsResponse = await fetch(`${scriptUrl}?action=getData`);
        const itemsData = await itemsResponse.json();

        if (itemsData.error) {
            throw new Error(itemsData.error);
        }

        allItems = itemsData.items || [];

        // Update column names from data if available
        if (itemsData.config && itemsData.config.COLUMNS) {
            columnNames = itemsData.config.COLUMNS;
        }

        // Update UI
        updateStats();
        renderPriorityLists();
        populateDropdowns();
        renderTable();
        renderCards();
        updateActiveFilters();

        showToast('Data loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error loading data: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Refresh data
function refreshData() {
    loadData();
}

// Update statistics
function updateStats() {
    const total = allItems.length;
    const empty = allItems.filter(item => item[columnNames.STOCK_STATUS] === 'Empty').length;
    const half = allItems.filter(item => item[columnNames.STOCK_STATUS] === 'Half').length;
    const full = allItems.filter(item => item[columnNames.STOCK_STATUS] === 'Full').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-finished').textContent = empty;
    document.getElementById('stat-half').textContent = half;
    document.getElementById('stat-full').textContent = full;
}

// Render priority lists
function renderPriorityLists() {
    // Immediate buy (Empty items)
    const immediateItems = allItems.filter(item => item[columnNames.STOCK_STATUS] === 'Empty');
    const immediateList = document.getElementById('immediate-list');

  if (immediateItems.length === 0) {
    immediateList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>No items need immediate purchase!</p>
      </div>
    `;
  } else {
    immediateList.innerHTML = immediateItems.map(item => {
      const isInCart = cart.some(c => c.id === item[columnNames.ITEM_NAME]);
      const cartIcon = isInCart ? 'fa-minus' : 'fa-cart-plus';
      const cartBtnClass = isInCart ? 'btn-cart-active' : '';
      const btnText = isInCart ? 'Remove' : 'Add';
      return `
        <div class="priority-item">
          <div>
            <div class="priority-item-name">${item[columnNames.ITEM_NAME]}</div>
            <div class="priority-item-meta">${item[columnNames.CATEGORY] || 'Uncategorized'}</div>
          </div>
          <div class="priority-item-cart">
            <div>${item[columnNames.QUANTITY] || 0} ${item[columnNames.UNIT] || ''}</div>
            <button class="btn btn-cart btn-cart-sm ${cartBtnClass}" onclick="addToCartFromPriority(this, ${item._rowIndex})" title="${isInCart ? 'Remove from Cart' : 'Add to Cart'}">
              <i class="fas ${cartIcon}"></i>
              <span class="btn-text">${btnText}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

    document.getElementById('immediate-count').textContent = immediateItems.length;

    // Some week later (Half items)
    const laterItems = allItems.filter(item => item[columnNames.STOCK_STATUS] === 'Half');
    const laterList = document.getElementById('later-list');

  if (laterItems.length === 0) {
    laterList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>No items running low yet!</p>
      </div>
    `;
  } else {
    laterList.innerHTML = laterItems.map(item => {
      const isInCart = cart.some(c => c.id === item[columnNames.ITEM_NAME]);
      const cartIcon = isInCart ? 'fa-minus' : 'fa-cart-plus';
      const cartBtnClass = isInCart ? 'btn-cart-active' : '';
      const btnText = isInCart ? 'Remove' : 'Add';
      return `
        <div class="priority-item">
          <div>
            <div class="priority-item-name">${item[columnNames.ITEM_NAME]}</div>
            <div class="priority-item-meta">${item[columnNames.CATEGORY] || 'Uncategorized'}</div>
          </div>
          <div class="priority-item-cart">
            <div>${item[columnNames.QUANTITY] || 0} ${item[columnNames.UNIT] || ''}</div>
            <button class="btn btn-cart btn-cart-sm ${cartBtnClass}" onclick="addToCartFromPriority(this, ${item._rowIndex})" title="${isInCart ? 'Remove from Cart' : 'Add to Cart'}">
              <i class="fas ${cartIcon}"></i>
              <span class="btn-text">${btnText}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

    document.getElementById('later-count').textContent = laterItems.length;
}

// Populate dropdowns
function populateDropdowns() {
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    // Stock status filter
    const statusFilter = document.getElementById('status-filter');
    statusFilter.innerHTML = '<option value="">All Status</option>';
    stockStatuses.forEach(status => {
        statusFilter.innerHTML += `<option value="${status}">${status}</option>`;
    });

    // Item modal dropdowns
    const itemCategory = document.getElementById('item-category');
    itemCategory.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        itemCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
    });

    // Stock status dropdown
    const itemStatus = document.getElementById('item-status');
    itemStatus.innerHTML = '<option value="">Select Status</option>';
    stockStatuses.forEach(status => {
        itemStatus.innerHTML += `<option value="${status}">${status}</option>`;
    });

    // Unit dropdown
    const itemUnit = document.getElementById('item-unit');
    itemUnit.innerHTML = '<option value="">Select Unit</option>';
    units.forEach(unit => {
        itemUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
    });
}

// Filter items
function filterItems() {
    currentFilter.category = document.getElementById('category-filter').value;
    currentFilter.status = document.getElementById('status-filter').value;
    currentFilter.search = document.getElementById('search-input').value.toLowerCase();

    renderTable();
    renderCards();
    updateActiveFilters();
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('status-filter').value = '';
    currentFilter = { category: '', status: '', search: '' };
    renderTable();
    renderCards();
    updateActiveFilters();
}

// Update active filters display
function updateActiveFilters() {
    const container = document.getElementById('active-filters');
    const filters = [];

    if (currentFilter.search) {
        filters.push({ type: 'search', label: `Search: "${currentFilter.search}"` });
    }
    if (currentFilter.category) {
        filters.push({ type: 'category', label: `Category: ${currentFilter.category}` });
    }
    if (currentFilter.status) {
        filters.push({ type: 'status', label: `Status: ${currentFilter.status}` });
    }

    if (filters.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = filters.map(f => `
        <span class="filter-tag">
            ${f.label}
            <button onclick="removeFilter('${f.type}')">&times;</button>
        </span>
    `).join('');
}

// Remove specific filter
function removeFilter(type) {
    if (type === 'search') {
        document.getElementById('search-input').value = '';
        currentFilter.search = '';
    } else if (type === 'category') {
        document.getElementById('category-filter').value = '';
        currentFilter.category = '';
    } else if (type === 'status') {
        document.getElementById('status-filter').value = '';
        currentFilter.status = '';
    }
    renderTable();
    renderCards();
    updateActiveFilters();
}

// Get filtered items
function getFilteredItems() {
    return allItems.filter(item => {
        const matchesCategory = !currentFilter.category || item[columnNames.CATEGORY] === currentFilter.category;
        const matchesStatus = !currentFilter.status || item[columnNames.STOCK_STATUS] === currentFilter.status;
        const matchesSearch = !currentFilter.search ||
            (item[columnNames.ITEM_NAME] && item[columnNames.ITEM_NAME].toLowerCase().includes(currentFilter.search)) ||
            (item[columnNames.CATEGORY] && item[columnNames.CATEGORY].toLowerCase().includes(currentFilter.search));

        return matchesCategory && matchesStatus && matchesSearch;
    });
}

// Render table (desktop view)
function renderTable() {
    const tbody = document.getElementById('inventory-tbody');
    const filteredItems = getFilteredItems();

    if (filteredItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No items match your filters</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredItems.map(item => {
        const status = item[columnNames.STOCK_STATUS] || 'Unknown';
        const statusClass = status === 'Empty' ? 'finished' : status.toLowerCase().replace(' ', '-');
        const lastUpdated = item[columnNames.LAST_UPDATED] ?
            new Date(item[columnNames.LAST_UPDATED]).toLocaleDateString() : 'Never';
  const isInCart = cart.some(c => c.id === item[columnNames.ITEM_NAME]);
    const cartIcon = isInCart ? 'fa-check' : 'fa-cart-plus';
    const cartText = isInCart ? 'Added' : 'Cart';
    const cartBtnClass = isInCart ? 'btn-cart-active' : '';

    return `
      <tr>
        <td><strong>${item[columnNames.ITEM_NAME] || 'N/A'}</strong></td>
        <td>${item[columnNames.CATEGORY] ? `<span class="category-tag">${item[columnNames.CATEGORY]}</span>` : '-'}</td>
        <td>${item[columnNames.QUANTITY] || 0} ${item[columnNames.UNIT] || ''}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>${lastUpdated}</td>
        <td>${item[columnNames.NOTES] || '-'}</td>
        <td>
          <div class="actions">
            <button class="btn btn-sm btn-icon" onclick="openEditModal(${item._rowIndex})" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-icon btn-cart ${cartBtnClass}" onclick="addToCartFromInventory(${item._rowIndex})" title="${isInCart ? 'Remove from Cart' : 'Add to Cart'}">
              <i class="fas ${cartIcon}"></i>
            </button>
            <button class="btn btn-sm btn-icon btn-danger" onclick="openDeleteModal(${item._rowIndex})" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
}

// Render cards (mobile view)
function renderCards() {
    const container = document.getElementById('cards-container');
    const filteredItems = getFilteredItems();

    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No items match your filters</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredItems.map(item => {
        const status = item[columnNames.STOCK_STATUS] || 'Unknown';
        const statusClass = status === 'Empty' ? 'finished' : status.toLowerCase().replace(' ', '-');
        const lastUpdated = item[columnNames.LAST_UPDATED] ?
            new Date(item[columnNames.LAST_UPDATED]).toLocaleDateString() : 'Never';
  const isInCart = cart.some(c => c.id === item[columnNames.ITEM_NAME]);
    const cartIcon = isInCart ? 'fa-check' : 'fa-cart-plus';
    const cartBtnClass = isInCart ? 'btn-cart-active' : '';

    return `
      <div class="item-card">
        <div class="card-header">
          <div class="card-title">
            <h3>${item[columnNames.ITEM_NAME] || 'N/A'}</h3>
            <span class="card-category">${item[columnNames.CATEGORY] || 'Uncategorized'}</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-icon" onclick="openEditModal(${item._rowIndex})" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-icon btn-cart ${cartBtnClass}" onclick="addToCartFromInventory(${item._rowIndex})" title="${isInCart ? 'Remove from Cart' : 'Add to Cart'}">
              <i class="fas ${cartIcon}"></i>
            </button>
            <button class="btn btn-sm btn-icon btn-danger" onclick="openDeleteModal(${item._rowIndex})" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
                <div class="card-body">
                    <div class="card-field">
                        <span class="card-field-label">Quantity</span>
                        <span class="card-field-value">${item[columnNames.QUANTITY] || 0} ${item[columnNames.UNIT] || ''}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">Stock Status</span>
                        <span class="card-field-value"><span class="status-badge ${statusClass}">${status}</span></span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">Last Updated</span>
                        <span class="card-field-value">${lastUpdated}</span>
                    </div>
                    <div class="card-field">
                        <span class="card-field-label">Notes</span>
                        <span class="card-field-value">${item[columnNames.NOTES] || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Modal functions
function openAddModal() {
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus"></i> Add New Item';
    document.getElementById('item-form').reset();
    document.getElementById('item-row-index').value = '';
    document.getElementById('item-modal').classList.add('active');
}

function openEditModal(rowIndex) {
    const item = allItems.find(i => i._rowIndex === rowIndex);
    if (!item) return;

    document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Edit Item';
    document.getElementById('item-row-index').value = rowIndex;
    document.getElementById('item-name').value = item[columnNames.ITEM_NAME] || '';
    document.getElementById('item-category').value = item[columnNames.CATEGORY] || '';
    document.getElementById('item-status').value = item[columnNames.STOCK_STATUS] || '';
    document.getElementById('item-quantity').value = item[columnNames.QUANTITY] || '';
    document.getElementById('item-unit').value = item[columnNames.UNIT] || '';
    document.getElementById('item-notes').value = item[columnNames.NOTES] || '';

    document.getElementById('item-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('item-modal').classList.remove('active');
}

function openDeleteModal(rowIndex) {
    const item = allItems.find(i => i._rowIndex === rowIndex);
    if (!item) return;

    itemToDelete = rowIndex;
    document.getElementById('delete-item-name').textContent = item[columnNames.ITEM_NAME];
    document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
    itemToDelete = null;
}

// Save item
async function saveItem() {
    const form = document.getElementById('item-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const rowIndex = document.getElementById('item-row-index').value;
    const isEdit = !!rowIndex;
    const itemName = document.getElementById('item-name').value.trim();

    // Check for duplicate item name (case-insensitive)
    const normalizedName = itemName.toLowerCase();
    const duplicate = allItems.find(item => {
        const existingName = (item[columnNames.ITEM_NAME] || '').trim().toLowerCase();
        // For edits, exclude the current item being edited
        if (isEdit && item._rowIndex === parseInt(rowIndex)) {
            return false;
        }
        return existingName === normalizedName;
    });

    if (duplicate) {
        showToast(`Item "${itemName}" already exists. Please use a different name.`, 'error');
        return;
    }

    // Build item data using column names from config
    const itemData = {};
    itemData[columnNames.ITEM_NAME] = itemName;
    itemData[columnNames.CATEGORY] = document.getElementById('item-category').value;
    itemData[columnNames.STOCK_STATUS] = document.getElementById('item-status').value;
    itemData[columnNames.QUANTITY] = parseFloat(document.getElementById('item-quantity').value) || 0;
    itemData[columnNames.UNIT] = document.getElementById('item-unit').value;
    itemData[columnNames.NOTES] = document.getElementById('item-notes').value;

    if (isEdit) {
        itemData._rowIndex = parseInt(rowIndex);
    }

    showLoading(true);

    try {
        const response = await fetch(`${scriptUrl}?action=${isEdit ? 'updateItem' : 'addItem'}`, {
            method: 'POST',
            body: JSON.stringify(itemData)
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        showToast(isEdit ? 'Item updated successfully' : 'Item added successfully', 'success');
        closeModal();
        await loadData();
    } catch (error) {
        console.error('Error saving item:', error);
        showToast('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Delete item
async function confirmDelete() {
    if (!itemToDelete) return;

    showLoading(true);

    try {
        const response = await fetch(`${scriptUrl}?action=deleteItem`, {
            method: 'POST',
            body: JSON.stringify({ rowIndex: itemToDelete })
        });

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        showToast('Item deleted successfully', 'success');
        closeDeleteModal();
        await loadData();
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Config modal functions
function openConfigModal() {
    document.getElementById('script-url').value = scriptUrl;
    document.getElementById('config-modal').classList.add('active');
}

function closeConfigModal() {
    document.getElementById('config-modal').classList.remove('active');
}

function saveConfig() {
    const url = document.getElementById('script-url').value.trim();
    if (!url) {
        showToast('Please enter the script URL', 'error');
        return;
    }

    scriptUrl = url;
    localStorage.setItem('scriptUrl', scriptUrl);
    closeConfigModal();
    showToast('Configuration saved', 'success');
    loadData();
}

// Utility functions
function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';

    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        // Also close cart dropdown
        const cartDropdown = document.getElementById('cart-dropdown');
        if (cartDropdown) cartDropdown.classList.remove('active');
    }
});

// ==================== SHOPPING CART FUNCTIONS ====================

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
    updateCartUI();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Toggle cart dropdown
function toggleCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    cartDropdown.classList.toggle('active');
}

// Add item to cart (or remove if already in cart)
function addToCart(item) {
  const itemId = item[columnNames.ITEM_NAME];
  const existingItem = cart.find(c => c.id === itemId);

  if (existingItem) {
    // Item already in cart, remove it (toggle behavior)
    removeFromCart(itemId);
    showToast(`${item[columnNames.ITEM_NAME]} removed from cart`, 'success');
    return;
  }

  // Add new item
  const cartItem = {
    id: itemId,
    name: item[columnNames.ITEM_NAME],
    category: item[columnNames.CATEGORY] || 'Uncategorized',
    quantity: 1,
    unit: item[columnNames.UNIT] || '',
    timestamp: Date.now()
  };
  cart.push(cartItem);

  saveCart();
  updateCartUI();
  renderTable();
  renderCards();
  renderPriorityLists();
  showToast(`${item[columnNames.ITEM_NAME]} added to cart`, 'success');
}

// Update item quantity in cart
function updateCartQuantity(itemId, newQuantity) {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;

    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }

    item.quantity = newQuantity;
    saveCart();
    updateCartUI();
}

// Remove item from cart
function removeFromCart(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  saveCart();
  updateCartUI();
  renderTable();
  renderCards();
  renderPriorityLists();
}

// Clear entire cart
function clearCart() {
    if (cart.length === 0) return;

    if (confirm('Are you sure you want to clear your shopping cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
        showToast('Cart cleared', 'success');
    }
}

// Copy cart to clipboard
function copyCartToClipboard() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }

    const date = new Date().toLocaleDateString();
    let text = `Shopping List (${date})\n`;
    text += '='.repeat(30) + '\n\n';

    // Simple flat list
    cart.forEach((item, index) => {
        text += `${index + 1}. ${item.name} - ${item.quantity} ${item.unit || 'pcs'}\n`;
    });

    text += '\n' + '='.repeat(30);
    text += `\nTotal items: ${cart.length}`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Shopping list copied to clipboard', 'success');
    }).catch(() => {
        showToast('Failed to copy to clipboard', 'error');
    });
}

// Add to cart from priority list
function addToCartFromPriority(button, rowIndex) {
  const item = allItems.find(i => i._rowIndex === rowIndex);
  if (!item) return;

  addToCart(item);
}

// Add to cart from inventory table/cards
function addToCartFromInventory(rowIndex) {
  const item = allItems.find(i => i._rowIndex === rowIndex);
  if (!item) return;

  addToCart(item);
}

// Update cart UI (badge and dropdown)
function updateCartUI() {
  // Store reference to active element and cart dropdown state
  const activeElement = document.activeElement;
  const activeInputId = activeElement && activeElement.closest('.cart-item') 
    ? activeElement.closest('.cart-item').dataset.id 
    : null;
  const wasInputFocused = activeElement && activeElement.tagName === 'INPUT';

  // Update badge count - count unique items, not total quantity
  const cartCount = document.getElementById('cart-count');
  const itemCount = cart.length;
  cartCount.textContent = itemCount;
  cartCount.style.display = itemCount > 0 ? 'block' : 'none';

  // Update dropdown
  const cartItems = document.getElementById('cart-items');
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-basket"></i>
        <p>Your cart is empty</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.category}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-qty-control">
            <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <input type="number" value="${item.quantity}" min="1" data-item-id="${item.id}"
              onchange="updateCartQuantity('${item.id}', parseInt(this.value) || 1)">
            <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Restore focus if an input was focused
  if (wasInputFocused && activeInputId) {
    const newInput = cartItems.querySelector(`input[data-item-id="${activeInputId}"]`);
    if (newInput) {
      newInput.focus();
    }
  }
}

// Get cart item HTML for table/cards
function getAddToCartButton(item, size = '') {
  const isInCart = cart.some(c => c.id === item[columnNames.ITEM_NAME]);
  const btnClass = size === 'sm' ? 'btn-cart-sm' : '';
  const activeClass = isInCart ? 'btn-cart-active' : '';
  const icon = isInCart ? 'fa-check' : 'fa-cart-plus';
  const text = isInCart ? 'Added' : 'Add to Cart';

  return `<button class="btn btn-cart ${btnClass} ${activeClass}" onclick="addToCartFromButton(this, ${item._rowIndex})" title="${isInCart ? 'Remove from Cart' : 'Add to Cart'}">
    <i class="fas ${icon}"></i> ${text}
  </button>`;
}

// Add to cart from button click (for table/cards)
function addToCartFromButton(button, rowIndex) {
  const item = allItems.find(i => i._rowIndex === rowIndex);
  if (!item) return;

  addToCart(item);
}
