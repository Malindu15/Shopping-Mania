from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    
    # Convert rows to dicts
    products_list = []
    for p in products:
        products_list.append({
            'id': p['id'],
            'name': p['name'],
            'category': p['category'],
            'price': p['price'],
            'oldPrice': p['oldPrice'],
            'image': p['image'],
            'rating': p['rating'],
            'reviews': p['reviews'],
            'discount': p['discount'],
            'badge': p['badge'],
            'description': p['description'],
            'featured': bool(p['featured'])
        })
    return jsonify(products_list)

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    print("Starting Shopping Mania server...")
    print("Access your site at: http://localhost:5000")
    app.run(debug=True, port=5000)
