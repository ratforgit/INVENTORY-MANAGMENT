from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Product, Transaction, User
import hashlib
import uuid
from functools import wraps
from datetime import datetime
import os                

app = Flask(__name__)
@app.route('/')
def home():
    return "My Flask API is running successfully!"

CORS(app)

# Configure CORS properly
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173","https://inventory-managment-f86s.onrender.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inventory.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()
    print("✅ Database initialized successfully!")

# Helper functions
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    return str(uuid.uuid4())

# Store tokens (in production, use Redis or database)
tokens = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        print(f"🔐 Auth header received: {auth_header}")
        
        if not auth_header:
            print("❌ No Authorization header")
            return jsonify({'message': 'Token is missing'}), 401
        
        # Remove 'Bearer ' if present
        token = auth_header
        if token.startswith('Bearer '):
            token = token[7:]
        
        print(f"🔑 Token: {token[:20]}...")
        
        if token not in tokens:
            print("❌ Token not found in storage")
            return jsonify({'message': 'Token is invalid'}), 401
        
        print("✅ Token validated")
        return f(*args, **kwargs)
    return decorated

# ==================== HEALTH & SETUP ====================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running!'}), 200

@app.route('/api/setup', methods=['GET'])
def setup():
    try:
        if not User.query.first():
            test_user = User(
                username='admin',
                email='admin@example.com',
                password=hash_password('admin123')
            )
            db.session.add(test_user)
            db.session.commit()
            return jsonify({'message': '✅ Test user created! Use: admin@example.com / admin123'})
        return jsonify({'message': 'Users already exist'})
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# ==================== AUTHENTICATION ROUTES ====================
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'message': 'All fields are required'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        user = User(
            username=username,
            email=email,
            password=hash_password(password)
        )
        
        db.session.add(user)
        db.session.commit()
        
        token = generate_token()
        tokens[token] = user.id
        
        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'message': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        print(f"🔐 Login attempt: {email}")
        
        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or user.password != hash_password(password):
            print("❌ Invalid credentials")
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate token
        token = generate_token()
        tokens[token] = user.id
        print(f"✅ Login successful, token generated: {token[:20]}...")
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': 'Login failed'}), 500

@app.route('/api/logout', methods=['POST'])
@token_required
def logout():
    auth_header = request.headers.get('Authorization')
    token = auth_header.replace('Bearer ', '') if auth_header else None
    if token and token in tokens:
        del tokens[token]
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/debug-token', methods=['GET'])
@token_required
def debug_token():
    auth_header = request.headers.get('Authorization')
    token = auth_header.replace('Bearer ', '') if auth_header else None
    user_id = tokens.get(token)
    return jsonify({
        'token_valid': True,
        'user_id': user_id,
        'tokens_count': len(tokens),
        'auth_header': auth_header
    }), 200

# ==================== PRODUCT ROUTES ====================
@app.route('/api/products', methods=['GET'])
@token_required
def get_products():
    try:
        products = Product.query.all()
        return jsonify([product.to_dict() for product in products])
    except Exception as e:
        print(f"Get products error: {str(e)}")
        return jsonify({'message': 'Failed to fetch products'}), 500

@app.route('/api/products', methods=['POST'])
@token_required
def create_product():
    try:
        data = request.json
        product = Product(
            name=data['name'],
            sku=data.get('sku', ''),
            description=data.get('description', ''),
            quantity=data.get('quantity', 0),
            price=data['price'],
            category=data.get('category', ''),
            reorder_level=data.get('reorder_level', 10)
        )
        db.session.add(product)
        db.session.commit()
        return jsonify(product.to_dict()), 201
    except Exception as e:
        print(f"Add product error: {str(e)}")
        return jsonify({'message': 'Failed to add product'}), 500

