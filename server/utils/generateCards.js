const db = require('../config/database');

function generateBingoCard() {
  const card = [];
  const ranges = [
    [1, 15],   // B column
    [16, 30],  // I column
    [31, 45],  // N column
    [46, 60],  // G column
    [61, 75]   // O column
  ];
  
  for (let col = 0; col < 5; col++) {
    const column = [];
    const [min, max] = ranges[col];
    const usedNumbers = new Set();
    
    for (let row = 0; row < 5; row++) {
      if (col === 2 && row === 2) {
        column.push('FREE');
        continue;
      }
      
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (usedNumbers.has(num));
      
      usedNumbers.add(num);
      column.push(num);
    }
    
    card.push(column);
  }
  
  return card;
}

async function generate100Cards() {
  console.log('🎴 Generating 100 unique Bingo cards...');
  
  try {
    const connection = await db.getConnection();
    
    try {
      // Check if cards already exist
      const [existing] = await connection.query('SELECT COUNT(*) as count FROM bingo_cards');
      
      if (existing[0].count >= 100) {
        console.log('✅ 100 cards already exist in database');
        return;
      }
      
      // Clear existing cards
      await connection.query('DELETE FROM bingo_cards');
      
      // Generate and insert 100 cards
      for (let i = 1; i <= 100; i++) {
        const card = generateBingoCard();
        await connection.query(
          'INSERT INTO bingo_cards (card_id, grid_data) VALUES (?, ?)',
          [i, JSON.stringify(card)]
        );
        
        if (i % 10 === 0) {
          console.log(`✅ Generated ${i}/100 cards`);
        }
      }
      
      console.log('🎉 Successfully generated 100 unique Bingo cards!');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Error generating cards:', error);
    throw error;
  }
}

module.exports = { generate100Cards, generateBingoCard };
