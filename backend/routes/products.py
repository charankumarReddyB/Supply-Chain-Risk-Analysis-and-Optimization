from flask import Blueprint, request, jsonify
from backend.models.database import execute_query

products_bp = Blueprint("products", __name__, url_prefix="/api/products")

@products_bp.route("", methods=["GET"])
def get_all_products():
    try:
        products = execute_query("SELECT * FROM products")
        return jsonify(products), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch products: {str(e)}"}), 500

@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = execute_query("SELECT * FROM products WHERE product_id = %s", (product_id,))
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(product[0]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch product: {str(e)}"}), 500

@products_bp.route("", methods=["POST"])
def create_product():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    category_id = data.get("category_id")
    category_name = data.get("category_name")
    product_name = data.get("product_name")
    product_price = data.get("product_price")
    product_status = data.get("product_status", "0")
    description = data.get("description", "")
    
    if not product_id or not product_name or product_price is None:
        return jsonify({"error": "product_id, product_name, and product_price are required fields"}), 400
        
    try:
        # Check if ID exists
        existing = execute_query("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
        if existing:
            return jsonify({"error": f"Product with ID {product_id} already exists"}), 400
            
        # OLTP insert
        execute_query(
            """INSERT INTO products (product_id, category_id, category_name, product_name, product_price, product_status, description) 
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (product_id, category_id, category_name, product_name, product_price, product_status, description),
            fetch=False
        )
        
        # OLAP insert
        execute_query(
            """INSERT INTO dim_product (Product_ID, Product_Category_Id, Product_Category_Name, Product_Name, Product_Price, Product_Status) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (product_id, category_id, category_name, product_name, product_price, product_status),
            fetch=False
        )
        
        # Initialize Inventory in OLTP for this product
        execute_query(
            """INSERT INTO inventory (product_id, warehouse_id, stock_level, reorder_point, safety_stock, lead_time_days) 
               VALUES (%s, 1, 100, 50, 10, 5)""",
            (product_id,),
            fetch=False
        )
        
        return jsonify({"message": "Product created successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create product: {str(e)}"}), 500

@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json() or {}
    category_id = data.get("category_id")
    category_name = data.get("category_name")
    product_name = data.get("product_name")
    product_price = data.get("product_price")
    product_status = data.get("product_status")
    description = data.get("description")
    
    try:
        # Check if exists
        existing = execute_query("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
        if not existing:
            return jsonify({"error": "Product not found"}), 404
            
        fields = []
        params = []
        dim_fields = []
        dim_params = []
        
        if category_id is not None:
            fields.append("category_id = %s")
            params.append(category_id)
            dim_fields.append("Product_Category_Id = %s")
            dim_params.append(category_id)
        if category_name:
            fields.append("category_name = %s")
            params.append(category_name)
            dim_fields.append("Product_Category_Name = %s")
            dim_params.append(category_name)
        if product_name:
            fields.append("product_name = %s")
            params.append(product_name)
            dim_fields.append("Product_Name = %s")
            dim_params.append(product_name)
        if product_price is not None:
            fields.append("product_price = %s")
            params.append(product_price)
            dim_fields.append("Product_Price = %s")
            dim_params.append(product_price)
        if product_status:
            fields.append("product_status = %s")
            params.append(product_status)
            dim_fields.append("Product_Status = %s")
            dim_params.append(product_status)
        if description:
            fields.append("description = %s")
            params.append(description)
            
        if fields:
            params.append(product_id)
            execute_query(f"UPDATE products SET {', '.join(fields)} WHERE product_id = %s", params, fetch=False)
            
        if dim_fields:
            dim_params.append(product_id)
            execute_query(f"UPDATE dim_product SET {', '.join(dim_fields)} WHERE Product_ID = %s", dim_params, fetch=False)
            
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update product: {str(e)}"}), 500

@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        # Check if exists
        existing = execute_query("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
        if not existing:
            return jsonify({"error": "Product not found"}), 404
            
        execute_query("DELETE FROM products WHERE product_id = %s", (product_id,), fetch=False)
        execute_query("DELETE FROM dim_product WHERE Product_ID = %s", (product_id,), fetch=False)
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete product: {str(e)}"}), 500

@products_bp.route("/high-risk", methods=["GET"])
def get_high_risk_products():
    """Returns products frequently associated with late deliveries or negative profit."""
    try:
        query = """
            SELECT 
                p.Product_ID as product_id,
                p.Product_Name as product_name,
                p.Product_Category_Name as category,
                p.Product_Price as price,
                COUNT(f.Fact_ID) as total_orders,
                SUM(CASE WHEN f.Risk_Level = 'High' THEN 1 ELSE 0 END) as high_risk_orders_count,
                ROUND(SUM(CASE WHEN f.Risk_Level = 'High' THEN 1 ELSE 0 END) / COUNT(f.Fact_ID) * 100, 2) as risk_rate_percentage
            FROM dim_product p
            JOIN fact_order f ON p.Product_ID = f.Product_ID
            GROUP BY p.Product_ID, p.Product_Name, p.Product_Category_Name, p.Product_Price
            HAVING risk_rate_percentage > 0
            ORDER BY risk_rate_percentage DESC
            LIMIT 20
        """
        results = execute_query(query)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch high risk products: {str(e)}"}), 500
