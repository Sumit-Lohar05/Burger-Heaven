require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const port = process.env.PORT || 3000;
const app = express();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

//Check Admin Session
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  } else {
    return res.status(403).send("Access Denied: Admins only");
  }
}

app.post('/create-order', async (req, res) => {
  try {
    const { full_name, email, burger_type, quantity, address, phone_number, message, amount } = req.body;
    
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        full_name,
        email,
        burger_type,
        quantity,
        address,
        phone_number,
        message
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, full_name, email, burger_type, quantity, address, phone_number, message, amount } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const sql = `INSERT INTO orders (full_name, email, burger_type, quantity, address, phone_number, message, payment_status, razorpay_order_id, razorpay_payment_id, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(sql, [full_name, email, burger_type, quantity, address, phone_number, message, 'paid', razorpay_order_id, razorpay_payment_id, amount], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, error: 'Database error' });
        }
        res.json({ success: true, message: 'Order placed and payment verified successfully!' });
      });
    } else {
      res.status(400).json({ success: false, error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/order', (req, res) => {
  const { full_name, email, burger_type, quantity, address, phone_number, message, amount } = req.body;
  const sql = `INSERT INTO orders (full_name, email, burger_type, quantity, address, phone_number, message, payment_status, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [full_name, email, burger_type, quantity, address, phone_number, message, 'pending', amount], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, message: 'Order placed successfully!' });
  });
});

// Show all orders (for admin)
app.get('/admin/orders', isAdmin, (req, res) => {
  const sort = req.query.sort === 'ASC' ? 'ASC' : 'DESC';
  db.query(`SELECT * FROM orders ORDER BY order_date ${sort}`, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get specific order details
app.get('/admin/orders/:id', isAdmin, (req, res) => {
  const orderId = req.params.id;
  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result[0]);
  });
});

//Delete Order
app.delete('/admin/orders/:id', isAdmin, (req, res) => {
  const orderId = req.params.id;
  db.query('DELETE FROM orders WHERE id = ?', [orderId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.status(200).json({ success: true });
  });
});



// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//Sign up route
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  const checkUser = 'SELECT * FROM users WHERE email = ?';
  db.query(checkUser, [email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (result.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const insertUser = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertUser, [name, email, password], (err, result) => {
      if (err) return res.status(500).json({ error: 'Signup failed' });
      res.json({ success: true, message: 'Signup successful' });
    });
  });
});

// Sign In route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  console.log("Login attempt:", req.body);

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("DB Error:", err); 
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      console.log("User not found"); 
      return res.status(400).json({ message: "Your account is not connected. Please Sign Up first." });
    }

    const user = results[0];
    if (user.password !== password) {
      console.log("Incorrect password"); 
      return res.status(400).json({ message: "Incorrect password." });
    }

    // Set session data
    const isAdmin = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: isAdmin
    };

    console.log(`Login successful: ${user.name}, Admin: ${isAdmin}`);

    res.json({
      message: "Login successful!",
      name: user.name,
      isAdmin: isAdmin
    });
  });
});



// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // optional
    res.json({ message: "Logged out successfully" });
  });
});

//Auth Check route
app.get("/auth/check", (req, res) => {
  if (req.session && req.session.user) {
    const isAdmin = req.session.user.email === process.env.ADMIN_EMAIL; 
    // ADMIN_EMAIL stored in .env, never sent to client
    res.json({
      loggedIn: true,
      user: { name: req.session.user.name, email: req.session.user.email },
      isAdmin
    });
  } else {
    res.json({ loggedIn: false });
  }
});
