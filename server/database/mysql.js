const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'web_kasir',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL Error:', err.message);
    console.log('Pastikan MySQL/XAMPP sudah running!');
  } else {
    console.log('MySQL Connected Successfully!');
    connection.release();
  }
});

module.exports = promisePool;
