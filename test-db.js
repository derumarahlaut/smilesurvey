// Test koneksi database
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'sql_skg_polkesba',
      password: 'pajajaran56',
      database: 'sql_skg_polkesba'
    });
    
    console.log('✅ Database connected successfully!');
    
    // Test query
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.length > 0 ? tables.map(t => Object.values(t)[0]) : 'No tables found');
    
    // Test patients table if exists
    try {
      const [patients] = await connection.execute('SELECT COUNT(*) as total FROM patients');
      console.log('👥 Total patients in database:', patients[0].total);
    } catch (error) {
      console.log('⚠️  Patients table not found - you need to run the SQL queries first');
    }
    
    await connection.end();
    console.log('Connection closed.');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔑 Please check your database credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Please check if MySQL server is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🗄️  Database does not exist. Please create database first');
    }
  }
}

testDatabaseConnection();