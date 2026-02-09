import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getAllProducts, saveProduct, updateProduct, deleteProduct } from "../db";
import ProductForm from "./ProductForm";
import ConfirmDialog from "./ConfirmDialog";

export default function ProductsView() {
  const products = useLiveQuery(() => getAllProducts(), []);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  const handleAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSave = async (name, price, oldName) => {
    if (oldName) {
      await updateProduct(oldName, name, price);
    } else {
      await saveProduct(name, price);
    }
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteClick = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.product) {
      await deleteProduct(deleteDialog.product.name);
    }
    setDeleteDialog({ open: false, product: null });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-right py-3 px-4">Price</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
                  No products found. Add one to get started.
                </td>
              </tr>
            )}
            {products?.map((product) => (
              <tr key={product.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4 text-right">
                  <span className={product.price < 0 ? "text-red-600" : ""}>
                    ${product.price.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductForm
        isOpen={formOpen}
        product={editingProduct}
        onSave={handleSave}
        onCancel={() => {
          setFormOpen(false);
          setEditingProduct(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleteDialog.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ open: false, product: null })}
      />
    </div>
  );
}
