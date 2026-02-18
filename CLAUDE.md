# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Grocery inventory management application using Google Sheets as a backend database via Google Apps Script. Migrated from vanilla JavaScript to React + TypeScript with Vite build system.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Google Apps Script deployed as web app
- **Data Flow**: React Components → Context API → API Service → Google Apps Script → Google Sheets

## Project Structure
```
├── index.html                    # Vite entry HTML
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite with path aliases (@/*)
├── src/
│   ├── main.tsx                  # App entry with Context providers
│   ├── App.tsx                   # Main app component
│   ├── index.css                 # Global CSS variables
│   ├── types/                    # TypeScript definitions
│   │   ├── inventory.ts
│   │   ├── cart.ts
│   │   ├── config.ts
│   │   ├── api.ts
│   │   └── filters.ts
│   ├── context/                  # React Context
│   │   ├── ConfigContext.tsx     # Script URL management
│   │   ├── InventoryContext.tsx  # CRUD operations + dropdown data
│   │   └── CartContext.tsx       # Shopping cart + localStorage
│   ├── hooks/                    # Custom hooks
│   │   ├── useFilters.ts
│   │   ├── useResponsive.ts
│   │   └── useStats.ts
│   ├── services/                 # API layer + localStorage
│   │   ├── api/
│   │   │   ├── endpoints.ts      # API action constants
│   │   │   └── googleSheets.ts   # Fetch wrappers
│   │   └── storage/
│   │       └── localStorage.ts   # Storage helpers
│   └── components/
│       ├── common/               # Button, Modal, Spinner, Toast
│       ├── layout/               # Header, StatsGrid
│       ├── filters/              # FilterBar, SearchInput, CategoryFilter, StatusFilter
│       ├── inventory/            # Desktop table + Mobile cards
│       │   ├── desktop/
│       │   └── mobile/
│       ├── priority/             # PrioritySection (Immediate Buy/Later)
│       ├── cart/                 # CartButton, CartDropdown, CartItem
│       └── modals/               # ItemModal, DeleteModal, ConfigModal
├── google-apps-script/
│   └── Code.gs                   # Backend API
├── legacy/                       # Original vanilla JS preserved
│   ├── index.html
│   ├── css/style.css
│   └── js/script.js
└── img/
    └── background.svg
```

## API Endpoints (Google Apps Script)
| Action | Method | Description |
|--------|--------|-------------|
| `getData` | GET | Retrieve all inventory items |
| `getDropdowns` | GET | Get unique categories, units, stock statuses |
| `getConfig` | GET | Get column configuration |
| `addItem` | POST | Add new item |
| `updateItem` | POST | Update existing item |
| `deleteItem` | POST | Delete item by row index |
| `setConfig` | POST | Update column configuration |

## Key Conventions
- **Column names are configurable** via `CONFIG.COLUMNS` in Code.gs; frontend uses `columnNames` from InventoryContext
- **Path aliases** - use `@/` prefix for imports (e.g., `@/components/common/Button`)
- **localStorage keys**: `groceryCart` (cart items), `scriptUrl` (GAS URL)
- **Type safety** - all data structures defined in `src/types/`
- **Context providers**: Wrap app in Config → Inventory → Cart → Toast order
- **Mobile-first responsive** - table/desktop, cards/mobile views

## React Context Structure
- **InventoryContext**: All items, categories/units/statuses, CRUD operations, column mapping
- **CartContext**: Cart items with useReducer, localStorage persistence
- **ConfigContext**: Script URL (from localStorage)
- **ToastProvider**: Toast notifications via useToast hook

## Main Hooks
- **useFilters**: Manages filter state (category, status, search) + returns filteredItems
- **useStats**: Returns total/finished/half/full item counts
- **usePriorityItems**: Returns immediate (Empty) and later (Half) items
- **useResponsive**: Returns isMobile/isDesktop via window.innerWidth
- **useCart**: Access to cart operations
- **useConfig**: Access to script URL

## Google Sheet Required Columns
Default: `Item Name`, `Category`, `Stock Status`, `Quantity`, `Unit`, `Last Updated`, `Notes`

## Stock Status Values
- `Full` - Stock is full
- `Half` - Running low
- `Empty`/`Finished` - Out of stock (triggers "Immediate Buy" priority)

## Development Commands
```bash
npm install         # Install dependencies
npm run dev         # Start Vite dev server (http://localhost:5173)
npm run build       # Build for production (outputs to dist/)
npm run preview     # Preview production build
```

## Deployment
1. Deploy `google-apps-script/Code.gs` as Google Apps Script web app (Execute as: Me, Access: Anyone)
2. Run `npm run build` to create production build
3. Deploy `dist/` folder to static hosting (GitHub Pages, Netlify, Vercel, etc.)
4. Configure script URL via gear icon in the app

## Legacy Code
Original vanilla JavaScript implementation is preserved in `legacy/` folder for rollback reference.

## Migration Notes (Vanilla JS → React + TS)
- **State**: Global vars → React Context + useReducer
- **DOM**: Direct manipulation → React components with JSX
- **Events**: Inline onclick="..." → React event handlers
- **Templates**: String HTML → TypeScript JSX components
- **Filtering**: Manual DOM updates → Derived state with useMemo
- **Cart**: Direct localStorage → Context + useReducer + useEffect persistence
