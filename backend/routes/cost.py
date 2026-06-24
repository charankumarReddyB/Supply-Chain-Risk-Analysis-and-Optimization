from flask import Blueprint, jsonify
from backend.controllers.analytics_controller import AnalyticsController
from backend.middleware.auth_middleware import admin_required

cost_bp = Blueprint("cost", __name__, url_prefix="/api/cost")

@cost_bp.route("/by-category", methods=["GET"])
@admin_required
def get_cost_by_category():
    """
    GET /api/cost/by-category
    Returns cost of goods sold grouped by product category.
    Restricted to Admin Only.
    """
    try:
        costs = AnalyticsController.get_cost_by_category()
        return jsonify(costs), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve cost by category: {str(e)}"}), 500

@cost_bp.route("/by-region", methods=["GET"])
@admin_required
def get_cost_by_region():
    """
    GET /api/cost/by-region
    Returns cost of goods sold grouped by region/warehouse city.
    Restricted to Admin Only.
    """
    try:
        costs = AnalyticsController.get_cost_by_region()
        return jsonify(costs), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve cost by region: {str(e)}"}), 500
