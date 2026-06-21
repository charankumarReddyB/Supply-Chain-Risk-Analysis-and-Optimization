from flask import Blueprint, jsonify
from backend.models.database import execute_query

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
def get_stats():
    """Returns general dashboard KPIs."""
    try:
        query_kpi = """
            SELECT 
                COUNT(DISTINCT Order_ID) as total_orders,
                SUM(Quantity) as total_items_sold,
                ROUND(SUM(Sales), 2) as total_revenue,
                ROUND(SUM(Profit), 2) as total_profit,
                ROUND(AVG(Delivery_Delay), 2) as avg_delivery_delay_days,
                SUM(CASE WHEN Risk_Level = 'High' THEN 1 ELSE 0 END) as high_risk_orders_count
            FROM fact_order
        """
        kpi_result = execute_query(query_kpi)
        
        # Risk Distribution
        query_risk = """
            SELECT Risk_Level as risk_level, COUNT(Fact_ID) as count
            FROM fact_order
            GROUP BY Risk_Level
        """
        risk_result = execute_query(query_risk)
        
        # Monthly Revenue Trend
        query_trend = """
            SELECT 
                d.Year as year, 
                d.Month as month, 
                d.Month_Name as month_name, 
                ROUND(SUM(f.Sales), 2) as revenue,
                ROUND(SUM(f.Profit), 2) as profit
            FROM fact_order f
            JOIN dim_date d ON f.Date_ID = d.Date_ID
            GROUP BY d.Year, d.Month, d.Month_Name
            ORDER BY d.Year ASC, d.Month ASC
            LIMIT 12
        """
        trend_result = execute_query(query_trend)
        
        # Segment Revenue Breakdown
        query_segment = """
            SELECT 
                c.Customer_Segment as segment,
                ROUND(SUM(f.Sales), 2) as revenue
            FROM fact_order f
            JOIN dim_customer c ON f.Customer_ID = c.Customer_ID
            GROUP BY c.Customer_Segment
        """
        segment_result = execute_query(query_segment)
        
        return jsonify({
            "kpis": kpi_result[0] if kpi_result else {},
            "risk_distribution": risk_result,
            "revenue_trend": trend_result,
            "segment_breakdown": segment_result
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve dashboard stats: {str(e)}"}), 500
