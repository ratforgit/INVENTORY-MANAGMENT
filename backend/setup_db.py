from app import app, db
from models import Product, Transaction, User
import hashlib

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

with app.app_context():
    # Drop all tables and recreate
    db.drop_all()
    db.create_all()
    
    # Create test user
    test_user = User(
        username='admin',
        email='admin@example.com',
        password=hash_password('admin123')
    )
    db.session.add(test_user)
    
    # Create sample products with all fields
    sample_products = [
        {'name': 'MacBook Pro', 'sku': 'MBP-001', 'description': '16-inch, M3 Pro chip', 'quantity': 10, 'price': 2499.99, 'category': 'Electronics', 'reorder_level': 5},
        {'name': 'iPhone 15 Pro', 'sku': 'IP-001', 'description': '128GB, Titanium', 'quantity': 25, 'price': 999.99, 'category': 'Electronics', 'reorder_level': 10},
        {'name': 'AirPods Pro', 'sku': 'AP-001', 'description': 'Noise cancellation', 'quantity': 30, 'price': 249.99, 'category': 'Audio', 'reorder_level': 10},
        {'name': 'iPad Air', 'sku': 'IPAD-001', 'description': '10.9-inch, M1 chip', 'quantity': 15, 'price': 599.99, 'category': 'Electronics', 'reorder_level': 5},
        {'name': 'USB-C Hub', 'sku': 'USB-001', 'description': '7-in-1 multiport adapter', 'quantity': 45, 'price': 49.99, 'category': 'Accessories', 'reorder_level': 20},
        {'name': 'Screen Protector', 'sku': 'SP-001', 'description': 'Tempered glass', 'quantity': 100, 'price': 19.99, 'category': 'Accessories', 'reorder_level': 30},
    ]
    
    for p in sample_products:
        product = Product(**p)
        db.session.add(product)
    
    db.session.commit()
    print("✅ Database setup complete!")
    print("📝 Login with: admin@example.com / admin123")
    print(f"📊 Created {len(sample_products)} sample products")