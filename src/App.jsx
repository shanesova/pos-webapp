import { useState } from "react";
import POS from "./POS";
import ProductsView from "./components/ProductsView";
import SalesView from "./components/SalesView";
import "./index.css";

function App() {
  const [activeTab, setActiveTab] = useState("pos");

  const tabs = [
    { id: "pos", label: "POS" },
    { id: "products", label: "Products" },
    { id: "sales", label: "Sales" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tab Navigation */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {activeTab === "pos" && <POS />}
          {activeTab === "products" && <ProductsView />}
          {activeTab === "sales" && <SalesView />}
        </div>
      </div>
    </div>
  );
}

export default App;
