import sqlite3
import json

products_data = [
  {
    "id": 1,
    "name": "Velvet Matte Lipstick",
    "category": "Beauty",
    "price": 1000,
    "oldPrice": 2500,
    "image": "images/velvet-matte-lipstick.jpg",
    "rating": 5,
    "reviews": 128,
    "discount": 30,
    "badge": "discount",
    "description": "A rich, long-lasting velvet matte lipstick with intense pigmentation. Formulated for all-day wear without drying out your lips.",
    "featured": True
  },
  {
    "id": 2,
    "name": "Glow Blusher Palette",
    "category": "Beauty",
    "price": 500,
    "oldPrice": 800,
    "image": "images/glow-blusher-palette.jpg",
    "rating": 4,
    "reviews": 86,
    "discount": 15,
    "badge": "discount",
    "description": "A versatile multi-shade blusher palette for a natural, radiant look. Buildable coverage with a silky-smooth finish.",
    "featured": True
  },
  {
    "id": 3,
    "name": "Foundation",
    "category": "Beauty",
    "price": 8900,
    "oldPrice": 12500,
    "image": "images/foundation.jpg",
    "rating": 5,
    "reviews": 312,
    "discount": 30,
    "badge": "discount",
    "description": "Flawless coverage liquid foundation. Long-lasting formula that blends seamlessly.",
    "featured": True
  },
  {
    "id": 4,
    "name": "Brush",
    "category": "Beauty",
    "price": 7500,
    "oldPrice": 10000,
    "image": "images/brush.jpg",
    "rating": 4,
    "reviews": 74,
    "discount": 25,
    "badge": "discount",
    "description": "Professional grade makeup brush for perfect application and blending.",
    "featured": True
  },
  {
    "id": 5,
    "name": "Laptop Ultra Slim",
    "category": "Electronics",
    "price": 150000,
    "oldPrice": 185000,
    "image": "images/laptop-ultra-slim.jpg",
    "rating": 5,
    "reviews": 201,
    "discount": 19,
    "badge": "new",
    "description": "Ultra-thin powerhouse laptop featuring a stunning 4K display, all-day battery, and blazing-fast performance.",
    "featured": False
  },
  {
    "id": 6,
    "name": "Sponge",
    "category": "Beauty",
    "price": 4500,
    "oldPrice": 6000,
    "image": "images/sponge.jpg",
    "rating": 4,
    "reviews": 55,
    "discount": 25,
    "badge": "discount",
    "description": "Soft makeup sponge for an airbrushed, flawless finish.",
    "featured": False
  },
  {
    "id": 7,
    "name": "Hand Cream",
    "category": "Beauty",
    "price": 5500,
    "oldPrice": 7000,
    "image": "images/hand-cream.jpg",
    "rating": 5,
    "reviews": 440,
    "discount": 21,
    "badge": "new",
    "description": "Nourishing hand cream that hydrates and repairs dry skin instantly.",
    "featured": False
  },
  {
    "id": 8,
    "name": "Luxury Sneakers",
    "category": "Shoes",
    "price": 9800,
    "oldPrice": 12000,
    "image": "images/product8.jpg",
    "rating": 4,
    "reviews": 93,
    "discount": 18,
    "badge": "discount",
    "description": "Premium leather sneakers combining orthopedic comfort with modern luxury design.",
    "featured": False
  },
  {
    "id": 9,
    "name": "Eyelash Curler",
    "category": "Beauty",
    "price": 2200,
    "oldPrice": 3200,
    "image": "images/eyelash-curler.jpg",
    "rating": 5,
    "reviews": 167,
    "discount": 31,
    "badge": "new",
    "description": "High-quality eyelash curler for perfectly lifted and curled lashes all day.",
    "featured": False
  }
]

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # Drop table if it exists
    cursor.execute('''DROP TABLE IF EXISTS products''')
    
    # Create products table
    cursor.execute('''
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            oldPrice REAL,
            image TEXT,
            rating REAL,
            reviews INTEGER,
            discount INTEGER,
            badge TEXT,
            description TEXT,
            featured BOOLEAN
        )
    ''')
    
    # Insert data
    for p in products_data:
        cursor.execute('''
            INSERT INTO products (id, name, category, price, oldPrice, image, rating, reviews, discount, badge, description, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (p['id'], p['name'], p['category'], p['price'], p['oldPrice'], p['image'], p['rating'], p['reviews'], p['discount'], p['badge'], p['description'], p['featured']))
    
    conn.commit()
    conn.close()
    print("Database initialized successfully with 9 products.")

if __name__ == '__main__':
    init_db()
