from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from backend.controllers.dashboard_controller import DashboardController
from backend.middleware.auth_middleware import admin_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    """
    GET /api/dashboard/stats
    Returns full dashboard KPIs: orders, revenue, profit, risk, delay, inventory.
    Admin only — includes revenue, profit, and supplier ranking.
    """
    try:
        kpis = DashboardController.get_kpis()
        risk_dist = DashboardController.get_risk_distribution()
        monthly = DashboardController.get_monthly_sales(limit=24)
        segments = DashboardController.get_segment_breakdown()
        inventory = DashboardController.get_inventory_status()
        recent_activities = DashboardController.get_recent_activities()
        supplier_ranking = DashboardController.get_supplier_ranking(limit=6)

        return jsonify({
            "kpis": kpis,
            "risk_distribution": risk_dist,
            "monthly_sales_trend": monthly,
            "segment_breakdown": segments,
            "inventory_status": inventory,
            "recent_activities": recent_activities,
            "supplier_ranking": supplier_ranking,
            "currency": "INR"
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to retrieve dashboard stats: {str(e)}"}), 500


@dashboard_bp.route("/stats-public", methods=["GET"])
@jwt_required()
def get_stats_public():
    """
    GET /api/dashboard/stats-public
    Returns a non-financial subset of dashboard data for regular users.
    Includes: order counts, delivery delays, risk distribution, inventory status,
    and recent activities — but NO revenue, profit, or supplier ranking data.
    """
    try:
        kpis = DashboardController.get_kpis()
        risk_dist = DashboardController.get_risk_distribution()
        monthly = DashboardController.get_monthly_sales(limit=24)
        inventory = DashboardController.get_inventory_status()
        recent_activities = DashboardController.get_recent_activities()

        # Strip financial fields from KPIs before returning to user role
        safe_kpis = {
            "total_orders": kpis.get("total_orders", 0),
            "total_customers": kpis.get("total_customers", 0),
            "total_suppliers": kpis.get("total_suppliers", 0),
            "total_warehouses": kpis.get("total_warehouses", 0),
            "total_items_sold": kpis.get("total_items_sold", 0),
            "avg_delivery_delay_days": kpis.get("avg_delivery_delay_days", 0),
            "delayed_deliveries": kpis.get("delayed_deliveries", 0),
            "high_risk_orders": kpis.get("high_risk_orders", 0),
            "medium_risk_orders": kpis.get("medium_risk_orders", 0),
            "low_risk_orders": kpis.get("low_risk_orders", 0),
            # Financial fields deliberately excluded:
            # total_revenue, total_profit
        }

        # Strip revenue/profit from monthly sales trend
        safe_monthly = [
            {
                "year": m.get("year"),
                "month": m.get("month"),
                "month_name": m.get("month_name"),
                "quarter": m.get("quarter"),
                "total_orders": m.get("total_orders"),
                "delivered": m.get("delivered"),
                "delayed": m.get("delayed"),
                # revenue and profit deliberately excluded
            }
            for m in monthly
        ]

        return jsonify({
            "kpis": safe_kpis,
            "risk_distribution": risk_dist,
            "monthly_sales_trend": safe_monthly,
            "inventory_status": inventory,
            "recent_activities": recent_activities,
            "supplier_ranking": [],   # empty — not available to user role
            "currency": "INR"
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to retrieve public dashboard stats: {str(e)}"}), 500


@dashboard_bp.route("/kpis", methods=["GET"])
@jwt_required()
def get_kpis():
    """
    GET /api/dashboard/kpis
    Returns all KPI metrics for quick display cards.
    """
    try:
        kpi_data = DashboardController.get_kpis()
        kpi_data["currency"] = "INR"
        return jsonify(kpi_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve KPIs: {str(e)}"}), 500


@dashboard_bp.route("/monthly-sales", methods=["GET"])
@admin_required
def get_monthly_sales():
    """
    GET /api/dashboard/monthly-sales?limit=12
    Returns monthly revenue and profit trend.
    Admin only — contains financial revenue/profit data.
    """
    try:
        limit = request.args.get("limit", 24, type=int)
        return jsonify(DashboardController.get_monthly_sales(limit=limit)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve monthly sales: {str(e)}"}), 500


@dashboard_bp.route("/supplier-ranking", methods=["GET"])
@admin_required
def get_supplier_ranking():
    """
    GET /api/dashboard/supplier-ranking?limit=10
    Returns top supplier ranking by performance score.
    Admin only — contains supplier financial performance data.
    """
    try:
        limit = request.args.get("limit", 10, type=int)
        return jsonify(DashboardController.get_supplier_ranking(limit=limit)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve supplier ranking: {str(e)}"}), 500


@dashboard_bp.route("/top-products", methods=["GET"])
@jwt_required()
def get_top_products():
    """
    GET /api/dashboard/top-products?limit=10
    Returns top selling products by revenue.
    """
    try:
        limit = request.args.get("limit", 10, type=int)
        return jsonify(DashboardController.get_top_selling_products(limit=limit)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve top products: {str(e)}"}), 500


@dashboard_bp.route("/late-deliveries", methods=["GET"])
@jwt_required()
def get_late_deliveries():
    """
    GET /api/dashboard/late-deliveries?limit=20
    Returns most delayed shipments with customer and product context.
    """
    try:
        limit = request.args.get("limit", 20, type=int)
        return jsonify(DashboardController.get_late_deliveries(limit=limit)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve late deliveries: {str(e)}"}), 500


@dashboard_bp.route("/warehouse-performance", methods=["GET"])
@jwt_required()
def get_warehouse_performance():
    """
    GET /api/dashboard/warehouse-performance
    Returns performance metrics per warehouse including delay rates and risk counts.
    """
    try:
        return jsonify(DashboardController.get_warehouse_performance()), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve warehouse performance: {str(e)}"}), 500


@dashboard_bp.route("/inventory-status", methods=["GET"])
@jwt_required()
def get_inventory_status():
    """
    GET /api/dashboard/inventory-status
    Returns inventory health summary: CRITICAL / WARNING / OK counts.
    """
    try:
        return jsonify(DashboardController.get_inventory_status()), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve inventory status: {str(e)}"}), 500
