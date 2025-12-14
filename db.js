const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: true, 
  }
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection failed:', err.code);
    throw err; 
  }
  console.log('MySQL (Secure) Connected...');
});

module.exports = db;
