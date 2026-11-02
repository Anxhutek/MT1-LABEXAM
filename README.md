# MT1-LABEXAM: Shopping Cart Management Web Application

Full Stack Development – Node.js Lab Examination (MT1)

## Technologies Used
- **Node.js** (Native `http` module and `fs` module)
- **Express.js** (REST API framework)
- **JavaScript (ES6 Modules)**
- **In-Memory JavaScript Array** for cart data management

---

## Project Structure
```text
MT1-LABEXAM/
├── package.json
├── httpServer.js       # Part A: Native Node.js HTTP server (Port 3000)
├── expressApp.js       # Part B: Express.js REST API (Port 4000)
├── public/
│   └── index.html      # Static HTML page served via FS module
├── screenshots/        # Output / Postman verification screenshots
└── README.md
```

---

## Part A: HTTP Module & Server (`httpServer.js`)
Runs independently on **Port 3000**.

### Start Command:
```bash
node httpServer.js
# Output: HTTP Server running at http://localhost:3000
```

### Endpoints:
1. `GET http://localhost:3000/` — Welcome message in HTML format.
2. `GET http://localhost:3000/cart` — List of shopping cart items in JSON format with calculated total prices.
3. `GET http://localhost:3000/about` — Shopping cart application information.
4. `GET http://localhost:3000/home` — Serves `public/index.html` using the built-in `fs` module (`fs.readFile`) with `Content-Type: text/html`.
5. `POST http://localhost:3000/add-to-cart` — Accepts JSON body (`id`, `productName`, `price`, `quantity`), validates fields, adds item to in-memory array, and returns HTTP 201 status with success message.
6. **Error Handling**: Non-existent routes return HTTP 404 with JSON error details.

---

## Part B: Express.js REST API (`expressApp.js`)
Runs independently on **Port 4000**.

### Start Command:
```bash
node expressApp.js
# Output: Express Server running at http://localhost:4000
```

### Endpoints & CRUD Operations:
1. `GET http://localhost:4000/cart` — Retrieve all cart items and overall summary (`totalPrice = price * quantity`).
2. `GET http://localhost:4000/cart/:id` — Retrieve an individual cart item by route parameter `:id`. Returns HTTP 404 if not found.
3. `POST http://localhost:4000/cart` — Add a new product to cart. Returns HTTP 201 when added.
4. `PUT http://localhost:4000/cart/:id` — Update existing product details. Returns HTTP 200 with updated object or 404 if missing.
5. `DELETE http://localhost:4000/cart/:id` — Remove an item from the cart. Returns HTTP 200 or 404 if missing.

---

## Testing Guide (curl / Postman)

### 1. Test Part A Native HTTP Server:
```bash
# Welcome HTML
curl http://localhost:3000/

# About Page
curl http://localhost:3000/about

# Home (Static HTML served via FS)
curl http://localhost:3000/home

# Cart JSON
curl http://localhost:3000/cart

# Add to Cart (POST)
curl -X POST http://localhost:3000/add-to-cart \
  -H "Content-Type: application/json" \
  -d '{"id": 4, "productName": "Bluetooth Headphones", "price": 1499, "quantity": 1, "category": "Electronics"}'
```

### 2. Test Part B Express REST API:
```bash
# Retrieve All Items
curl http://localhost:4000/cart

# Retrieve Specific Item by ID
curl http://localhost:4000/cart/1

# Add New Item (POST)
curl -X POST http://localhost:4000/cart \
  -H "Content-Type: application/json" \
  -d '{"id": 4, "productName": "Bluetooth Headphones", "price": 1499, "quantity": 1, "category": "Electronics"}'

# Update Item Details (PUT)
curl -X PUT http://localhost:4000/cart/1 \
  -H "Content-Type: application/json" \
  -d '{"productName": "Wireless Mouse", "price": 899, "quantity": 3, "category": "Electronics"}'

# Delete Item (DELETE)
curl -X DELETE http://localhost:4000/cart/1
```
