import os
import csv
import random
from datetime import datetime, timedelta

def generate_data(num_records=18500):
    print(f"Generating {num_records} mock records for DataCo Smart Supply Chain Dataset...")
    
    # Ensure dataset directory exists
    os.makedirs(os.path.join("backend", "dataset"), exist_ok=True)
    csv_file_path = os.path.join("backend", "dataset", "DataCoSupplyChainDataset.csv")
    
    # Fields matching the original dataset
    headers = [
        "Type", "Days for shipping (real)", "Days for shipment (scheduled)", 
        "Benefit per order", "Sales per customer", "Delivery Status", 
        "Late_delivery_risk", "Category Id", "Category Name", "Customer City", 
        "Customer Country", "Customer Email", "Customer Fname", "Customer Id", 
        "Customer Lname", "Customer Password", "Customer Segment", "Customer State", 
        "Customer Street", "Customer Zipcode", "Department Id", "Department Name", 
        "Latitude", "Longitude", "Market", "Order City", "Order Country", 
        "Order Customer Id", "order date (DateOrders)", "Order Id", 
        "Order Item Cardprod Id", "Order Item Discount", "Order Item Discount Rate", 
        "Order Item Id", "Order Item Product Price", "Order Item Profit Ratio", 
        "Order Item Quantity", "Sales", "Order Item Total", "Order Profit Per Order", 
        "Order Region", "Order State", "Order Status", "Order Zipcode", 
        "Product Card Id", "Product Category Id", "Product Description", 
        "Product Image", "Product Name", "Product Price", "Product Status", 
        "shipping date (DateOrders)", "Shipping Mode"
    ]
    
    # Sample pools for realistic data
    payment_types = ["DEBIT", "TRANSFER", "CASH", "PAYMENT"]
    customer_segments = ["Consumer", "Corporate", "Home Office"]
    shipping_modes = ["Standard Class", "Second Class", "First Class", "Same Day"]
    markets = ["Pacific Asia", "USCA", "Latin America", "Europe", "Africa"]
    
    categories = [
        (1, "Cleats", "Apparel"),
        (2, "Men's Footwear", "Footwear"),
        (3, "Women's Apparel", "Apparel"),
        (4, "Indoor/Outdoor Games", "Outdoors"),
        (5, "Water Sports", "Outdoors"),
        (6, "Camping & Hiking", "Outdoors"),
        (7, "Cardio Equipment", "Fitness"),
        (8, "Shop By Sport", "Apparel"),
        (9, "Golf", "Outdoors"),
        (10, "Electronics", "Electronics")
    ]
    
    product_names = {
        1: ["Adidas Men's F10", "Nike Cleats", "Puma King Cleats"],
        2: ["Nike Men's Free 5.0+", "Under Armour Running Shoes", "Adidas Originals"],
        3: ["Nike Women's Running Shoes", "Adidas Sports Bra", "Under Armour Leggings"],
        4: ["Ona Offroad Games", "Spikeball Set", "Cornhole Toss Game"],
        5: ["Pelican Sport Kayak", "Life Vest Blue", "Snorkel Mask goggles"],
        6: ["Coleman 4-Person Tent", "Sleeping Bag Cold Weather", "Hiking Backpack 50L"],
        7: ["ProForm Treadmill", "Sole F85 Treadmill", "Schwinn Elliptical"],
        8: ["Under Armour Men's Armour Fleece", "Nike Golf Shirt", "Puma Training Top"],
        9: ["TaylorMade M2 Driver", "Callaway Iron Set", "Titleist Pro V1 Golf Balls"],
        10: ["Apple Watch Series 3", "Bose Wireless Headphones", "Fitbit Charge 2"]
    }
    
    cities = [
        ("Caguas", "PR", "Puerto Rico"), ("Chicago", "IL", "US"), ("Los Angeles", "CA", "US"),
        ("Brooklyn", "NY", "US"), ("Houston", "TX", "US"), ("Miami", "FL", "US"),
        ("San Francisco", "CA", "US"), ("Seattle", "WA", "US"), ("Boston", "MA", "US"),
        ("Atlanta", "GA", "US")
    ]
    
    order_cities = [
        ("Santo Domingo", "Dominican Republic", "LATAM"), ("San Jose", "Costa Rica", "LATAM"),
        ("Los Angeles", "United States", "USCA"), ("Paris", "France", "Europe"),
        ("Tokyo", "Japan", "Pacific Asia"), ("Sydney", "Australia", "Pacific Asia"),
        ("London", "United Kingdom", "Europe"), ("Berlin", "Germany", "Europe"),
        ("Cairo", "Egypt", "Africa"), ("Mumbai", "India", "Pacific Asia")
    ]
    
    order_statuses = ["COMPLETE", "PROCESSING", "PENDING", "PENDING_PAYMENT", "CLOSED", "CANCELED", "ON_HOLD"]
    
    # Pre-generate lists to map consistently
    customers = []
    for c_id in range(1, 1001):
        fname = f"CustFirst{c_id}"
        lname = f"CustLast{c_id}"
        email = f"user_{c_id}@example.com"
        segment = random.choice(customer_segments)
        city, state, country = random.choice(cities)
        zipcode = f"{random.randint(10000, 99999)}"
        customers.append({
            "id": c_id, "fname": fname, "lname": lname, "email": email,
            "segment": segment, "city": city, "state": state, "country": country, "zipcode": zipcode
        })
        
    start_date = datetime(2015, 1, 1)
    
    # Write to CSV
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        order_counter = 100000
        order_item_counter = 500000
        
        for i in range(num_records):
            customer = random.choice(customers)
            cat_id, cat_name, dept_name = random.choice(categories)
            prod_name = random.choice(product_names[cat_id])
            prod_price = round(random.uniform(15.0, 350.0), 2)
            
            qty = random.randint(1, 5)
            sales = round(prod_price * qty, 2)
            discount_rate = random.choice([0.0, 0.05, 0.1, 0.15, 0.2])
            discount = round(sales * discount_rate, 2)
            item_total = round(sales - discount, 2)
            
            # Profit can be positive or negative
            profit_ratio = random.uniform(-0.3, 0.4)
            profit = round(item_total * profit_ratio, 2)
            
            # Dates
            days_offset = random.randint(0, 1000)
            ord_date = start_date + timedelta(days=days_offset, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            # Shipping Modes and Days
            ship_mode = random.choice(shipping_modes)
            if ship_mode == "Same Day":
                sched_days = 0
                real_days = random.choice([0, 0, 0, 1])
            elif ship_mode == "First Class":
                sched_days = 1
                real_days = random.choice([1, 1, 2, 3])
            elif ship_mode == "Second Class":
                sched_days = 3
                real_days = random.choice([2, 3, 3, 4, 5])
            else: # Standard Class
                sched_days = 4
                real_days = random.choice([3, 4, 4, 5, 6, 7])
                
            shipping_date = ord_date + timedelta(days=real_days)
            
            # Status and Risk
            late = real_days > sched_days
            risk = 1 if late else 0
            
            if risk == 1:
                delivery_status = "Late delivery"
                status = random.choice(["PROCESSING", "PENDING", "ON_HOLD", "COMPLETE"])
            else:
                delivery_status = random.choice(["Shipping on time", "Advance shipping"])
                status = random.choice(["COMPLETE", "CLOSED"])
                
            # Random override for canceled orders
            if random.random() < 0.03:
                delivery_status = "Shipping canceled"
                status = "CANCELED"
                risk = 0
            
            order_city, order_country, market = random.choice(order_cities)
            
            row = [
                random.choice(payment_types),       # Type
                real_days,                          # Days for shipping (real)
                sched_days,                         # Days for shipment (scheduled)
                profit,                             # Benefit per order (Profit)
                item_total,                         # Sales per customer (Item Total after discount)
                delivery_status,                    # Delivery Status
                risk,                               # Late_delivery_risk
                cat_id,                             # Category Id
                cat_name,                           # Category Name
                customer["city"],                   # Customer City
                customer["country"],                # Customer Country
                customer["email"],                  # Customer Email
                customer["fname"],                  # Customer Fname
                customer["id"],                     # Customer Id
                customer["lname"],                  # Customer Lname
                "password123",                      # Customer Password
                customer["segment"],                # Customer Segment
                customer["state"],                  # Customer State
                "123 Main St",                      # Customer Street
                customer["zipcode"],                # Customer Zipcode
                cat_id + 10,                        # Department Id
                dept_name,                          # Department Name
                round(random.uniform(18.0, 45.0), 4), # Latitude
                round(random.uniform(-120.0, -65.0), 4), # Longitude
                market,                             # Market
                order_city,                         # Order City
                order_country,                      # Order Country
                customer["id"],                     # Order Customer Id
                ord_date.strftime("%m/%d/%Y %H:%M"), # order date (DateOrders)
                order_counter,                      # Order Id
                cat_id * 100 + 1,                   # Order Item Cardprod Id
                discount,                           # Order Item Discount
                discount_rate,                      # Order Item Discount Rate
                order_item_counter,                 # Order Item Id
                prod_price,                         # Order Item Product Price
                round(profit_ratio, 2),             # Order Item Profit Ratio
                qty,                                # Order Item Quantity
                sales,                              # Sales (Gross Sales)
                item_total,                         # Order Item Total (Net Sales)
                profit,                             # Order Profit Per Order
                "Region XYZ",                       # Order Region
                "State XYZ",                        # Order State
                status,                             # Order Status
                "12345",                            # Order Zipcode
                cat_id * 100 + 1,                   # Product Card Id
                cat_id,                             # Product Category Id
                "Product Description Text",         # Product Description
                "http://images.example.com/p.jpg",  # Product Image
                prod_name,                          # Product Name
                prod_price,                         # Product Price
                0,                                  # Product Status
                shipping_date.strftime("%m/%d/%Y %H:%M"), # shipping date (DateOrders)
                ship_mode                           # Shipping Mode
            ]
            
            writer.writerow(row)
            
            # Increment order counter occasionally to group multiple items in same order
            if random.random() > 0.3:
                order_counter += 1
            order_item_counter += 1
            
    print(f"Dataset generated successfully at: {csv_file_path}")

if __name__ == "__main__":
    generate_data()
