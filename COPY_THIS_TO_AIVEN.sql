-- ============================================================================
-- BINGO MINI APP - DATABASE SCHEMA
-- ============================================================================
-- Copy this ENTIRE file and paste it into Aiven Query Editor
-- Then click "Execute" or "Run"
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  main_wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  play_wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_telegram_id (telegram_id)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type ENUM('deposit', 'withdraw') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  screenshot_url VARCHAR(500),
  transaction_ref VARCHAR(100) UNIQUE,
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_status (status)
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status ENUM('waiting', 'active', 'finished') DEFAULT 'waiting',
  prize_pool DECIMAL(10, 2) DEFAULT 0.00,
  bet_amount DECIMAL(10, 2) NOT NULL,
  max_players INT DEFAULT 10,
  current_players INT DEFAULT 0,
  called_numbers JSON,
  winner_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  finished_at TIMESTAMP NULL,
  INDEX idx_status (status)
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  user_id INT NOT NULL,
  grid_data JSON NOT NULL,
  marked_cells JSON,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_game_user (game_id, user_id),
  UNIQUE KEY unique_user_game (game_id, user_id)
);

-- ============================================================================
-- DEPLOYMENT COMPLETE!
-- ============================================================================
-- You should see 4 tables created:
-- 1. users
-- 2. transactions
-- 3. games
-- 4. tickets
-- ============================================================================
