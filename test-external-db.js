const mysql = require('mysql2/promise');

async function testExternalConnection() {
  try {
    console.log('Testing external database connection...');
    
    const connection = await mysql.createConnection({
      host: '31.97.48.178',
      port: 3306,
      user: 'sql_skg_polkesba',
      password: 'pajajaran56',
      database: 'sql_skg_polkesba'
    });

    console.log('✅ Connected successfully!');
    
    // Test simple query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM patients');
    console.log('✅ Query successful:', rows[0]);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testExternalConnection();