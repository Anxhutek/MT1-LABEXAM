import express from 'express';

const app = express();
const PORT = 4000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// B1 & B3: Initialize Shopping Cart array with at least three sample items
let shoppingCart = [
  {
    id: 1,
    productName: 'Wireless Mouse',
    price: 799,
    quantity: 2,
    category: 'Electronics'
  },
  {
    id: 2,
    productName: 'Mechanical Keyboard',
    price: 2499,
    quantity: 1,
    category: 'Electronics'
  },
  {
    id: 3,
    productName: 'USB-C Multiport Hub',
    price: 1299,
    quantity: 1,
    category: 'Accessories'
  }
];

// Helper to calculate total price of an individual cart item (price * quantity)
const formatCartItem = (item) => ({
  id: item.id,
  productName: item.productName,
  price: item.price,
  quantity: item.quantity,
  category: item.category,
  totalPrice: item.price * item.quantity
});

// Root route for Port 4000
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express Shopping Cart REST API',
    endpoints: {
      getAll: 'GET /cart',
      getById: 'GET /cart/:id',
      addProduct: 'POST /cart',
      updateProduct: 'PUT /cart/:id',
      deleteProduct: 'DELETE /cart/:id'
    }
  });
});

// B2 & B4: 1. GET /cart - Retrieve all cart items
app.get('/cart', (req, res) => {
  const itemsWithTotals = shoppingCart.map(formatCartItem);
  const cartGrandTotal = itemsWithTotals.reduce((sum, item) => sum + item.totalPrice, 0);

  res.status(200).json({
    totalItems: shoppingCart.length,
    grandTotal: cartGrandTotal,
    cart: itemsWithTotals
  });
});

// B2 & B4: 2. GET /cart/:id - Retrieve a cart item by ID
app.get('/cart/:id', (req, res) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID. Must be a number.' });
  }

  const product = shoppingCart.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: `Product with ID ${productId} not found` });
  }

  res.status(200).json(formatCartItem(product));
});

// B2 & B4: 3. POST /cart - Add a new product to the cart
app.post('/cart', (req, res) => {
  const { id, productName, price, quantity, category } = req.body;

  // Validation
  if (id === undefined || !productName || price === undefined || quantity === undefined) {
    return res.status(400).json({
      message: 'Validation failed: id, productName, price, and quantity are required.'
    });
  }

  const numericId = Number(id);
  const numericPrice = Number(price);
  const numericQty = Number(quantity);

  if (isNaN(numericId) || isNaN(numericPrice) || isNaN(numericQty) || numericPrice < 0 || numericQty <= 0) {
    return res.status(400).json({
      message: 'Validation failed: id, price (>= 0), and quantity (> 0) must be valid numbers.'
    });
  }

  // Check if item with this ID already exists
  const existingProduct = shoppingCart.find((item) => item.id === numericId);
  if (existingProduct) {
    return res.status(400).json({
      message: `Product with ID ${numericId} already exists in cart. Use PUT /cart/${numericId} to update.`
    });
  }

  const newProduct = {
    id: numericId,
    productName: productName.trim(),
    price: numericPrice,
    quantity: numericQty,
    category: category ? category.trim() : 'General'
  };

  shoppingCart.push(newProduct);

  res.status(201).json({
    message: 'Product added successfully',
    product: formatCartItem(newProduct)
  });
});

// B2 & B4: 4. PUT /cart/:id - Update product details
app.put('/cart/:id', (req, res) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID. Must be a number.' });
  }

  const index = shoppingCart.findIndex((item) => item.id === productId);

  if (index === -1) {
    return res.status(404).json({ message: `Product with ID ${productId} not found` });
  }

  const { productName, price, quantity, category } = req.body;

  if (productName !== undefined) {
    shoppingCart[index].productName = productName.trim();
  }
  if (price !== undefined) {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number.' });
    }
    shoppingCart[index].price = numericPrice;
  }
  if (quantity !== undefined) {
    const numericQty = Number(quantity);
    if (isNaN(numericQty) || numericQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a valid number greater than 0.' });
    }
    shoppingCart[index].quantity = numericQty;
  }
  if (category !== undefined) {
    shoppingCart[index].category = category.trim();
  }

  res.status(200).json({
    message: 'Product updated successfully',
    product: formatCartItem(shoppingCart[index])
  });
});

// B2 & B4: 5. DELETE /cart/:id - Remove a product from the cart
app.delete('/cart/:id', (req, res) => {
  const productId = Number(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID. Must be a number.' });
  }

  const index = shoppingCart.findIndex((item) => item.id === productId);

  if (index === -1) {
    return res.status(404).json({ message: `Product with ID ${productId} not found` });
  }

  const deletedProduct = shoppingCart.splice(index, 1)[0];

  res.status(200).json({
    message: `Product with ID ${productId} deleted successfully`,
    deletedProduct
  });
});

// 404 Handler for invalid routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.url} does not exist on this Express server.`
  });
});

// Start Express server on Port 4000
app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
