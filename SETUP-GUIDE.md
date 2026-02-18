# Grocery Inventory Manager - Setup Guide

A modern, responsive web application for managing your grocery inventory using Google Sheets as a database.

## Features

- **Single Page Application** - All features on one page for easy access
- **Real-time Sync** - Changes sync instantly with your Google Sheet
- **Mobile-First Design** - Optimized for both mobile phones and desktop
- **Smart Categories** - Organize items by categories (Rice, Lentils, Dairy, etc.)
- **Stock Status Tracking** - Visual indicators for Full, Half, and Finished items
- **Shopping Lists** - Automatic "Immediate Buy" and "Some Week Later" lists
- **Dynamic Dropdowns** - Categories and units auto-sync from your sheet
- **Full CRUD Operations** - Add, edit, delete, and view all items
- **Search & Filter** - Quickly find items by name, category, or status

## Quick Setup (5 minutes)

### Step 1: Prepare Your Google Sheet

1. Open Google Sheets and create a new spreadsheet
2. Rename the first sheet to: `Inventory List`
3. Create these columns in Row 1 (exact names):
   - A: `Item Name` (Text)
   - B: `category` (Text - will become dropdown in the app)
   - C: `Stock Status` (Text)
   - D: `#Quantity` (Number)
   - E: `unit` (Text - will become dropdown in the app)
   - F: `Last Updated` (Date - auto-populated)
   - G: `Notes` (Text)

### Step 2: Add Sample Data (Optional but Recommended)

Add a few sample rows to test the app:

| Item Name | category | Stock Status | #Quantity | unit | Last Updated | Notes |
|-----------|----------|--------------|-----------|------|--------------|-------|
| Basmati Rice | Rice | Half | 2 | kg | (leave empty) | Premium quality |
| Masoor Dal | Lentils | Finished | 0 | kg | (leave empty) | Need to buy |
| Milk | Dairy | Full | 2 | liter | (leave empty) | Fresh |

### Step 3: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor
3. Copy the entire content from `google-apps-script/Code.gs` file
4. Paste it into the Apps Script editor
5. Click **Save** (floppy disk icon) or press `Ctrl+S`
6. Click **Deploy** → **New deployment**
7. Click the gear icon next to "Select type" and choose **Web app**
8. Configure:
   - Description: "Grocery Inventory API"
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy**
10. Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### Step 4: Deploy Frontend to GitHub Pages

This project uses the same repository for deployment by committing the `dist/` folder.

1. **Build the project**:
   ```bash
   npm install
   npm run build
   ```
   This creates a `dist/` folder with the optimized production files.

2. **Commit the dist folder to your repository**:
   ```bash
   git add dist/
   git commit -m "Add production build"
   git push origin main
   ```

3. **Configure GitHub Pages**:
   - Go to your repository **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Select **main** branch and **/docs** folder (see step 4)
   - Click **Save**

4. **Point GitHub Pages to the dist folder**:

   Since GitHub Pages can only serve from specific folders, you have two options:

   **Option A: Rename dist to docs** (simpler, no extra tools)
   ```bash
   # Remove dist from git tracking but keep files locally
   git rm -r --cached dist/

   # Rename the folder
   git mv dist docs

   # Commit and push
   git commit -m "Rename dist to docs for GitHub Pages"
   git push origin main
   ```
   Then in GitHub Pages settings, select **main** branch and **/docs** folder.

   **Option B: Use gh-pages branch** (cleaner history)
   - Install: `npm install --save-dev gh-pages`
   - Add to `package.json` scripts: `"deploy": "npm run build && gh-pages -d dist"`
   - Run: `npm run deploy`
   - In GitHub Pages settings, select **gh-pages** branch and **/root** folder.

5. **Wait 1-2 minutes** for deployment to complete.

6. **Your app will be live at**: `https://YOUR_USERNAME.github.io/REPO_NAME`

> **Tip**: Add `dist/` or `docs/` to your `.gitignore` if you prefer not to commit builds. Use Option B (gh-pages branch) in that case.

### Step 5: Configure the App

