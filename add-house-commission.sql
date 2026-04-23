-- Add house commission system to games table

ALTER TABLE games 
ADD COLUMN house_commission DECIMAL(5,2) DEFAULT 10.00 AFTER prize_pool,
ADD COLUMN house_earnings DECIMAL(10,2) DEFAULT 0.00 AFTER house_commission;

-- Create house_earnings table to track platform revenue
CREATE TABLE IF NOT EXISTS house_earnings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_percent DECIMAL(5,2) NOT NULL,
  total_bets DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_created_at (created_at)
);
