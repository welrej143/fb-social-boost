import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    const result = await pool.query('SELECT current_database(), current_schema()');
    console.log('Current database and schema:', result.rows[0]);
    
    console.log('Checking for existing tables...');
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Existing tables:', tables.rows.map(r => r.table_name));
    
    console.log('Testing users table specifically...');
    try {
      const users = await pool.query('SELECT COUNT(*) FROM users');
      console.log('Users table exists, count:', users.rows[0].count);
    } catch (error) {
      console.log('Users table error:', error.message);
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Database check error:', error);
    process.exit(1);
  }
}

checkDatabase();