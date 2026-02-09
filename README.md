# Battery Store POS - Web Application

A modern, cross-platform Point of Sale system built with React and IndexedDB. Works on desktop, tablet, and mobile devices.

## Features

✅ **Works Offline** - All data stored locally in browser (IndexedDB)
✅ **Cross-Platform** - Desktop, laptop, tablet, phone
✅ **Fast & Responsive** - No server lag, instant operations
✅ **Print Receipts** - Browser print with formatted receipts
✅ **Sales History** - Load, edit, and delete past sales
✅ **Product Management** - Easy product lookup and pricing
✅ **Duplicate Detection** - Warns before overwriting sales

## Tech Stack

- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Dexie.js** - IndexedDB wrapper (local database)
- **Tailwind CSS** - Utility-first styling
- **IndexedDB** - Browser-native database (no server needed)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open browser to: `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output will be in the `dist` folder. Deploy to:
- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Drag & drop the `dist` folder
- **GitHub Pages**: Copy `dist` contents to `gh-pages` branch

## Usage

### Adding Items
- Click product buttons to add items to cart
- Quantity can be adjusted with +/- or direct input
- Remove items with the ✕ button

### Saving Sales
1. Add items to cart
2. Select payment method (Cash/Card/Check)
3. Enable/disable tax with checkbox
4. Click **Save** button
5. Sale ID is auto-assigned

### Loading Sales
1. Click **Load** button
2. Enter Sale ID
3. Sale loads into form for viewing/editing

### Printing Receipts
1. Click **Print** button
2. Auto-saves if modified or unsaved
3. Browser print dialog opens
4. Receipt includes Sale ID, items, totals

### Deleting Sales
1. Click **Delete** button
2. Confirm deletion
3. Removes from database permanently

## Database Structure

### Sales Table
- `id` - Auto-incrementing Sale ID
- `saleDate` - Timestamp of sale
- `subtotal` - Total before tax
- `tax` - Calculated tax amount
- `total` - Final total
- `method` - Payment method (Cash/Card/Check)

### SaleLines Table
- `id` - Auto-incrementing line ID
- `saleId` - Foreign key to Sales
- `item` - Product name
- `qty` - Quantity sold
- `price` - Unit price
- `lineTotal` - Line total (qty × price)

### Products Table
- `name` - Product name (primary key)
- `price` - Unit price

## Comparison: Excel VBA vs Web App

| Feature | Excel VBA | Web App |
|---------|-----------|---------|
| Platform | Windows only | Any device |
| Installation | Office required | Just a browser |
| Offline | ✅ Yes | ✅ Yes |
| Mobile | ❌ No | ✅ Yes |
| Speed | Good | Excellent |
| Updates | Manual | Auto (if hosted) |
| Multi-user | Manual sync | Can add cloud sync |
| Cost | Office license | Free |

## Adding Cloud Sync (Optional)

To sync data across devices, add Supabase:

1. Create free Supabase account
2. Create tables matching schema
3. Add sync functions in `db.js`:

```javascript
// Sync local changes to cloud
async function syncToCloud() {
  const localSales = await db.sales.toArray();
  // Upload to Supabase
  await supabase.from('sales').upsert(localSales);
}

// Pull cloud changes to local
async function syncFromCloud() {
  const { data } = await supabase.from('sales').select('*');
  await db.sales.bulkPut(data);
}
```

4. Call sync functions on app load/save

## Customization

### Change Tax Rate
Edit `taxRate` in `src/POS.jsx`:
```javascript
const taxRate = 0.0762; // Change to your rate
```

### Add Products
Edit `initializeSampleData()` in `src/db.js`:
```javascript
await db.products.bulkAdd([
  { name: 'YourProduct', price: 99.99 },
  // Add more...
]);
```

### Styling
Edit Tailwind classes in `src/POS.jsx` or add custom CSS to `src/index.css`

### Store Info
Update receipt header in print section of `src/POS.jsx`:
```javascript
<h1>Your Store Name</h1>
```

## Browser Support

- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Data Storage

Data is stored locally in IndexedDB:
- **Location**: Browser's local storage
- **Persistence**: Survives page refresh
- **Capacity**: Several hundred MB typically
- **Privacy**: Data never leaves device (unless you add cloud sync)

## Backup & Export

To backup data:
1. Open browser console (F12)
2. Run:
```javascript
// Export all data
const data = {
  sales: await db.sales.toArray(),
  saleLines: await db.saleLines.toArray(),
  products: await db.products.toArray()
};
console.log(JSON.stringify(data));
// Copy output and save to file
```

## Troubleshooting

**Items not saving:**
- Check browser console for errors
- Ensure IndexedDB is enabled in browser settings
- Try incognito mode to test without extensions

**Print not working:**
- Ensure browser print is allowed
- Check print preview in browser
- Try different browser if issues persist

**Slow performance:**
- Clear old sales periodically
- Check browser storage limits
- Close other tabs/apps

## Future Enhancements

- [ ] Cloud sync with Supabase
- [ ] Multi-user/multi-device support
- [ ] Sales reports and analytics
- [ ] Barcode scanner support
- [ ] Customer management
- [ ] Inventory tracking
- [ ] Receipt email/SMS
- [ ] PWA offline mode
- [ ] Export to CSV/PDF

## License

MIT License - Free to use and modify

## Support

For issues or questions, create an issue on GitHub.

---

Built with ❤️ using React + Dexie.js
