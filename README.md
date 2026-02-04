# Leridia Jewels - Inventory Management System

A modern, professional inventory management system for Leridia Jewels with white/gold theme, dual-market pricing, comprehensive jewelry categorization, and advanced analytics.

## 🌟 Features

### Core Functionality
- **Comprehensive Jewelry Categories**: Earrings, Necklaces, Rings, Bracelets/Bangles, Anklets, and Accessories
- **Dual Market Pricing**: Separate pricing for local and abroad markets (KSH)
- **Stock Management**: Track quantity (pieces) with low-stock alerts
- **Weight Tracking**: Optional weight field in grams
- **SKU Auto-Generation**: Automatic SKU creation based on category and type

### Image Management (NEW!)
- **Flexible Image Options**: Each market (local/abroad) supports:
  - File upload (converted to base64)
  - Image URL input
  - Both options available simultaneously
- **Image Previews**: Real-time preview for all 4 image inputs
- **Lightbox Viewer**: Click any product image to view in full-screen lightbox

### User Interface
- **Bolder Gold Theme**: Enhanced gold accents (#B8860B, #DAA520, #8B6914)
- **Horizontal Form Layout**: 3-column layout for efficient space utilization
- **Responsive Design**: Mobile-first with breakpoints at 1024px, 768px, 480px
- **Hamburger Menu**: Mobile navigation with smooth transitions
- **Table/Grid Views**: Toggle between list and card views
- **Bulk Actions**: Multi-select with checkboxes for batch operations
  - Bulk delete with confirmation
  - CSV export of selected items

### Dashboard Analytics (NEW!)
- **Category Distribution Chart**: Doughnut chart showing product breakdown
- **Profit Margin Analysis**: Bar chart comparing local vs abroad margins
- **Real-time Statistics**: Total products, low stock alerts, in-stock count
- **Recent Products**: Quick view of latest additions

### Advanced Features
- **Advanced Filters**:
  - Category filter
  - Price range (local/abroad)
  - Stock level filter
  - Quality filter
- **Search**: Real-time product search
- **Column Management**: Show/hide table columns
- **Keyboard Shortcuts**:
  - `Ctrl+N`: Add new product
  - `Escape`: Close modals
- **Auto-Save Drafts**: Form data preservation
- **Confirmation Dialogs**: Safe delete operations
- **Loading States**: Visual feedback for async operations

### Data Management
- **Supabase Integration**: Cloud database with PostgreSQL
- **Offline Mode**: localStorage fallback when offline
- **Real-time Sync**: Manual sync button for cloud updates
- **CSV Export**: Export inventory to spreadsheet

## Categories

- Earrings (Studs, Hoops, Drop, Huggie, Statement, Fashion)
- Necklaces (Choker, Collar, Princess, Matinee, Opera, Rope/Lariat)
- Rings (Fashion, Promise, Signet, Cocktail, Birthstone, and more)
- Bracelets/Bangles (Bangles, Cuffs, Chain, Tennis, and more)
- Anklets (Chain, Beaded, Charm, Layered)
- Accessories (Hair pins, Charms, Gift boxes, Packaging)

## Quality Options

- Gold plated
- Stainless steel
- Gemstones
- Silver 925
- Brass

## Setup

### Local Development
Simply open `index.html` in a web browser. Data is stored in localStorage.

### Supabase Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase-schema.sql`
4. The app will automatically connect and sync

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Deploy - no build configuration needed
3. Your site will be live!

## Tech Stack

- HTML5
- CSS3 (Modern design with gold accents)
- Vanilla JavaScript
- Supabase (PostgreSQL database)
- Netlify (Hosting)

## License

© 2026 Leridia Jewels. All rights reserved.
