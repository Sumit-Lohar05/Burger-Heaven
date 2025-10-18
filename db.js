const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: true 
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('MySQL (TiDB Cloud) Connected...');
});

module.exports = db;