1. Open your deployed app URL
2. Click the **Config** button (gear icon) in the top right
3. Paste your Google Apps Script Web App URL
4. Click **Save Configuration**
5. The app will automatically load your inventory data!

## Usage Guide

### Adding Items

1. Click **Add Item** button
2. Fill in the form:
   - **Item Name**: Required (e.g., "Basmati Rice")
   - **Category**: Select from dropdown or type new
   - **Stock Status**: Choose Full, Half, or Finished
   - **Quantity**: Enter number (e.g., 2)
   - **Unit**: Select from dropdown or type new (e.g., "kg", "liter", "pieces")
   - **Notes**: Optional notes about the item
3. Click **Save Item**

### Editing Items

1. Find the item in the grid
2. Click the **Edit** button (pencil icon)
3. Update the fields
4. Click **Save Item**

### Deleting Items

1. Find the item in the grid
2. Click the **Delete** button (trash icon)
3. Confirm deletion in the popup

### Using the Shopping Lists

- **Immediate Buy** (Red): Shows items with "Finished" status - buy these now!
- **Some Week Later** (Yellow): Shows items with "Half" status - plan to buy soon

### Filtering Items

- Use **Search** to find items by name
- Use **Category Filter** to view items by category
- Use **Stock Status Filter** to see only Full, Half, or Finished items
- Click category tabs below "All Inventory Items" to quickly filter

## Tips for Best Experience

### Mobile Usage

- The app is fully responsive and works great on phones
- Add the web app to your home screen:
  - **iPhone**: Share → Add to Home Screen
  - **Android**: Menu (⋮) → Add to Home screen

### Organizing Your Sheet

- **Categories**: Use consistent categories like "Rice", "Lentils", "Dairy", "Nuts", "Vegetables", "Fruits", etc.
- **Units**: Use standard units like "kg", "g", "liter", "ml", "pieces", "packs", "bottles"
- **Stock Status**: 
  - **Full**: You have plenty
  - **Half**: Running low, plan to buy
  - **Finished**: Out of stock, buy immediately

### Regular Maintenance

- Update stock status regularly when you use items
- Update quantities when you buy new groceries
- The "Last Updated" field auto-updates whenever you modify an item

### Backup Your Data

Since your data lives in Google Sheets:
- It's automatically backed up to Google Drive
- You can export the sheet anytime as Excel or CSV
- The data persists even if you redeploy the app

## Troubleshooting

### "Error loading data"

1. Check that your Google Apps Script URL is correct
2. Verify the sheet name is exactly `Inventory List`
3. Make sure column headers match exactly (case-sensitive)
4. Ensure the script is deployed with "Anyone" access

### Changes not reflecting

1. Click the **Refresh** button in the app
2. Check that the script is saved and deployed
3. Clear browser cache and reload

### Dropdown values not syncing

- Dropdown values are pulled from existing data in your sheet
- Add at least one item with a category and unit for them to appear

### App not loading

1. Check your internet connection
2. Verify GitHub Pages is enabled in your repository settings
3. Make sure `index.html` is in the root of your repository

## Security Notes

- Your Google Sheet data is protected by Google's security
- The web app uses read-only access unless you authenticate
- No sensitive data is stored in the frontend code
- Consider adding authentication if sharing publicly

## Customization

### Changing Colors

Edit the CSS variables in `index.html`:
```css
:root {
    --primary-color: #10b981;    /* Green */
    --secondary-color: #3b82f6;  /* Blue */
    --danger-color: #ef4444;     /* Red */
    --warning-color: #f59e0b;    /* Yellow */
}
```

### Adding More Columns

To add custom columns:
1. Add the column to your Google Sheet
2. Update the `Code.gs` file to handle the new column
3. Add corresponding form fields in the HTML

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Verify all setup steps were completed correctly
3. Test the Google Apps Script directly in the Apps Script editor
4. Make sure your Google account has permission to access the sheet

## License

This project is open source. Feel free to modify and use it for your personal grocery management needs!

---

**Happy Inventory Management!** 🛒✨
