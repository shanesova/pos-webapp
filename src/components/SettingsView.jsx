import { useState } from "react";
import { db, clearSalesData, convertToCSV } from "../db";
import DecisionDialog from "./DecisionDialog";

export default function SettingsView() {
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
        alert("Database cleared successfully.");
      } catch (error) {
        alert("Error clearing database: " + error.message);
      }
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto">
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
