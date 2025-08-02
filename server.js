const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // your MySQL username
  password: 'SumiT@8619',       // your MySQL password (if any)
  database: 'burger_heaven'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Save order route
app.post('/order', (req, res) => {
  const { full_name, email, burger_type, quantity, address, phone_number, message } = req.body;
  const sql = `INSERT INTO orders (full_name, email, burger_type, quantity, address, phone_number, message) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [full_name, email, burger_type, quantity, address, phone_number, message], (err, result) => {
    if (err) throw err;
    res.json({ success: true, message: 'Order placed successfully!' });
  });
});

// Show all orders (for admin)
app.get('/admin/orders', (req, res) => {
  const sort = req.query.sort === 'ASC' ? 'ASC' : 'DESC';  // Default DESC
  db.query(`SELECT * FROM orders ORDER BY order_date ${sort}`, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

//Delete Order
app.delete('/admin/orders/:id', (req, res) => {
  const orderId = req.params.id;

  console.log(`Attempting to delete order ID: ${orderId}`); // Debugging

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

app.use(express.static(path.join(__dirname, 'public')));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

