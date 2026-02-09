import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  saveSale,
  loadSale,
  deleteSale,
  getAllProducts,
  getProductPrice,
  initializeSampleData,
  clearSalesData,
  convertToCSV,
  db,
} from "./db";
import DecisionDialog from "./components/DecisionDialog";

export default function POS() {
  // State (like your Excel POS sheet cells)
  const [items, setItems] = useState([]); // Rows 15-214
  const [taxEnabled, setTaxEnabled] = useState(true); // G22
  const [paymentMethod, setPaymentMethod] = useState(""); // G23
  const [currentSaleId, setCurrentSaleId] = useState(null); // G19
  const [isModified, setIsModified] = useState(false); // gReceiptModified
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    options: [],
    onSelect: null,
  });

  const showDecision = (title, message, options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        options,
        onSelect: (choice) => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          resolve(choice);
        },
      });
    });
  };

  // Get products from database (reactive query)
  const products = useLiveQuery(() => getAllProducts(), []);

  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Calculate totals (like RecalcTotals)
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxRate = 0.0762; // 7.62% - match your Excel
  const tax = taxEnabled ? Math.round(subtotal * taxRate * 100) / 100 : 0;
  const total = subtotal + tax;

  // Add item to cart
  const addItem = async (productName) => {
    if (!productName) return;

    const price = await getProductPrice(productName);
    if (price === 0) {
      alert("Product not found");
      return;
    }

    // Check if item already exists
    const existingIndex = items.findIndex((i) => i.name === productName);
    if (existingIndex >= 0) {
      // Increase quantity
      const updated = [...items];
      updated[existingIndex].qty += 1;
      updated[existingIndex].lineTotal = updated[existingIndex].qty * price;
      setItems(updated);
    } else {
      // Add new item
      setItems([
        ...items,
        {
          name: productName,
          qty: 1,
          price,
          lineTotal: price,
        },
      ]);
    }

    setIsModified(true);
  };

  // Update item quantity
  const updateQty = (index, newQty) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }

    const updated = [...items];
    updated[index].qty = newQty;
    updated[index].lineTotal =
      Math.round(newQty * updated[index].price * 100) / 100;
    setItems(updated);
    setIsModified(true);
  };

  // Remove item
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setIsModified(true);
  };

  // New sale (like POS_New)
  const handleNew = async () => {
    if (isModified && items.length > 0) {
      const choice = await showDecision(
        "Clear Sale",
        "Clear current sale? Unsaved changes will be lost.",
        [
          { label: "Clear Sale", value: "clear", variant: "danger" },
          { label: "Keep Working", value: "cancel", variant: "secondary" },
        ]
      );
      if (choice !== "clear") return;
    }

    setItems([]);
    setPaymentMethod("");
    setCurrentSaleId(null);
    setIsModified(false);
  };

  // Save sale (like POS_Save)
  const handleSave = async () => {
    // Validation
    if (items.length === 0) {
      alert("No items to save!");
      return;
    }

    if (!paymentMethod) {
      alert("Select a payment method.");
      return;
    }

    try {
      let savedSaleId;

      // Check for duplicate
      if (currentSaleId) {
        const choice = await showDecision(
          "Duplicate Sale",
          `Sale ${currentSaleId} already exists! What would you like to do?`,
          [
            { label: "YES - Overwrite", value: "overwrite", variant: "danger" },
            { label: "NO - Save as New", value: "new", variant: "primary" },
            { label: "CANCEL", value: "cancel", variant: "secondary" },
          ]
        );

        if (choice === "cancel") return false;

        if (choice === "overwrite") {
          // Overwrite - use same ID
          savedSaleId = await saveSale(items, paymentMethod, currentSaleId);
        } else {
          // Save as new
          savedSaleId = await saveSale(items, paymentMethod);
        }
      } else {
        // New sale
        savedSaleId = await saveSale(items, paymentMethod);
      }

      setCurrentSaleId(savedSaleId);
      setIsModified(false);
      alert(`Sale saved: ${savedSaleId}`);
      return true;
    } catch (error) {
      alert("Error saving: " + error.message);
      return false;
    }
  };

  // Load sale (like POS_Load)
  const handleLoad = async () => {
    const saleIdInput = prompt("Enter Sale ID to load:");
    if (!saleIdInput) return;

    const saleId = parseInt(saleIdInput);
    if (isNaN(saleId)) {
      alert("Please enter a numeric Sale ID.");
      return;
    }

    try {
      const data = await loadSale(saleId);
      if (!data) {
        alert(`Sale ID not found: ${saleId}`);
        return;
      }

      // Load items
      setItems(
        data.lines.map((line) => ({
          name: line.item,
          qty: line.qty,
          price: line.price,
          lineTotal: line.lineTotal,
        })),
      );

      setPaymentMethod(data.sale.method);
      setCurrentSaleId(saleId);
      setIsModified(false);
    } catch (error) {
      alert("Error loading: " + error.message);
    }
  };

  // Delete sale (like POS_Delete)
  const handleDelete = async () => {
    let saleId = currentSaleId;

    if (!saleId) {
      const input = prompt("Enter Sale ID to delete:");
      if (!input) return;
      saleId = parseInt(input);
    }

    if (isNaN(saleId)) {
      alert("Please enter a numeric Sale ID.");
      return;
    }

    const choice = await showDecision(
      "Delete Sale",
      `Are you sure you want to delete sale ${saleId}? This action cannot be undone.`,
      [
        { label: "Delete", value: "delete", variant: "danger" },
        { label: "Cancel", value: "cancel", variant: "secondary" },
      ]
    );

    if (choice !== "delete") return;

    try {
      await deleteSale(saleId);
      handleNew(); // Clear form
      alert(`Deleted sale: ${saleId}`);
    } catch (error) {
      alert("Error deleting: " + error.message);
    }
  };

  // Print receipt (like POS_Print)
  const handlePrint = async () => {
    // Check if needs save
    if (!currentSaleId || isModified) {
      const msg = !currentSaleId
        ? "This sale hasn't been saved yet. Save now before printing?"
        : "This sale has been modified. Save changes before printing?";

      const choice = await showDecision(
        "Save Required",
        msg,
        [
          { label: "Save and Print", value: "save", variant: "primary" },
          { label: "Cancel", value: "cancel", variant: "secondary" },
        ]
      );

      if (choice === "save") {
        const success = await handleSave();
        if (!success) return;
      } else {
        return;
      }
    }

    // Open print window
    window.print();
  };

  const downloadCSV = async (tableName) => {
    try {
      const data = await db[tableName].toArray();
      if (data.length === 0) {
        alert(`No data found in ${tableName} to export.`);
        return;
      }
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Error exporting CSV: " + error.message);
    }
  };

  const handleResetData = async () => {
    const choice = await showDecision(
      "Reset Database",
      "Are you sure you want to clear ALL sales and sale lines? This cannot be undone.",
      [
        { label: "YES - Clear Everything", value: "reset", variant: "danger" },
        { label: "Cancel", value: "cancel", variant: "secondary" },
      ]
    );

    if (choice === "reset") {
      try {
        await clearSalesData();
        handleNew(); // Reset current view
        alert("Database cleared successfully.");
      } catch (error) {
        alert("Error clearing database: " + error.message);
      }
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Recon Battery Warehouse
        </h1>
        {currentSaleId && (
          <p className="text-sm text-gray-600">
            Sale ID: <span className="font-bold">{currentSaleId}</span>
            {isModified && (
              <span className="text-orange-600 ml-2">● Modified</span>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Item Entry */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Items</h2>

            {/* Quick Add Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
              {products?.map((product) => (
                <button
                  key={product.name}
                  onClick={() => addItem(product.name)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {product.name} (${product.price})
                </button>
              ))}
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No items. Click a button above to add items.
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1 font-medium">{item.name}</div>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(index, parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border rounded"
                      min="0"
                    />
                    <div className="w-24 text-right">
                      ${item.price.toFixed(2)}
                    </div>
                    <div className="w-24 text-right font-bold">
                      ${item.lineTotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Totals & Actions */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Totals</h2>

            <div className="space-y-2 text-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => {
                      setTaxEnabled(e.target.checked);
                      setIsModified(true);
                    }}
                    className="w-4 h-4"
                  />
                  <span>Tax (7.62%):</span>
                </label>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-2xl pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Payment Method:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setIsModified(true);
                }}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Select...</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Check">Check</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-2">
              <button
                onClick={handleNew}
                className="w-full px-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium"
              >
                New Sale
              </button>

              <button
                onClick={handleSave}
                className="w-full px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
              >
                Save
              </button>

              <button
                onClick={handleLoad}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
              >
                Load
              </button>

              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
              >
                Delete
              </button>

              <button
                onClick={handlePrint}
                className="w-full px-4 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium"
              >
                Print Receipt
              </button>
            </div>
          </div>

          {/* Database Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Database Management</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => downloadCSV("products")}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium border border-gray-200"
                >
                  Export Products CSV
                </button>
                <button
                  onClick={() => downloadCSV("sales")}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium border border-gray-200"
                >
                  Export Sales CSV
                </button>
                <button
                  onClick={() => downloadCSV("saleLines")}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium border border-gray-200"
                >
                  Export Sale Lines CSV
                </button>
              </div>
              <button
                onClick={handleResetData}
                className="w-full mt-4 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-bold border border-red-100"
              >
                Clear All History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Receipt (hidden on screen) */}
      <div className="print:block hidden">
        <div className="max-w-md mx-auto p-8 text-sm">
          <h1 className="text-center text-xl font-bold mb-1">Recon Battery Warehouse</h1>
          <p className="text-center text-xs mb-4">
            2701 2nd Street Northwest<br />
            Albuquerque, NM 87107<br />
            (505) 750-0276
          </p>

          <div className="mb-4">
            <div>Date: {new Date().toLocaleString()}</div>
            {currentSaleId && (
              <div>
                Sale ID: <strong>{currentSaleId}</strong>
              </div>
            )}
          </div>

          <table className="w-full mb-4">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left">Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Price</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.qty}</td>
                  <td className="text-right">${item.price.toFixed(2)}</td>
                  <td className="text-right">${item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right space-y-1">
            <div>Subtotal: ${subtotal.toFixed(2)}</div>
            <div>Tax: ${tax.toFixed(2)}</div>
            <div className="font-bold text-lg">Total: ${total.toFixed(2)}</div>
            <div>Method: {paymentMethod}</div>
          </div>

          <div className="text-center mt-8 text-xs">
            Thank you for your business!
          </div>
        </div>
      </div>

      <DecisionDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        options={confirmDialog.options}
        onSelect={confirmDialog.onSelect}
      />
    </>
  );
}
