import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

const products = [
  { id: 'p1', name: 'Lithium Ion Battery Pack 12V', description: 'High capacity 12V battery for electronics projects.', price: 1299.00, stock: 50 },
  { id: 'p2', name: 'AA Rechargeable Batteries (4-Pack)', description: 'NiMH rechargeable AA batteries 2000mAh.', price: 499.00, stock: 200 },
  { id: 'p3', name: 'USB-C Fast Charger 65W', description: 'GaN technology fast charger for laptops and phones.', price: 1499.00, stock: 120 },
  { id: 'p4', name: 'Arduino Uno R3', description: 'Microcontroller board based on the ATmega328P.', price: 1899.00, stock: 85 },
  { id: 'p5', name: 'Raspberry Pi 4 Model B', description: '4GB RAM mini computer.', price: 5499.00, stock: 30 }
];

const users = [
  { id: 'u1', email: 'alice@example.com', name: 'Alice Smith' },
  { id: 'u2', email: 'bob@example.com', name: 'Bob Jones' },
  { id: 'u3', email: 'charlie@example.com', name: 'Charlie Brown' }
];

function seed() {
  console.log("Starting SQLite seed process...");

  // Create tables
  db.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_time REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  console.log("Tables created successfully.");

  // Insert Users
  const insertUser = db.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)');
  users.forEach(u => insertUser.run(u.id, u.email, u.name));

  // Insert Products
  const insertProduct = db.prepare('INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)');
  products.forEach(p => insertProduct.run(p.id, p.name, p.description, p.price, p.stock));

  // Insert Orders
  const insertOrder = db.prepare('INSERT INTO orders (id, user_id, total_amount, status) VALUES (?, ?, ?, ?)');
  const insertOrderItem = db.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)');

  for (let i = 0; i < 10; i++) {
    const user = users[i % users.length];
    const p1 = products[Math.floor(Math.random() * products.length)];
    const p2 = products[Math.floor(Math.random() * products.length)];
    
    const total_amount = p1.price * 2 + p2.price * 1;
    const orderId = `o${i+1}`;

    insertOrder.run(orderId, user.id, total_amount, i % 3 === 0 ? 'delivered' : 'pending');
    insertOrderItem.run(`oi${i}_1`, orderId, p1.id, 2, p1.price);
    insertOrderItem.run(`oi${i}_2`, orderId, p2.id, 1, p2.price);
  }

  console.log("SQLite Seed completed successfully!");
}

seed();
