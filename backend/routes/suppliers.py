from flask import Blueprint, request, jsonify
from backend.models.database import execute_query

suppliers_bp = Blueprint("suppliers", __name__, url_prefix="/api/suppliers")

@suppliers_bp.route("", methods=["GET"])
def get_all_suppliers():
    try:
        suppliers = execute_query("SELECT * FROM suppliers")
        return jsonify(suppliers), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch suppliers: {str(e)}"}), 500

@suppliers_bp.route("/<int:supplier_id>", methods=["GET"])
def get_supplier(supplier_id):
    try:
        supplier = execute_query("SELECT * FROM suppliers WHERE supplier_id = %s", (supplier_id,))
        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404
        return jsonify(supplier[0]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch supplier: {str(e)}"}), 500

@suppliers_bp.route("", methods=["POST"])
def create_supplier():
    data = request.get_json() or {}
    supplier_id = data.get("supplier_id")
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    rating = data.get("rating", 5.0)
    status = data.get("status", "Active")
    
    if not supplier_id or not name:
        return jsonify({"error": "supplier_id and name are required fields"}), 400
        
    try:
        # Check if ID exists
        existing = execute_query("SELECT supplier_id FROM suppliers WHERE supplier_id = %s", (supplier_id,))
        if existing:
            return jsonify({"error": f"Supplier with ID {supplier_id} already exists"}), 400
            
        execute_query(
            """INSERT INTO suppliers (supplier_id, name, email, phone, rating, status) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (supplier_id, name, email, phone, rating, status),
            fetch=False
        )
        
        # Populate warehouse dim
        execute_query(
            "INSERT INTO dim_supplier (Supplier_ID, Supplier_Name, Supplier_Rating, Supplier_Status) VALUES (%s, %s, %s, %s)",
            (supplier_id, name, rating, status),
            fetch=False
        )
        return jsonify({"message": "Supplier created successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create supplier: {str(e)}"}), 500

@suppliers_bp.route("/<int:supplier_id>", methods=["PUT"])
def update_supplier(supplier_id):
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    rating = data.get("rating")
    status = data.get("status")
    
    try:
        # Check if exists
        existing = execute_query("SELECT supplier_id FROM suppliers WHERE supplier_id = %s", (supplier_id,))
        if not existing:
            return jsonify({"error": "Supplier not found"}), 404
            
        # Dynamically build update query
        fields = []
        params = []
        dim_fields = []
        dim_params = []
        
        if name:
            fields.append("name = %s")
            params.append(name)
            dim_fields.append("Supplier_Name = %s")
            dim_params.append(name)
        if email:
            fields.append("email = %s")
            params.append(email)
        if phone:
            fields.append("phone = %s")
            params.append(phone)
        if rating is not None:
            fields.append("rating = %s")
            params.append(rating)
            dim_fields.append("Supplier_Rating = %s")
            dim_params.append(rating)
        if status:
            fields.append("status = %s")
            params.append(status)
            dim_fields.append("Supplier_Status = %s")
            dim_params.append(status)
            
        if fields:
            params.append(supplier_id)
            execute_query(f"UPDATE suppliers SET {', '.join(fields)} WHERE supplier_id = %s", params, fetch=False)
            
        if dim_fields:
            dim_params.append(supplier_id)
            execute_query(f"UPDATE dim_supplier SET {', '.join(dim_fields)} WHERE Supplier_ID = %s", dim_params, fetch=False)
            
        return jsonify({"message": "Supplier updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update supplier: {str(e)}"}), 500

@suppliers_bp.route("/<int:supplier_id>", methods=["DELETE"])
def delete_supplier(supplier_id):
    try:
        # Check if exists
        existing = execute_query("SELECT supplier_id FROM suppliers WHERE supplier_id = %s", (supplier_id,))
        if not existing:
            return jsonify({"error": "Supplier not found"}), 404
            
        execute_query("DELETE FROM suppliers WHERE supplier_id = %s", (supplier_id,), fetch=False)
        execute_query("DELETE FROM dim_supplier WHERE Supplier_ID = %s", (supplier_id,), fetch=False)
        return jsonify({"message": "Supplier deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete supplier: {str(e)}"}), 500

@suppliers_bp.route("/performance", methods=["GET"])
def get_supplier_performance():
    """Returns analytics regarding supplier reliability, order counts, and delay rates."""
    try:
        query = """
            SELECT 
                s.Supplier_ID as supplier_id,
                s.Supplier_Name as name,
                s.Supplier_Rating as rating,
                s.Supplier_Status as status,
                COUNT(f.Fact_ID) as total_orders,
                ROUND(SUM(f.Sales), 2) as total_sales,
                ROUND(AVG(f.Delivery_Delay), 2) as avg_delay_days,
                SUM(CASE WHEN f.Delivery_Delay > 0 THEN 1 ELSE 0 END) as delayed_orders_count
            FROM dim_supplier s
            LEFT JOIN fact_order f ON s.Supplier_ID = f.Supplier_ID
            GROUP BY s.Supplier_ID, s.Supplier_Name, s.Supplier_Rating, s.Supplier_Status
            ORDER BY avg_delay_days ASC
        """
        performance = execute_query(query)
        return jsonify(performance), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch supplier performance: {str(e)}"}), 500
