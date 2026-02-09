import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getAllSalesWithLines, deleteSale, updateSale } from "../db";
import ConfirmDialog from "./ConfirmDialog";

export default function SalesView() {
  const sales = useLiveQuery(() => getAllSalesWithLines(), []);

  const [expandedSale, setExpandedSale] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, sale: null });
  const [editingMethod, setEditingMethod] = useState(null);

  const toggleExpand = (saleId) => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

  const handleDeleteClick = (sale) => {
    setDeleteDialog({ open: true, sale });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.sale) {
      await deleteSale(deleteDialog.sale.id);
    }
    setDeleteDialog({ open: false, sale: null });
  };

  const handleMethodChange = async (saleId, newMethod) => {
    await updateSale(saleId, { method: newMethod });
    setEditingMethod(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sales History</h2>

      {sales?.length === 0 && (
        <p className="text-center py-8 text-gray-500">
          No sales recorded yet.
        </p>
      )}

      <div className="space-y-2">
        {sales?.map((sale) => (
          <div key={sale.id} className="border rounded-lg overflow-hidden">
            {/* Sale Header Row */}
            <div
              className="flex items-center gap-4 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleExpand(sale.id)}
            >
              <span className="text-lg font-mono">
                {expandedSale === sale.id ? "v" : ">"}
              </span>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                <span className="font-bold">#{sale.id}</span>
                <span className="text-sm text-gray-600">{formatDate(sale.saleDate)}</span>
                <span className="font-bold text-lg">${sale.total.toFixed(2)}</span>
                <div onClick={(e) => e.stopPropagation()}>
                  {editingMethod === sale.id ? (
                    <select
                      value={sale.method}
                      onChange={(e) => handleMethodChange(sale.id, e.target.value)}
                      onBlur={() => setEditingMethod(null)}
                      className="px-2 py-1 border rounded"
                      autoFocus
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Check">Check</option>
                    </select>
                  ) : (
                    <span
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                      onClick={() => setEditingMethod(sale.id)}
                      title="Click to edit"
                    >
                      {sale.method}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(sale);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Line Items */}
            {expandedSale === sale.id && (
              <div className="p-4 bg-white border-t">
                <div className="text-sm text-gray-600 mb-2">
                  Subtotal: ${sale.subtotal.toFixed(2)} | Tax: ${sale.tax.toFixed(2)}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.lines.map((line) => (
                      <tr key={line.id} className="border-b border-gray-100">
                        <td className="py-2">{line.item}</td>
                        <td className="text-right py-2">{line.qty}</td>
                        <td className="text-right py-2">${line.price.toFixed(2)}</td>
                        <td className="text-right py-2 font-medium">
                          ${line.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Sale"
        message={`Are you sure you want to delete Sale #${deleteDialog.sale?.id}? This will remove all line items and cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ open: false, sale: null })}
      />
    </div>
  );
}
