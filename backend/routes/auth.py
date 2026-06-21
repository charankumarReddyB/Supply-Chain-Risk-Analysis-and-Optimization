from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.database import execute_query

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")
    
    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
        
    password_hash = generate_password_hash(password)
    
    try:
        # Check if user already exists
        check_user = execute_query("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if check_user:
            return jsonify({"error": "Username or Email already registered"}), 400
            
        # Insert user
        execute_query(
            "INSERT INTO users (username, password_hash, email, role) VALUES (%s, %s, %s, %s)",
            (username, password_hash, email, role),
            fetch=False
        )
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
        
    try:
        # Fetch user
        user = execute_query("SELECT * FROM users WHERE username = %s", (username,))
        if not user or not check_password_hash(user[0]["password_hash"], password):
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Create token
        access_token = create_access_token(identity=str(user[0]["id"]))
        
        return jsonify({
            "token": access_token,
            "user": {
                "id": user[0]["id"],
                "username": user[0]["username"],
                "email": user[0]["email"],
                "role": user[0]["role"]
            }
        }), 200
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    try:
        user = execute_query("SELECT id, username, email, role FROM users WHERE id = %s", (current_user_id,))
        if not user:
            return jsonify({"error": "User not found"}), 440
        return jsonify({"user": user[0]}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve user: {str(e)}"}), 500
