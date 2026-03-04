const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Koneksi tanpa specify database dulu
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true
});

console.log('🔄 Connecting to MySQL...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
    console.log('\n⚠️  Pastikan XAMPP MySQL sudah running!');
    console.log('⚠️  Buka XAMPP Control Panel → Start MySQL\n');
    process.exit(1);
  }

  console.log('✅ Connected to MySQL!');
  
  // Drop database jika sudah ada
  console.log('🔄 Dropping existing database (if exists)...');
  connection.query('DROP DATABASE IF EXISTS web_kasir', (dropErr) => {
    if (dropErr) {
      console.error('❌ Error dropping database:', dropErr.message);
      connection.end();
      process.exit(1);
    }
    
    console.log('✅ Old database dropped (if exists)');
    console.log('🔄 Reading database_full.sql...');

    // Baca file SQL (full = sudah include Vendra fields)
    const sqlFile = path.join(__dirname, 'database_full.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔄 Executing SQL commands...');

    // Execute SQL
    connection.query(sql, (error, results) => {
      if (error) {
        console.error('❌ Error executing SQL:', error.message);
        connection.end();
        process.exit(1);
      }

      console.log('✅ Database created successfully!');
      console.log('✅ All tables created!');
      console.log('✅ Sample data inserted!');
      console.log('\n📊 Database ready:');
      console.log('   - Database: web_kasir');
      console.log('   - Tables: 8 tables');
      console.log('   - Admin: admin / admin123');
      console.log('   - Kasir: kasir1 / admin123');
      console.log('\n🚀 Restart server dengan: npm run server');
      console.log('🌐 Login di: http://localhost:3000\n');

      connection.end();
    });
  });
});
