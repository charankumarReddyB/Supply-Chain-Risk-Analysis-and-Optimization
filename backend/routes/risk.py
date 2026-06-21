from flask import Blueprint, request, jsonify
from backend.ml.predict import RiskPredictor
from backend.ml.train import train_model

risk_bp = Blueprint("risk", __name__, url_prefix="/api/risk")

@risk_bp.route("/predict", methods=["POST"])
def predict_risk():
    """
    Accepts order parameters and predicts late delivery / transaction risk.
    Payload:
    {
        "days_shipment_scheduled": int,
        "shipping_mode": str,
        "customer_segment": str,
        "category_name": str,
        "product_price": float,
        "sales": float,
        "discount_rate": float
    }
    """
    data = request.get_json() or {}
    
    # Run prediction
    predictor = RiskPredictor()
    result = predictor.predict(data)
    
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200

@risk_bp.route("/model-info", methods=["GET"])
def get_model_info():
    """Returns accuracy, confusion matrix, and feature importances."""
    predictor = RiskPredictor()
    info = predictor.get_model_info()
    
    if info is None:
        return jsonify({"error": "Model has not been trained yet. Please trigger training first."}), 400
        
    if "error" in info:
        return jsonify(info), 400
        
    return jsonify(info), 200

@risk_bp.route("/train", methods=["POST"])
def trigger_training():
    """Triggers ML model training and saves new assets."""
    try:
        train_model()
        predictor = RiskPredictor()
        predictor.load_assets() # reload predictor instance
        
        info = predictor.get_model_info()
        return jsonify({
            "message": "Model trained successfully",
            "metrics": info
        }), 200
    except Exception as e:
        return jsonify({"error": f"Training failed: {str(e)}"}), 500
