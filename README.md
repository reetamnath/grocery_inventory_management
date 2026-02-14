# Grocery Inventory Manager

A web-based application for managing household grocery inventory with real-time tracking, shopping cart functionality, and Google Sheets integration.

## Features

- **Inventory Tracking**: Monitor grocery items with quantities and stock status (Full, Half, Running Low)
- **Category Management**: Organize items by categories (Rice, Lentils, Dairy, Nuts, Vegetables, Fruits, Spices, etc.)
- **Priority Lists**: Automatic grouping of items needing immediate attention
  - **Immediate Buy**: Items with Empty/Finished status (red indicator)
  - **Some Week Later**: Items with Half/Running Low status (yellow indicator)
- **Shopping Cart**: Add items to a shopping list with quantity controls
- **Real-time Statistics**: Dashboard showing total items and stock distribution
- **Mobile Responsive**: Works on desktop and mobile devices
- **Cloud Storage**: Uses Google Sheets as the backend database

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Apps Script (Google Sheets as database)
- **Styling**: Custom CSS with CSS variables, Inter font, Font Awesome icons
- **Storage**: Google Sheets (cloud), localStorage (cart persistence)

## Setup Instructions

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet
2. Rename the sheet to `Inventory List`
3. Add the following headers in the first row (Row 1):
   - Column A: Item Name
   - Column B: Category
   - Column C: Stock Status
   - Column D: Quantity
   - Column E: Unit
   - Column F: Last Updated
   - Column G: Notes

### Step 2: Deploy Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete the default `myFunction` code
3. Copy the entire content from `google-apps-script/Code.gs` file in this repository
4. Paste it into the Apps Script editor
5. Save the project (Ctrl+S or Cmd+S)
6. Click **Deploy** → **New deployment**
7. Select type: **Web app**
8. Configure deployment:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy** and authorize the script
10. Copy the **Web App URL** (you'll need this in Step 4)

### Step 3: Deploy Frontend

#### Option A: GitHub Pages (Recommended)
1. Fork this repository to your GitHub account
2. Go to **Settings** → **Pages**
3. Set source to your main branch
4. Your app will be available at `https://yourusername.github.io/grocery-inventory-app`

#### Option B: Local Testing
1. Download or clone this repository
2. Open `index.html` in your web browser

#### Option C: Other Hosting
Upload the following files to any static hosting service:
- `index.html`
- `css/style.css`
- `js/script.js`
- `img/background.svg` (optional)

### Step 4: Configure the App

1. Open the deployed app in your browser
2. Click the **gear icon** (Configuration) in the top right
3. Paste your **Google Apps Script Web App URL**
4. Click **Save Configuration**
5. The app will automatically load your inventory data

## Sample Google Sheet Structure

| Item Name | Category | Stock Status | Quantity | Unit | Last Updated | Notes |
|-----------|----------|--------------|----------|------|--------------|-------|
| Milk | Dairy | Full | 2 | ltr | 2026-02-14 | Full cream |
| Almonds | Nuts | Running Low | 100 | g | 2026-02-14 | Soaked overnight |
| Turmeric | Spices | Half | 50 | g | 2026-02-14 | Organic |

### Valid Stock Status Values

- `Full` - Stock is full
- `Half` - Stock is halfway
- `Running Low` - Stock is running low
- `Empty` or `Finished` - Out of stock (triggers "Immediate Buy" priority)

## Project Structure

```
grocery-inventory-app/
├── index.html              # Main application file
├── css/
│   └── style.css          # Application styles
├── js/
│   └── script.js          # Application logic
├── google-apps-script/
│   └── Code.gs            # Backend Google Apps Script
├── img/
│   └── background.svg     # Background graphic
├── README.md              # This file
├── SETUP-GUIDE.md         # Detailed setup documentation
└── LICENSE                # Apache License 2.0
```

## Publishing to GitHub

### Before Publishing

1. **Remove sensitive data**: Ensure no personal Google Apps Script URLs or API keys are hardcoded
2. **Update README**: Customize this README with your project details
3. **Add screenshots** (optional): Include screenshots in an `assets/` folder
4. **Create a `.gitignore`** file:
   ```
   .DS_Store
   Thumbs.db
   *.log
   .env
   ```

### Publishing Steps

1. Initialize Git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/grocery-inventory-app.git
   git branch -M main
   git push -u origin main
   ```

4. Enable GitHub Pages in repository settings (optional, for live demo)

## Usage

### Adding Items
- Click **Add Item** button
- Fill in item details
- Click **Add to Inventory**

### Editing Items
- Click the **pencil icon** next to any item
- Update the fields
- Click **Update Item**

### Using Shopping Cart
- Click **cart icon** on any item to add to shopping list
- View cart by clicking **Shopping Cart** button
- Adjust quantities or remove items
- Copy cart to clipboard for sharing

### Filtering and Search
- Use dropdown filters to filter by category or stock status
- Use search box to find items by name

## API Endpoints

The Google Apps Script provides the following endpoints:

| Action | Method | Description |
|--------|--------|-------------|
| `getData` | GET | Retrieve all inventory items |
| `getDropdowns` | GET | Get unique categories, units, stock statuses |
| `addItem` | POST | Add new item |
| `updateItem` | POST | Update existing item |
| `deleteItem` | POST | Delete item by row index |

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
- Check the [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed instructions
- Open an issue on GitHub
- Contact the maintainer

## Acknowledgments

- Google Apps Script for providing the backend infrastructure
- Font Awesome for the icon library
- Google Fonts for the Inter typeface
