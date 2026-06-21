from backend.models.database import execute_query

def get_warehouse_summary():
    """Returns row counts and metadata for the OLAP Star Schema."""
    summary = {}
    try:
        tables = {
            "dim_customer": "Customer Dimension",
            "dim_product": "Product Dimension",
            "dim_supplier": "Supplier Dimension",
            "dim_warehouse": "Warehouse Dimension",
            "dim_shipping": "Shipping Dimension",
            "dim_date": "Date Dimension",
            "fact_order": "Order Fact Table"
        }
        
        for table, label in tables.items():
            res = execute_query(f"SELECT COUNT(*) as count FROM {table}")
            summary[table] = {
                "label": label,
                "count": res[0]["count"] if res else 0
            }
        return summary
    except Exception as e:
        return {"error": f"Failed to retrieve data warehouse summary: {str(e)}"}

def clear_warehouse():
    """Truncates fact and dimension tables."""
    try:
        execute_query("SET FOREIGN_KEY_CHECKS = 0;", fetch=False)
        tables = ["fact_order", "dim_customer", "dim_product", "dim_supplier", "dim_warehouse", "dim_shipping", "dim_date"]
        for table in tables:
            execute_query(f"TRUNCATE TABLE {table};", fetch=False)
        execute_query("SET FOREIGN_KEY_CHECKS = 1;", fetch=False)
        return {"message": "Data Warehouse tables truncated successfully."}
    except Exception as e:
        return {"error": f"Failed to clear warehouse: {str(e)}"}
