import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'sql_skg_polkesba',
  password: process.env.DB_PASSWORD || 'pajajaran56',
  database: process.env.DB_NAME || 'sql_skg_polkesba',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;