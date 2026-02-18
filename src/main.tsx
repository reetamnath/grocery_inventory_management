import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "@/context/ConfigContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/common/Toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider>
      <ToastProvider>
        <CartProvider>
          <InventoryProvider>
            <App />
          </InventoryProvider>
        </CartProvider>
      </ToastProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
