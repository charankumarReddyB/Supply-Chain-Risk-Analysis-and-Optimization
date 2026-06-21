-- ============================================================================
-- Analytical OLAP Queries for Supply Chain Risk Optimization
-- ============================================================================

-- 1. Top Delayed Suppliers
-- Measures supplier reliability by average delivery delay days.
SELECT 
    s.Supplier_Name,
    s.Supplier_Rating,
    COUNT(f.Fact_ID) as Total_Orders,
    ROUND(AVG(f.Delivery_Delay), 2) as Avg_Delivery_Delay_Days
FROM dim_supplier s
JOIN fact_order f ON s.Supplier_ID = f.Supplier_ID
GROUP BY s.Supplier_ID, s.Supplier_Name, s.Supplier_Rating
ORDER BY Avg_Delivery_Delay_Days DESC;


-- 2. Monthly Sales & Profit Trend
-- Provides month-over-month sales performance.
SELECT 
    d.Year,
    d.Month,
    d.Month_Name,
    ROUND(SUM(f.Sales), 2) as Monthly_Revenue,
    ROUND(SUM(f.Profit), 2) as Monthly_Profit
FROM fact_order f
JOIN dim_date d ON f.Date_ID = d.Date_ID
GROUP BY d.Year, d.Month, d.Month_Name
ORDER BY d.Year ASC, d.Month ASC;


-- 3. Inventory Levels & Stockout Risk
-- Identifies products that are below safety stock or reorder point.
SELECT 
    p.product_name,
    w.name as Warehouse_Name,
    i.stock_level,
    i.reorder_point,
    i.safety_stock,
    CASE 
        WHEN i.stock_level <= i.safety_stock THEN 'CRITICAL (Below Safety Stock)'
        WHEN i.stock_level <= i.reorder_point THEN 'WARNING (Below Reorder Point)'
        ELSE 'OK'
    END as Status
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
ORDER BY i.stock_level ASC;


-- 4. Revenue Analysis by Customer Segment & Market region
-- Breaks down sales performance across business segments.
SELECT 
    c.Customer_Segment,
    COUNT(DISTINCT f.Order_ID) as Total_Orders,
    ROUND(SUM(f.Sales), 2) as Total_Revenue,
    ROUND(SUM(f.Profit), 2) as Total_Profit,
    ROUND(SUM(f.Profit) / SUM(f.Sales) * 100, 2) as Profit_Margin_Percent
FROM fact_order f
JOIN dim_customer c ON f.Customer_ID = c.Customer_ID
GROUP BY c.Customer_Segment
ORDER BY Total_Revenue DESC;


-- 5. Delivery Performance by Shipping Mode
-- Analyzes late vs. on-time deliveries per shipping service class.
SELECT 
    s.Shipping_Mode,
    COUNT(f.Fact_ID) as Total_Shipments,
    SUM(CASE WHEN f.Delivery_Delay > 0 THEN 1 ELSE 0 END) as Delayed_Shipments,
    ROUND(SUM(CASE WHEN f.Delivery_Delay > 0 THEN 1 ELSE 0 END) / COUNT(f.Fact_ID) * 100, 2) as Delay_Rate_Percent,
    ROUND(AVG(f.Delivery_Delay), 2) as Avg_Delay_Days
FROM fact_order f
JOIN dim_shipping s ON f.Shipping_ID = s.Shipping_ID
GROUP BY s.Shipping_Mode
ORDER BY Delay_Rate_Percent DESC;


-- 6. High-Risk Orders List
-- Extracts transactions having high delivery delays and negative profit margins.
SELECT 
    f.Order_ID,
    c.Customer_Fname,
    c.Customer_Lname,
    p.Product_Name,
    f.Sales,
    f.Profit,
    f.Delivery_Delay as Delay_Days,
    f.Risk_Level
FROM fact_order f
JOIN dim_customer c ON f.Customer_ID = c.Customer_ID
JOIN dim_product p ON f.Product_ID = p.Product_ID
WHERE f.Risk_Level = 'High'
ORDER BY f.Profit ASC;
