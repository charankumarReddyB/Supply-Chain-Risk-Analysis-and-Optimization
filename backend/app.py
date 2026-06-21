import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for all routes (to support the frontend running on local dev ports)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize JWT Manager
    jwt = JWTManager(app)
    
    # Register JWT error handlers for clean responses
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "The token has expired", "sub_status": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Signature verification failed", "sub_status": "token_invalid"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Request does not contain an access token", "sub_status": "token_missing"}), 401
        
    # Import Blueprints
    from backend.routes.auth import auth_bp
    from backend.routes.dashboard import dashboard_bp
    from backend.routes.suppliers import suppliers_bp
    from backend.routes.products import products_bp
    from backend.routes.inventory import inventory_bp
    from backend.routes.orders import orders_bp
    from backend.routes.shipments import shipments_bp
    from backend.routes.risk import risk_bp
    from backend.routes.optimization import optimization_bp
    from backend.routes.reports import reports_bp
    
    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(suppliers_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(shipments_bp)
    app.register_blueprint(risk_bp)
    app.register_blueprint(optimization_bp)
    app.register_blueprint(reports_bp)
    
    @app.route("/")
    def index():
        return jsonify({
            "status": "online",
            "message": "Supply Chain Risk Analysis and Optimization Backend APIs are running.",
            "version": "1.0.0"
        }), 200
        
    # Global Error Handler
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "An internal server error occurred"}), 500

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found"}), 404
        
    return app

if __name__ == "__main__":
    app = create_app()
    # Run server on port 5000 (standard for Flask and often used by frontends)
    # Allow external connections in development
    app.run(host="0.0.0.0", port=5000, debug=True)
