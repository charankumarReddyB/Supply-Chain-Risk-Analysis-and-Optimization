from flask import Blueprint, jsonify
from backend.services.optimization_service import OptimizationService

optimization_bp = Blueprint("optimization", __name__, url_prefix="/api/optimization")

@optimization_bp.route("/suppliers", methods=["GET"])
def recommend_suppliers():
    try:
        recommendations = OptimizationService.get_best_suppliers()
        return jsonify(recommendations), 200
    except Exception as e:
        return jsonify({"error": f"Failed to load supplier optimization recommendations: {str(e)}"}), 500

@optimization_bp.route("/delayed-deliveries", methods=["GET"])
def detect_delays():
    try:
        delays = OptimizationService.get_delayed_deliveries()
        return jsonify(delays), 200
    except Exception as e:
        return jsonify({"error": f"Failed to detect delayed deliveries: {str(e)}"}), 500

@optimization_bp.route("/replenish", methods=["GET"])
def recommend_replenishment():
    try:
        replenishments = OptimizationService.get_inventory_replenishment()
        return jsonify(replenishments), 200
    except Exception as e:
        return jsonify({"error": f"Failed to calculate replenishment suggestions: {str(e)}"}), 500

@optimization_bp.route("/high-risk-shipments", methods=["GET"])
def identify_high_risk():
    try:
        high_risk = OptimizationService.get_high_risk_shipments()
        return jsonify(high_risk), 200
    except Exception as e:
        return jsonify({"error": f"Failed to identify high risk shipments: {str(e)}"}), 500

@optimization_bp.route("/cost-reduction", methods=["GET"])
def recommend_cost_reductions():
    try:
        cost_reductions = OptimizationService.get_cost_reduction_opportunities()
        return jsonify(cost_reductions), 200
    except Exception as e:
        return jsonify({"error": f"Failed to analyze cost reduction opportunities: {str(e)}"}), 500
