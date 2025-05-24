-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  balance TEXT NOT NULL DEFAULT '0.00',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  service_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rate TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Processing',
  paypal_order_id TEXT,
  smm_order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create deposits table
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  paypal_order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);