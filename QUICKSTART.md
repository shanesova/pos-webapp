# 🚀 QUICK START GUIDE

## Get Running in 5 Minutes

### Step 1: Install Node.js (if not installed)
Download from: https://nodejs.org
Choose LTS version (currently 20.x)

### Step 2: Open Terminal/Command Prompt
- **Windows**: Win+R, type `cmd`, press Enter
- **Mac**: Cmd+Space, type `terminal`, press Enter
- **Linux**: Ctrl+Alt+T

### Step 3: Navigate to Project
```bash
cd path/to/pos-webapp
```

### Step 4: Install Dependencies
```bash
npm install
```
(Takes 1-2 minutes)

### Step 5: Start Development Server
```bash
npm run dev
```

### Step 6: Open Browser
Go to: http://localhost:3000

**That's it! You're running!**

---

## First Use

1. **Add Items**: Click the product buttons (Bat45, Bat60, etc.)
2. **Adjust Quantity**: Change numbers in qty field
3. **Enable Tax**: Check the tax checkbox
4. **Select Payment**: Choose Cash/Card/Check
5. **Click Save**: Sale is saved with auto-generated ID
6. **Click Print**: Receipt opens in print dialog

---

## Testing the System

Try this workflow:

```
1. Click "Bat45" twice → Should add 2 Bat45 @ $45 each
2. Click "Bat60" once → Should add 1 Bat60 @ $60
3. Check "Tax" checkbox → Should calculate 7.62% tax
4. Select "Card" payment
5. Click "Save" → Should save with Sale ID: 1
6. Click "New Sale" → Should clear form
7. Click "Load" → Enter "1" → Should reload Sale ID 1
8. Change Bat45 qty to 3 → Should recalculate
9. Click "Print" → Should prompt to save, then print
10. Click "Delete" → Should delete Sale ID 1
```

---

## What's Included

```
pos-webapp/
├── src/
│   ├── db.js          ← Database (like your Excel tables)
│   ├── POS.jsx        ← Main POS screen (like your Excel sheet)
│   ├── App.jsx        ← App wrapper
│   ├── main.jsx       ← Entry point
│   └── index.css      ← Styles
├── package.json       ← Dependencies
├── vite.config.js     ← Build config
├── tailwind.config.js ← Style config
├── index.html         ← HTML entry
├── README.md          ← Full documentation
├── DEPLOYMENT.md      ← How to deploy online
└── COMPARISON.md      ← Excel vs Web comparison
```

---

## Common Issues

### "npm: command not found"
**Solution**: Install Node.js from nodejs.org

### "Port 3000 already in use"
**Solution**: Change port in vite.config.js or kill process on port 3000

### "Cannot find module"
**Solution**: Run `npm install` again

### Page blank after npm run dev
**Solution**: Check browser console (F12) for errors

---

## Customization Quick Guide

### Change Tax Rate
Edit `src/POS.jsx` line 32:
```javascript
const taxRate = 0.0762; // Change to your rate
```

### Add Products
Edit `src/db.js` lines 89-96:
```javascript
await db.products.bulkAdd([
  { name: 'YourProduct', price: 99.99 },
  // Add more...
]);
```

### Change Store Name
Edit `src/POS.jsx` line 238 (screen) and 268 (receipt):
```javascript
<h1>Your Store Name</h1>
```

### Change Colors
Colors are defined using Tailwind classes in `src/POS.jsx`:
- `bg-blue-500` = Blue background
- `text-white` = White text
- `hover:bg-blue-600` = Darker blue on hover

See: https://tailwindcss.com/docs/customizing-colors

---

## Deploy Online (Free)

### Vercel (Easiest):
```bash
npm install -g vercel
vercel login
vercel
```
**Result**: Live site in 2 minutes

### Netlify:
```bash
npm run build
# Upload 'dist' folder to netlify.com/drop
```
**Result**: Live site immediately

See DEPLOYMENT.md for detailed instructions

---

## Next Steps

1. ✅ Test all functions (New, Save, Load, Delete, Print)
2. ✅ Add your products to database
3. ✅ Customize store name and tax rate
4. ✅ Test on phone/tablet (responsive design)
5. ✅ Deploy online (optional)
6. ✅ Add cloud sync (optional, see README)

---

## Getting Help

- Read README.md for full documentation
- Check COMPARISON.md to see how it maps to your Excel version
- Review DEPLOYMENT.md for hosting options
- Browser console (F12) shows errors

---

## Key Differences from Excel

| What | Excel VBA | Web App |
|------|-----------|---------|
| Start | Open file, enable macros | Open browser to URL |
| Speed | Good | Faster |
| Mobile | No | Yes |
| Offline | Yes | Yes |
| Multi-user | No (manual) | Can add |
| Cost | Office license | Free |

---

## Performance Tips

- Clear old sales periodically (keeps database small)
- Close unused tabs (frees memory)
- Use Chrome or Edge for best performance
- Enable hardware acceleration in browser settings

---

## Data Backup

**Automatic**: Data persists in browser (IndexedDB)
**Manual**: See README.md for export instructions
**Cloud**: Add Supabase for automatic cloud backup

---

## Support

This is a starter template. You have full access to:
- Source code (modify freely)
- Database (local to your browser)
- Styling (customize colors/layout)
- Logic (add features)

**No vendor lock-in. No subscriptions. You own it.**

---

**You now have a modern, cross-platform POS system based on your Excel VBA logic!** 🎉
