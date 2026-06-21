import os
import joblib
import pandas as pd
from backend.config import Config

class RiskPredictor:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RiskPredictor, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.encoders = None
            cls._instance.metrics = None
            cls._instance.load_assets()
        return cls._instance
        
    def load_assets(self):
        # Load model and encoders if they exist
        if os.path.exists(Config.MODEL_PATH) and os.path.exists(Config.ENCODER_PATH):
            try:
                self.model = joblib.load(Config.MODEL_PATH)
                self.encoders = joblib.load(Config.ENCODER_PATH)
                
                # Load metrics if available
                metrics_path = os.path.join(os.path.dirname(Config.MODEL_PATH), "model_metrics.json")
                if os.path.exists(metrics_path):
                    import json
                    with open(metrics_path, 'r') as mf:
                        self.metrics = json.load(mf)
            except Exception as e:
                print(f"Error loading ML assets: {e}")
                
    def is_trained(self):
        return self.model is not None and self.encoders is not None

    def predict(self, input_data):
        """
        Runs risk level prediction for input data.
        input_data format:
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
        if not self.is_trained():
            self.load_assets()
            if not self.is_trained():
                return {"error": "Model is not trained. Please run training pipeline first."}
                
        try:
            # Map input names to model features
            df = pd.DataFrame([{
                "Days for shipment (scheduled)": int(input_data.get("days_shipment_scheduled", 4)),
                "Shipping Mode": str(input_data.get("shipping_mode", "Standard Class")),
                "Customer Segment": str(input_data.get("customer_segment", "Consumer")),
                "Category Name": str(input_data.get("category_name", "Cleats")),
                "Product Price": float(input_data.get("product_price", 100.0)),
                "Sales": float(input_data.get("sales", 100.0)),
                "Order Item Discount Rate": float(input_data.get("discount_rate", 0.0))
            }])
            
            # Encode categorical features
            categorical_cols = ["Shipping Mode", "Customer Segment", "Category Name"]
            for col in categorical_cols:
                le = self.encoders[col]
                val = df.at[0, col]
                # Handle unseen labels by mapping to a default/closest in training
                if val not in le.classes_:
                    df.at[0, col] = le.classes_[0]
                df[col] = le.transform(df[col])
                
            # Run prediction
            pred_encoded = self.model.predict(df)[0]
            pred_prob = self.model.predict_proba(df)[0]
            
            # Decode prediction
            target_encoder = self.encoders["target"]
            predicted_label = target_encoder.inverse_transform([pred_encoded])[0]
            
            # Formulate probabilities dictionary
            probs_dict = {
                target_encoder.inverse_transform([i])[0]: float(prob)
                for i, prob in enumerate(pred_prob)
            }
            
            return {
                "prediction": predicted_label,
                "probabilities": probs_dict
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}

    def get_model_info(self):
        """Returns accuracy, confusion matrix, and feature importances."""
        if not self.is_trained():
            self.load_assets()
            if not self.is_trained():
                return {"error": "Model is not trained."}
        return self.metrics
