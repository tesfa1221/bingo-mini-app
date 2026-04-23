-- Add card selection and penalty system fields

-- Add is_banned_until to users table
ALTER TABLE users 
ADD COLUMN is_banned_until TIMESTAMP NULL AFTER last_name;

-- Add card_id to tickets table (for 1-100 card selection)
ALTER TABLE tickets 
ADD COLUMN card_id INT NULL AFTER user_id,
ADD COLUMN false_bingo_count INT DEFAULT 0 AFTER is_winner;

-- Add game configuration fields
ALTER TABLE games 
ADD COLUMN registration_timer INT DEFAULT 60 AFTER max_players,
ADD COLUMN min_balls_for_bingo INT DEFAULT 5 AFTER registration_timer,
ADD COLUMN card_range_max INT DEFAULT 100 AFTER min_balls_for_bingo;

-- Create card_selections table for real-time card status
CREATE TABLE IF NOT EXISTS card_selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  card_id INT NOT NULL,
  user_id INT NULL,
  status ENUM('available', 'selected', 'confirmed') DEFAULT 'available',
  selected_at TIMESTAMP NULL,
  confirmed_at TIMESTAMP NULL,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_game_card (game_id, card_id),
  INDEX idx_game_status (game_id, status)
);

-- Create pre-generated cards table (100 unique cards)
CREATE TABLE IF NOT EXISTS bingo_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT UNIQUE NOT NULL,
  grid_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_card_id (card_id)
);
