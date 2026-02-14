/**
 * Grocery Inventory Management - Google Apps Script Backend
 * Deploy as Web App with "Execute as me" and "Anyone" access
 * 
 * CONFIGURATION: Column names can be customized below or passed from frontend
 */

// ============================================
// CONFIGURATION - Update these to match your sheet
// ============================================
const CONFIG = {
  SHEET_NAME: 'Inventory List',
  // Column mapping - update these to match your sheet headers exactly
  COLUMNS: {
    ITEM_NAME: 'Item Name',
    CATEGORY: 'Category',
    STOCK_STATUS: 'Stock Status',
    QUANTITY: 'Quantity',
    UNIT: 'Unit',
    LAST_UPDATED: 'Last Updated',
    NOTES: 'Notes'
  },
  // Default dropdown values (optional - will be overridden by sheet data)
  DEFAULT_CATEGORIES: ['Rice', 'Lentils', 'Dairy', 'Nuts', 'Vegetables', 'Fruits', 'Spices', 'Other'],
  DEFAULT_UNITS: ['kg', 'g', 'liter', 'ml', 'pieces', 'packs', 'bottles', 'cans'],
  DEFAULT_STOCK_STATUSES: ['Full', 'Half', 'Empty']
};

// Store configuration in script properties for persistence
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

/**
 * Initialize configuration - call this once after deployment
 */
function initializeConfig(customConfig) {
  if (customConfig) {
    SCRIPT_PROPERTIES.setProperty('CONFIG', JSON.stringify(customConfig));
  }
}

/**
 * Get current configuration
 */
function getConfig() {
  const storedConfig = SCRIPT_PROPERTIES.getProperty('CONFIG');
  if (storedConfig) {
    return JSON.parse(storedConfig);
  }
  return CONFIG;
}

/**
 * Web app entry point - handles HTTP requests
 */
