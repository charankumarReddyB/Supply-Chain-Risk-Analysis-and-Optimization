import os
from flask import Blueprint, send_file, jsonify
from backend.config import Config
from backend.services.report_service import ReportService

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("/pdf", methods=["GET"])
def download_pdf_report():
    try:
        pdf_path = os.path.join(Config.UPLOAD_FOLDER, "supply_chain_report.pdf")
        
        # Generate the report
        ReportService.generate_pdf_report(pdf_path)
        
        if not os.path.exists(pdf_path):
            return jsonify({"error": "Report file generation failed"}), 500
            
        return send_file(
            pdf_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name="Supply_Chain_Risk_Report.pdf"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate PDF report: {str(e)}"}), 500

@reports_bp.route("/excel", methods=["GET"])
def download_excel_report():
    try:
        excel_path = os.path.join(Config.UPLOAD_FOLDER, "supply_chain_report.xlsx")
        
        # Generate the report
        ReportService.generate_excel_report(excel_path)
        
        if not os.path.exists(excel_path):
            return jsonify({"error": "Report file generation failed"}), 500
            
        return send_file(
            excel_path,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="Supply_Chain_Risk_Data.xlsx"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate Excel report: {str(e)}"}), 500
