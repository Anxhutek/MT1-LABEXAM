import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory Shopping Cart data store (Array of objects)
let cartItems = [
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

// Helper to calculate total price per item
const getCartWithTotals = () => {
  return cartItems.map((item) => ({
    ...item,
    totalPrice: item.price * item.quantity
  }));
};

// Create the HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Route: GET /
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Welcome - Shopping Cart App</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc; }
          h1 { color: #1e40af; }
          p { font-size: 1.1rem; color: #475569; }
          ul { list-style: none; padding: 0; }
          li { margin: 10px 0; }
          a { color: #2563eb; text-decoration: none; font-weight: bold; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Welcome to the Shopping Cart Management Web Application</h1>
        <p>This server is implemented using Node.js core HTTP and FS modules.</p>
        <h3>Available Navigation Routes:</h3>
        <ul>
          <li><a href="/home">/home - Interactive Web UI (Served via FS)</a></li>
          <li><a href="/cart">/cart - View Cart Items (JSON Format)</a></li>
          <li><a href="/about">/about - About Application</a></li>
        </ul>
      </body>
      </html>
    `);
    return;
  }

  // Route: GET /about
  if (pathname === '/about' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>About - Shopping Cart App</title>
        <style>
          body { font-family: sans-serif; padding: 40px; background: #f8fafc; max-width: 700px; margin: auto; }
          h1 { color: #1e40af; }
          p { color: #334155; line-height: 1.6; }
          a { color: #2563eb; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>About Shopping Cart Application</h1>
        <p><strong>Course:</strong> Full Stack Development – Node.js Lab Examination (MT1)</p>
        <p><strong>Description:</strong> A shopping cart management system demonstrating native HTTP routing, body stream parsing, in-memory array manipulation, and static file serving with the FS module.</p>
        <p><strong>Developed With:</strong> Node.js Built-in HTTP and File System (FS) modules without external web frameworks.</p>
        <p><a href="/">&larr; Back to Home</a></p>
      </body>
      </html>
    `);
    return;
  }

  // Route: GET /home (Static file serving using FS module)
  if (pathname === '/home' && method === 'GET') {
    const filePath = path.join(__dirname, 'public', 'index.html');

    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error: Unable to read file', details: err.message }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  // Route: GET /cart
  if (pathname === '/cart' && method === 'GET') {
    const items = getCartWithTotals();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(items, null, 2));
    return;
  }

  // Route: POST /add-to-cart
  if (pathname === '/add-to-cart' && method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        const { id, productName, price, quantity, category } = parsedBody;

        // Validation for required fields: id, productName, price, and quantity
        if (
          id === undefined ||
          productName === undefined ||
          price === undefined ||
          quantity === undefined ||
          productName.trim() === '' ||
          typeof price !== 'number' ||
          typeof quantity !== 'number'
        ) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Bad Request',
              message: 'Validation failed: id, productName, price (number), and quantity (number) are required.'
            })
          );
          return;
        }

        const newProduct = {
          id: Number(id),
          productName: productName.trim(),
          price: Number(price),
          quantity: Number(quantity),
          category: category ? category.trim() : 'General'
        };

        cartItems.push(newProduct);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            message: 'Product added successfully to cart',
            product: {
              ...newProduct,
              totalPrice: newProduct.price * newProduct.quantity
            }
          })
        );
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error: 'Bad Request',
            message: 'Invalid JSON payload received in request body.'
          })
        );
      }
    });
    return;
  }

  // A5: Error Handling - 404 for invalid routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      error: 'Not Found',
      message: `The requested route '${pathname}' with method '${method}' was not found on this HTTP server.`
    })
  );
});

// Start the HTTP Server on Port 3000
server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
