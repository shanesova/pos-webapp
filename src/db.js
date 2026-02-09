import Dexie from "dexie";

// Database schema - mirrors your Excel structure
export const db = new Dexie("POSDatabase");

db.version(1).stores({
  // Sales table (like your Excel Sales sheet)
  // ++id = auto-incrementing primary key
  sales: "++id, saleDate, subtotal, tax, total, method",

  // SaleLines table (like your Excel SaleLines sheet)
  saleLines: "++id, saleId, item, qty, price, lineTotal",

  // Products table (like your Excel Products sheet)
  products: "name, price",
});

// Database operations (like your VBA functions)
export async function saveSale(items, paymentMethod, existingSaleId = null, taxRate = 0.0762) {
  console.log('=== saveSale called ===');
  console.log('Items:', items.length);
  console.log('Payment:', paymentMethod);
  console.log('Existing ID:', existingSaleId);
  
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + tax;
  
  const saleData = {
    saleDate: new Date(),
    subtotal,
    tax,
    total,
    method: paymentMethod
  };

  let saleId;
  if (existingSaleId) {
    saleId = existingSaleId;
    saleData.id = saleId;
    await db.sales.put(saleData);
    // Clear existing lines for this sale
    await db.saleLines.where("saleId").equals(saleId).delete();
  } else {
    // Add to sales table (generates new ID)
    saleId = await db.sales.add(saleData);
  }
  
  console.log('Sale ID used:', saleId);
  
  // Add line items
  for (const item of items) {
    await db.saleLines.add({
      saleId,
      item: item.name,
      qty: item.qty,
      price: item.price,
      lineTotal: item.lineTotal
    });
  }
  
  console.log('=== saveSale completed for ID:', saleId, '===');
  return saleId;
}

// Load a sale by ID (like POS_Load)
export async function loadSale(saleId) {
  const sale = await db.sales.get(saleId);
  if (!sale) return null;

  const lines = await db.saleLines.where("saleId").equals(saleId).toArray();

  return { sale, lines };
}

// Delete a sale (like POS_Delete)
export async function deleteSale(saleId) {
  // Delete from both tables
  await db.saleLines.where("saleId").equals(saleId).delete();
  await db.sales.delete(saleId);
}

// Get all products (for item lookup)
export async function getAllProducts() {
  return await db.products.toArray();
}

// Add/update a product
export async function saveProduct(name, price) {
  await db.products.put({ name, price });
}

// Lookup product price by name (like LookupPrice)
export async function getProductPrice(name) {
  const product = await db.products.get(name);
  return product ? product.price : 0;
}

// Get recent sales (for history/reports)
export async function getRecentSales(limit = 50) {
  return await db.sales.orderBy("saleDate").reverse().limit(limit).toArray();
}

// Update a product (handles rename since name is primary key)
export async function updateProduct(oldName, newName, newPrice) {
  if (oldName !== newName) {
    await db.products.delete(oldName);
  }
  await db.products.put({ name: newName, price: newPrice });
}

// Delete a product
export async function deleteProduct(name) {
  await db.products.delete(name);
}

// Get all sales with their line items
export async function getAllSalesWithLines() {
  const sales = await db.sales.orderBy("saleDate").reverse().toArray();
  const salesWithLines = await Promise.all(
    sales.map(async (sale) => {
      const lines = await db.saleLines.where("saleId").equals(sale.id).toArray();
      return { ...sale, lines };
    })
  );
  return salesWithLines;
}

// Update a sale's metadata
export async function updateSale(saleId, updates) {
  await db.sales.update(saleId, updates);
}

// Initialize with sample products (run once)
export async function initializeSampleData() {
  const count = await db.products.count();
  if (count === 0) {
    // Add sample products (like your Excel Products sheet)
    await db.products.bulkAdd([
      { name: "Adj1", price: 1.0 },
      { name: "Bat45", price: 45.0 },
      { name: "Bat65", price: 65.0 },
      { name: "Bat80", price: 80.0 },
      { name: "Bat100", price: 100.0 },
      { name: "BatUp5", price: 5.0 },
      { name: "CoreDep16", price: 16.0 },
      { name: "CoreDep20", price: 20.0 },
      { name: "RCoreDep16", price: -16.0 },
      { name: "RCoreDep20", price: -20.0 },
      { name: "OAdj1", price: -1.0 },
      { name: "OAdj5", price: -5.0 },
      { name: "OJB-1", price: -1.0 },
      { name: "OJB-9", price: -9.0 },
      { name: "OJB-10c", price: -0.1 },
      { name: "OJB-20c", price: -0.2 },
    ]);
    console.log("Sample products initialized");
  }
}

// Clear all sales data
export async function clearSalesData() {
  await db.saleLines.clear();
  await db.sales.clear();
}

// Helper to convert array of objects to CSV string
export function convertToCSV(data) {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        let val = obj[header];
        if (val instanceof Date) val = val.toISOString();
        if (typeof val === "string" && val.includes(",")) val = `"${val}"`;
        return val === undefined || val === null ? "" : val;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
