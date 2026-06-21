import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder
from backend.config import Config

def train_model():
    print("Starting Machine Learning Model Training...")
    
    # 1. Read Dataset CSV
    csv_path = Config.DATASET_PATH
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}. Running generator first...")
        from backend.etl.generate_mock_data import generate_data
        generate_data(18500)
        
    df = pd.read_csv(csv_path, encoding='utf-8')
    
    # Clean data (ensure same cleaning as ETL)
    df = df.dropna(subset=["Order Id", "Customer Id", "Product Card Id"])
    
    # Compute Delivery_Delay and Risk_Level for training labels
    df["Delivery_Delay"] = df["Days for shipping (real)"] - df["Days for shipment (scheduled)"]
    
    def calculate_risk(row):
        delay = row["Delivery_Delay"]
        profit = row["Benefit per order"]
        if delay > 0 and profit < 0:
            return "High"
        elif delay > 0 or profit < 0:
            return "Medium"
        else:
            return "Low"
            
    df["Risk_Level"] = df.apply(calculate_risk, axis=1)
    
    # 2. Feature Selection (features available at order/shipping booking time)
    feature_cols = [
        "Days for shipment (scheduled)", 
        "Shipping Mode", 
        "Customer Segment", 
        "Category Name", 
        "Product Price", 
        "Sales", 
        "Order Item Discount Rate"
    ]
    
    X = df[feature_cols].copy()
    y = df["Risk_Level"].copy()
    
    # Handle missing values in features
    X["Days for shipment (scheduled)"] = X["Days for shipment (scheduled)"].fillna(0).astype(int)
    X["Shipping Mode"] = X["Shipping Mode"].fillna("Standard Class").astype(str)
    X["Customer Segment"] = X["Customer Segment"].fillna("Consumer").astype(str)
    X["Category Name"] = X["Category Name"].fillna("Cleats").astype(str)
    X["Product Price"] = X["Product Price"].fillna(0.0).astype(float)
    X["Sales"] = X["Sales"].fillna(0.0).astype(float)
    X["Order Item Discount Rate"] = X["Order Item Discount Rate"].fillna(0.0).astype(float)
    
    # 3. Categorical Encoding
    encoders = {}
    categorical_cols = ["Shipping Mode", "Customer Segment", "Category Name"]
    
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le
        
    # Fit LabelEncoder on target variable
    target_encoder = LabelEncoder()
    y_encoded = target_encoder.fit_transform(y)
    encoders["target"] = target_encoder
    
    # 4. Split Train/Test
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)
    
    # 5. Train Decision Tree
    # Use max_depth to keep the tree simple and prevent overfitting
    model = DecisionTreeClassifier(max_depth=6, random_state=42)
    model.fit(X_train, y_train)
    
    # 6. Evaluate Model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    # Get class names in correct order
    classes = target_encoder.classes_.tolist()
    
    # Confusion Matrix as structured JSON
    cm_dict = {}
    for i, true_label in enumerate(classes):
        cm_dict[true_label] = {}
        for j, pred_label in enumerate(classes):
            cm_dict[true_label][pred_label] = int(cm[i][j])
            
    # Feature Importances
    importances = model.feature_importances_
    feature_importance_dict = {
        col: float(imp) for col, imp in zip(feature_cols, importances)
    }
    # Sort feature importances
    feature_importance_dict = dict(sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True))
    
    # Save Model and Encoders
    os.makedirs(os.path.dirname(Config.MODEL_PATH), exist_ok=True)
    joblib.dump(model, Config.MODEL_PATH)
    joblib.dump(encoders, Config.ENCODER_PATH)
    
    # Save Metrics File
    metrics = {
        "accuracy": float(accuracy),
        "confusion_matrix": cm_dict,
        "feature_importance": feature_importance_dict,
        "classes": classes
    }
    
    metrics_path = os.path.join(os.path.dirname(Config.MODEL_PATH), "model_metrics.json")
    with open(metrics_path, "w") as mf:
        json.dump(metrics, mf, indent=4)
        
    print("Model trained and metrics saved successfully!")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Feature Importance: {feature_importance_dict}")

if __name__ == "__main__":
    train_model()
