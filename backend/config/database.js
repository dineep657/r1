import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Support both Railway's automatic MYSQL* variables and custom DB_* variables
// Railway automatically provides: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'codecollab',
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('🔌 Database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  hasPassword: !!dbConfig.password
});

const pool = mysql.createPool(dbConfig);

// Test database connection with retry logic (helpful for Railway)
async function testConnection(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All database connection attempts failed');
      }
    }
  }
}

testConnection();

// Ensure required tables exist
async function ensureSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_users_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    // eslint-disable-next-line no-console
    console.log('🛠️  Database schema ensured');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to ensure database schema:', err.message);
  }
}

ensureSchema();

export default pool;