@app.route('/api/products/<int:id>', methods=['PUT'])
@token_required
def update_product(id):
    try:
        # product = Product.query.get_or_404(id)
        product = db.session.get(Product, id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        data = request.json
        product.name = data.get('name', product.name)
        product.sku = data.get('sku', product.sku)
        product.description = data.get('description', product.description)
        product.quantity = data.get('quantity', product.quantity)
        product.price = data.get('price', product.price)
        product.category = data.get('category', product.category)
        product.reorder_level = data.get('reorder_level', product.reorder_level)
        product.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify(product.to_dict())
    except Exception as e:
        print(f"Update product error: {str(e)}")
        return jsonify({'message': 'Failed to update product'}), 500

@app.route('/api/products/<int:id>', methods=['DELETE'])
@token_required
def delete_product(id):
    try:
        product = Product.query.get_or_404(id)
        
        # NEW LINE: Delete all transactions linked to this product first!
        # (If your transaction model is named differently, use that name here)
        Transaction.query.filter_by(product_id=id).delete()
        
        # Now it is safe to delete the product
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product and associated transactions deleted'})
    except Exception as e:
        print(f"Delete product error: {str(e)}")
        return jsonify({'message': f'Failed to delete product: {str(e)}'}), 500

# ==================== TRANSACTION ROUTES ====================
@app.route('/api/transactions', methods=['POST'])
@token_required
def create_transaction():
    try:
        data = request.json
        transaction = Transaction(
            product_id=data['product_id'],
            type=data['type'],
            quantity=data['quantity'],
            notes=data.get('notes', '')
        )
        
        product = Product.query.get(data['product_id'])
        if data['type'] == 'in':
            product.quantity += data['quantity']
        else:
            product.quantity -= data['quantity']
        
        db.session.add(transaction)
        db.session.commit()
        return jsonify(transaction.to_dict()), 201
    except Exception as e:
        print(f"Add transaction error: {str(e)}")
        return jsonify({'message': 'Failed to add transaction'}), 500

@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions():
    try:
        transactions = Transaction.query.order_by(Transaction.timestamp.desc()).limit(100).all()
        return jsonify([t.to_dict() for t in transactions])
    except Exception as e:
        print(f"Get transactions error: {str(e)}")
        return jsonify({'message': 'Failed to fetch transactions'}), 500

# ==================== STATS ROUTES ====================
@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats():
    try:
        total_products = Product.query.count()
        low_stock_count = Product.query.filter(Product.quantity < Product.reorder_level).count()
        total_value = db.session.query(db.func.sum(Product.quantity * Product.price)).scalar() or 0
        
        # Get today's transaction count
        today = datetime.utcnow().date()
        transactions_today = Transaction.query.filter(
            db.func.date(Transaction.timestamp) == today
        ).count()
        
        return jsonify({
            'total_products': total_products,
            'low_stock_count': low_stock_count,
            'total_value': float(total_value),
            'transactions_today': transactions_today
        })
    except Exception as e:
        print(f"Get stats error: {str(e)}")
        return jsonify({'message': 'Failed to fetch stats'}), 500

# ==================== SAMPLE DATA ====================
@app.route('/api/sample-products', methods=['POST'])
@token_required
def add_sample_products():
    try:
        sample_products = [
            {'name': 'MacBook Pro', 'sku': 'MBP-001', 'description': '16-inch, M3 Pro chip', 'quantity': 10, 'price': 2499.99, 'category': 'Electronics', 'reorder_level': 5},
            {'name': 'iPhone 15 Pro', 'sku': 'IP-001', 'description': '128GB, Titanium', 'quantity': 25, 'price': 999.99, 'category': 'Electronics', 'reorder_level': 10},
            {'name': 'AirPods Pro', 'sku': 'AP-001', 'description': 'Noise cancellation', 'quantity': 30, 'price': 249.99, 'category': 'Audio', 'reorder_level': 10},
            {'name': 'iPad Air', 'sku': 'IPAD-001', 'description': '10.9-inch, M1 chip', 'quantity': 15, 'price': 599.99, 'category': 'Electronics', 'reorder_level': 5},
            {'name': 'Magic Keyboard', 'sku': 'MK-001', 'description': 'For iPad Pro', 'quantity': 8, 'price': 299.99, 'category': 'Accessories', 'reorder_level': 3},
            {'name': 'USB-C Hub', 'sku': 'USB-001', 'description': '7-in-1 multiport adapter', 'quantity': 45, 'price': 49.99, 'category': 'Accessories', 'reorder_level': 20},
            {'name': 'Screen Protector', 'sku': 'SP-001', 'description': 'Tempered glass', 'quantity': 100, 'price': 19.99, 'category': 'Accessories', 'reorder_level': 30},
            {'name': 'Laptop Stand', 'sku': 'LS-001', 'description': 'Aluminum adjustable', 'quantity': 20, 'price': 39.99, 'category': 'Furniture', 'reorder_level': 10},
        ]
        
        added = 0
        for p in sample_products:
            # Check if product with same SKU exists
            existing = Product.query.filter_by(sku=p['sku']).first()
            if not existing:
                product = Product(**p)
                db.session.add(product)
                added += 1
        
        db.session.commit()
        return jsonify({'message': f'✅ Added {added} sample products!'})
    except Exception as e:
        print(f"Sample products error: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/verify', methods=['GET'])
@token_required
def verify_token():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '')
    user_id = tokens.get(token)
    return jsonify({'valid': True, 'user_id': user_id}), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))