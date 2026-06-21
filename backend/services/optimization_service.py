from backend.models.database import execute_query

class OptimizationService:
    @staticmethod
    def get_best_suppliers():
        """
        Recommends best suppliers based on low average delay and high rating.
        Formula: Suppliers sorted by rating (DESC) and average delay (ASC).
        """
        query = """
            SELECT 
                s.supplier_id,
                s.name,
                s.rating,
                s.status,
                COALESCE(AVG(f.Delivery_Delay), 0) as avg_delay_days,
                COUNT(f.Fact_ID) as total_orders
            FROM suppliers s
            LEFT JOIN fact_order f ON s.supplier_id = f.Supplier_ID
            GROUP BY s.supplier_id, s.name, s.rating, s.status
            ORDER BY s.rating DESC, avg_delay_days ASC
        """
        results = execute_query(query)
        # Add recommendation comment
        for row in results:
            if row["rating"] >= 4.0 and row["avg_delay_days"] <= 1.0:
                row["recommendation"] = "Preferred Partner (High Reliability & Quality)"
            elif row["rating"] >= 3.5:
                row["recommendation"] = "Approved (Standard Reliability)"
            else:
                row["recommendation"] = "Risk Factor (Underperforming, Monitor closely)"
        return results

    @staticmethod
    def get_delayed_deliveries():
        """Detects shipments that have been delayed (real days > scheduled days)."""
        query = """
            SELECT 
                s.shipment_id,
                o.order_id,
                c.fname, c.lname,
                p.product_name,
                s.shipping_mode,
                s.days_shipping_real,
                s.days_shipment_scheduled,
                (s.days_shipping_real - s.days_shipment_scheduled) as delay_days,
                s.delivery_status
            FROM shipments s
            JOIN orders o ON s.order_id = o.order_id
            JOIN customers c ON o.customer_id = c.customer_id
            JOIN products p ON o.product_id = p.product_id
            WHERE s.days_shipping_real > s.days_shipment_scheduled
            ORDER BY delay_days DESC
            LIMIT 50
        """
        return execute_query(query)

    @staticmethod
    def get_inventory_replenishment():
        """Identifies stock items requiring replenishment based on reorder points."""
        query = """
            SELECT 
                i.inventory_id,
                p.product_id,
                p.product_name,
                p.product_price,
                w.name as warehouse_name,
                i.stock_level,
                i.reorder_point,
                i.safety_stock,
                i.lead_time_days,
                (i.reorder_point + i.safety_stock - i.stock_level) as recommended_reorder_qty
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            JOIN warehouses w ON i.warehouse_id = w.warehouse_id
            WHERE i.stock_level <= i.reorder_point
            ORDER BY (i.stock_level / i.reorder_point) ASC
        """
        results = execute_query(query)
        # Add urgency level
        for row in results:
            ratio = row["stock_level"] / row["reorder_point"] if row["reorder_point"] > 0 else 0
            if row["stock_level"] <= row["safety_stock"]:
                row["urgency"] = "CRITICAL (Stock level below safety stock)"
            elif ratio <= 0.5:
                row["urgency"] = "HIGH (Stock level under 50% of reorder point)"
            else:
                row["urgency"] = "MEDIUM (Reorder threshold breached)"
        return results

    @staticmethod
    def get_high_risk_shipments():
        """Identifies shipments marked as late delivery risk or overall High Risk."""
        query = """
            SELECT 
                f.Order_ID,
                c.Customer_Fname, c.Customer_Lname,
                p.Product_Name,
                s.Shipping_Mode,
                f.Sales,
                f.Profit,
                f.Delivery_Delay,
                f.Risk_Level
            FROM fact_order f
            JOIN dim_customer c ON f.Customer_ID = c.Customer_ID
            JOIN dim_product p ON f.Product_ID = p.Product_ID
            JOIN dim_shipping s ON f.Shipping_ID = s.Shipping_ID
            WHERE f.Risk_Level = 'High'
            ORDER BY f.Profit ASC
            LIMIT 50
        """
        return execute_query(query)

    @staticmethod
    def get_cost_reduction_opportunities():
        """Identifies products or orders with negative profit or high discounts causing losses."""
        query = """
            SELECT 
                o.order_id,
                p.product_name,
                o.quantity,
                o.sales,
                o.profit,
                (o.sales - o.profit) as total_cost,
                sh.shipping_mode,
                sh.delivery_status
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            JOIN shipments sh ON o.order_id = sh.order_id
            WHERE o.profit < 0
            ORDER BY o.profit ASC
            LIMIT 50
        """
        results = execute_query(query)
        # Add actionable insights
        for row in results:
            if row["sales"] > 0:
                loss_percentage = abs(row["profit"]) / row["sales"]
            else:
                loss_percentage = 1.0
                
            if loss_percentage > 0.5:
                row["actionable_insight"] = "Discontinue or renegotiate cost structure immediately."
            elif row["delivery_status"] == "Late delivery":
                row["actionable_insight"] = "Optimize carrier/shipping mode to prevent late delivery penalty costs."
            else:
                row["actionable_insight"] = "Adjust price or discount rates to restore margins."
        return results
