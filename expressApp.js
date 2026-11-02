import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

// B1 & B3: Initial Cart Items
let cart = [
  { id: 1, productName: 'Wireless Mouse', price: 799, quantity: 2, category: 'Electronics' },
  { id: 2, productName: 'Mechanical Keyboard', price: 2499, quantity: 1, category: 'Electronics' },
  { id: 3, productName: 'USB-C Multiport Hub', price: 1299, quantity: 1, category: 'Accessories' }
];

// Helper to compute item total price (price * quantity)
const withTotal = (item) => ({ ...item, totalPrice: item.price * item.quantity });

// B2 & B4: CRUD Operations
// 1. GET /cart - Retrieve all items
app.get('/cart', (req, res) => {
  const items = cart.map(withTotal);
  const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  res.json({ totalItems: cart.length, grandTotal, cart: items });
});

// 2. GET /cart/:id - Retrieve item by ID
app.get('/cart/:id', (req, res) => {
  const item = cart.find((p) => p.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: `Product with ID ${req.params.id} not found` });
  res.json(withTotal(item));
});

// 3. POST /cart - Add new product
app.post('/cart', (req, res) => {
  const { id, productName, price, quantity, category } = req.body;
  if (!id || !productName || price == null || quantity == null) {
    return res.status(400).json({ message: 'Validation failed: id, productName, price, and quantity are required.' });
  }
  const newProduct = { id: Number(id), productName, price: Number(price), quantity: Number(quantity), category: category || 'General' };
  cart.push(newProduct);
  res.status(201).json({ message: 'Product added successfully', product: withTotal(newProduct) });
});

// 4. PUT /cart/:id - Update product details
app.put('/cart/:id', (req, res) => {
  const item = cart.find((p) => p.id === Number(req.params.id));
  if (!item) return res.status(404).json({ message: `Product with ID ${req.params.id} not found` });

  const { productName, price, quantity, category } = req.body;
  if (productName) item.productName = productName;
  if (price != null) item.price = Number(price);
  if (quantity != null) item.quantity = Number(quantity);
  if (category) item.category = category;

  res.json({ message: 'Product updated successfully', product: withTotal(item) });
});

// 5. DELETE /cart/:id - Remove product
app.delete('/cart/:id', (req, res) => {
  const index = cart.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: `Product with ID ${req.params.id} not found` });

  const deletedProduct = cart.splice(index, 1)[0];
  res.json({ message: `Product with ID ${req.params.id} deleted successfully`, deletedProduct });
});

// 404 Fallback
app.use((req, res) => res.status(404).json({ error: 'Not Found', message: `Route ${req.url} does not exist.` }));

app.listen(PORT, () => console.log(`Express Server running at http://localhost:${PORT}`));
