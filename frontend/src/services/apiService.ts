/**
 * Supply Chain API Service
 * 
 * Provides typescript integration methods to fetch data from the Flask REST API.
 * Backend Base URL: http://localhost:5000
 */

const BASE_URL = "http://localhost:5000/api";

// Helper to get Auth Headers
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiService = {
  // ==========================================================================
  // Auth API
  // ==========================================================================
  auth: {
    login: async (username: string, password: string) => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      
      // Save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    },
    
    register: async (payload: any) => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");
      return data;
    },
    
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    
    getCurrentUser: () => {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
  },

  // ==========================================================================
  // Dashboard API
  // ==========================================================================
  dashboard: {
    getStats: async () => {
      const response = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch stats");
      return data;
    }
  },

  // ==========================================================================
  // Suppliers API
  // ==========================================================================
  suppliers: {
    list: async () => {
      const response = await fetch(`${BASE_URL}/suppliers`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch suppliers");
      return data;
    },
    
    performance: async () => {
      const response = await fetch(`${BASE_URL}/suppliers/performance`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch supplier performance");
      return data;
    },
    
    create: async (supplier: any) => {
      const response = await fetch(`${BASE_URL}/suppliers`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(supplier),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create supplier");
      return data;
    },
    
    update: async (id: number, supplier: any) => {
      const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(supplier),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update supplier");
      return data;
    },
    
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete supplier");
      return data;
    }
  },

  // ==========================================================================
  // Products API
  // ==========================================================================
  products: {
    list: async () => {
      const response = await fetch(`${BASE_URL}/products`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch products");
      return data;
    },
    
    highRisk: async () => {
      const response = await fetch(`${BASE_URL}/products/high-risk`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch high-risk products");
      return data;
    }
  },

  // ==========================================================================
  // Inventory API
  // ==========================================================================
  inventory: {
    list: async () => {
      const response = await fetch(`${BASE_URL}/inventory`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch inventory");
      return data;
    },
    
    replenishAlerts: async () => {
      const response = await fetch(`${BASE_URL}/inventory/replenish`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch inventory replenishment alerts");
      return data;
    },
    
    update: async (id: number, payload: any) => {
      const response = await fetch(`${BASE_URL}/inventory/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update inventory");
      return data;
    }
  },

  // ==========================================================================
  // Orders API
  // ==========================================================================
  orders: {
    list: async () => {
      const response = await fetch(`${BASE_URL}/orders`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch orders");
      return data;
    },
    
    get: async (id: number) => {
      const response = await fetch(`${BASE_URL}/orders/${id}`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch order details");
      return data;
    },
    
    create: async (order: any) => {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(order),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create order");
      return data;
    },
    
    delete: async (id: number) => {
      const response = await fetch(`${BASE_URL}/orders/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete order");
      return data;
    }
  },

  // ==========================================================================
  // Shipments API
  // ==========================================================================
  shipments: {
    list: async () => {
      const response = await fetch(`${BASE_URL}/shipments`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch shipments");
      return data;
    },
    
    updateTracking: async (id: number, payload: { days_shipping_real: number; delivery_status?: string }) => {
      const response = await fetch(`${BASE_URL}/shipments/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update shipment");
      return data;
    }
  },

  // ==========================================================================
  // Risk (Machine Learning) API
  // ==========================================================================
  risk: {
    predict: async (payload: {
      days_shipment_scheduled: number;
      shipping_mode: string;
      customer_segment: string;
      category_name: string;
      product_price: number;
      sales: number;
      discount_rate: number;
    }) => {
      const response = await fetch(`${BASE_URL}/risk/predict`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ML prediction failed");
      return data;
    },
    
    modelInfo: async () => {
      const response = await fetch(`${BASE_URL}/risk/model-info`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch model information");
      return data;
    },
    
    retrainModel: async () => {
      const response = await fetch(`${BASE_URL}/risk/train`, {
        method: "POST",
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to retrain model");
      return data;
    }
  },

  // ==========================================================================
  // Optimizations API
  // ==========================================================================
  optimization: {
    suppliers: async () => {
      const response = await fetch(`${BASE_URL}/optimization/suppliers`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch supplier optimizations");
      return data;
    },
    
    costReduction: async () => {
      const response = await fetch(`${BASE_URL}/optimization/cost-reduction`, {
        headers: getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch cost-reduction suggestions");
      return data;
    }
  },

  // ==========================================================================
  // Exporters API
  // ==========================================================================
  reports: {
    downloadPdf: () => {
      const token = localStorage.getItem("token");
      const url = `${BASE_URL}/reports/pdf${token ? `?token=${token}` : ""}`;
      window.open(url, "_blank");
    },
    
    downloadExcel: () => {
      const token = localStorage.getItem("token");
      const url = `${BASE_URL}/reports/excel${token ? `?token=${token}` : ""}`;
      window.open(url, "_blank");
    }
  }
};