function doGet(e) {
  const action = e.parameter.action;
  
  // Allow passing custom column configuration via query parameter
  if (e.parameter.config) {
    try {
      const customConfig = JSON.parse(e.parameter.config);
      initializeConfig(customConfig);
    } catch (err) {
      console.log('Invalid config parameter, using default');
    }
  }
  
  try {
    switch(action) {
      case 'getData':
        return jsonResponse(getAllItems());
      case 'getDropdowns':
        return jsonResponse(getDropdownValues());
      case 'getConfig':
        return jsonResponse({ config: getConfig() });
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Handle POST requests (add, update, delete)
 */
function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);
  
  try {
    switch(action) {
      case 'addItem':
        return jsonResponse(addItem(data));
      case 'updateItem':
        return jsonResponse(updateItem(data));
      case 'deleteItem':
        return jsonResponse(deleteItem(data.rowIndex));
      case 'setConfig':
        initializeConfig(data.config);
        return jsonResponse({ success: true, message: 'Configuration updated' });
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * Get all items from the inventory sheet
 */
function getAllItems() {
  const config = getConfig();
  const sheet = getSheet();
  if (!sheet) {
    throw new Error('Sheet "' + config.SHEET_NAME + '" not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const items = [];
  
  // Build column index map
  const columnMap = {};
  for (const [key, colName] of Object.entries(config.COLUMNS)) {
    columnMap[key] = headers.indexOf(colName);
  }
  
  // Start from row 2 (index 1) to skip headers
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const item = {};
    
    // Map data using column names
    for (const [key, colIndex] of Object.entries(columnMap)) {
      if (colIndex !== -1) {
        let value = row[colIndex];
        
        // Convert date objects to ISO string
        if (value instanceof Date) {
          value = value.toISOString();
        }
        
        item[config.COLUMNS[key]] = value;
      }
    }
    
    item._rowIndex = i + 1; // Store actual row number for updates
    items.push(item);
  }
  
  return { 
    items: items, 
    headers: headers,
    config: config 
  };
}

/**
 * Get unique dropdown values from category and unit columns
 */
function getDropdownValues() {
  const config = getConfig();
  const sheet = getSheet();
  if (!sheet) {
    throw new Error('Sheet not found');
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices using configured names
  const categoryIndex = headers.indexOf(config.COLUMNS.CATEGORY);
  const unitIndex = headers.indexOf(config.COLUMNS.UNIT);
  const stockStatusIndex = headers.indexOf(config.COLUMNS.STOCK_STATUS);
  
  const categories = new Set(config.DEFAULT_CATEGORIES);
  const units = new Set(config.DEFAULT_UNITS);
  const stockStatuses = new Set(config.DEFAULT_STOCK_STATUSES);
  
  // Extract unique values from data rows
  for (let i = 1; i < data.length; i++) {
    if (categoryIndex !== -1 && data[i][categoryIndex]) {
      categories.add(data[i][categoryIndex]);
    }
    if (unitIndex !== -1 && data[i][unitIndex]) {
      units.add(data[i][unitIndex]);
    }
    if (stockStatusIndex !== -1 && data[i][stockStatusIndex]) {
      stockStatuses.add(data[i][stockStatusIndex]);
    }
  }
  
  return {
    categories: Array.from(categories).sort(),
    units: Array.from(units).sort(),
    stockStatuses: Array.from(stockStatuses).sort(),
    config: config
  };
}

/**
 * Add a new item to the inventory
 */
function addItem(itemData) {
  const config = getConfig();
  const sheet = getSheet();
  if (!sheet) {
    throw new Error('Sheet not found');
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = [];
  
  // Build row array based on headers
  for (const header of headers) {
    let value = '';
    
    // Map itemData keys to column names
    for (const [key, colName] of Object.entries(config.COLUMNS)) {
      if (colName === header && itemData[colName] !== undefined) {
        value = itemData[colName];
        break;
      }
    }
    
    // Set Last Updated to current date if not provided
    if (header === config.COLUMNS.LAST_UPDATED && !value) {
      value = new Date();
    }
    
    newRow.push(value || '');
  }
  
  // Append the new row
  sheet.appendRow(newRow);
  
  return { success: true, message: 'Item added successfully' };
}

/**
 * Update an existing item
 */
function updateItem(itemData) {
  const config = getConfig();
  const sheet = getSheet();
  if (!sheet) {
    throw new Error('Sheet not found');
  }
  
  if (!itemData._rowIndex) {
    throw new Error('Row index required for update');
  }
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowIndex = itemData._rowIndex;
  
  // Update each cell in the row
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    let value = null;
    
    // Check if this column is in our configured columns
    for (const [key, colName] of Object.entries(config.COLUMNS)) {
      if (colName === header && itemData[colName] !== undefined) {
        value = itemData[colName];
        break;
      }
    }
    
    if (value !== null) {
      // Update Last Updated timestamp
      if (header === config.COLUMNS.LAST_UPDATED) {
        value = new Date();
      }
      
      sheet.getRange(rowIndex, i + 1).setValue(value);
    }
  }
  
  return { success: true, message: 'Item updated successfully' };
}

/**
 * Delete an item from the inventory
 */
function deleteItem(rowIndex) {
  const sheet = getSheet();
  if (!sheet) {
    throw new Error('Sheet not found');
  }
  
  if (!rowIndex || rowIndex < 2) {
    throw new Error('Invalid row index');
  }
  
  sheet.deleteRow(rowIndex);
  
  return { success: true, message: 'Item deleted successfully' };
}

/**
 * Helper function to get the inventory sheet
 */
function getSheet() {
  const config = getConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(config.SHEET_NAME);
}

/**
 * Helper function to create JSON response with CORS headers
 */
function jsonResponse(data, statusCode) {
  statusCode = statusCode || 200;
  
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

/**
 * Test function to verify setup
 */
function testSetup() {
  try {
    const config = getConfig();
    const sheet = getSheet();
    Logger.log('Sheet found: ' + sheet.getName());
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Headers: ' + headers.join(', '));
    Logger.log('Config columns: ' + JSON.stringify(config.COLUMNS));
    
    // Verify all configured columns exist
    const missingColumns = [];
    for (const [key, colName] of Object.entries(config.COLUMNS)) {
      if (!headers.includes(colName)) {
        missingColumns.push(colName);
      }
    }
    
    if (missingColumns.length > 0) {
      Logger.log('WARNING: Missing columns: ' + missingColumns.join(', '));
    }
    
    const dropdowns = getDropdownValues();
    Logger.log('Categories: ' + dropdowns.categories.join(', '));
    Logger.log('Units: ' + dropdowns.units.join(', '));
    Logger.log('Stock Statuses: ' + dropdowns.stockStatuses.join(', '));
    
    return 'Setup verified successfully!';
  } catch (error) {
    return 'Error: ' + error.message;
  }
}

/**
 * Create/update configuration from frontend
 * Call this with your custom column names
 */
function setupCustomColumns() {
  const customConfig = {
    SHEET_NAME: 'Inventory List',
    COLUMNS: {
      ITEM_NAME: 'Item Name',
      CATEGORY: 'Category',
      STOCK_STATUS: 'Stock Status',
      QUANTITY: 'Quantity',
      UNIT: 'Unit',
      LAST_UPDATED: 'Last Updated',
      NOTES: 'Notes'
    },
    DEFAULT_CATEGORIES: ['Rice', 'Lentils', 'Dairy', 'Nuts', 'Vegetables', 'Fruits', 'Spices'],
    DEFAULT_UNITS: ['kg', 'g', 'liter', 'ml', 'pieces', 'packs'],
    DEFAULT_STOCK_STATUSES: ['Full', 'Half', 'Empty']
  };
  
  initializeConfig(customConfig);
  return 'Custom configuration saved!';
}
