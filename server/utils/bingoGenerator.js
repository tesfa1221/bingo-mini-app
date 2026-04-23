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

function validateBingo(gridData, markedCells, calledNumbers) {
  const calledSet = new Set(calledNumbers);
  const markedSet = new Set(JSON.parse(markedCells || '[]'));
  
  // Helper function to check if a cell is valid (marked and called)
  const isCellValid = (col, row) => {
    const cell = gridData[col][row];
    const cellKey = `${col}-${row}`;
    
    // FREE space is always valid
    if (cell === 'FREE') return true;
    
    // Cell must be marked by user AND actually called
    return markedSet.has(cellKey) && calledSet.has(cell);
  };
  
  // 1. Check Horizontal (ወደጎን) - Any full row
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      if (!isCellValid(col, row)) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return { valid: true, pattern: 'horizontal', row };
  }
  
  // 2. Check Vertical (ወደታች) - Any full column
  for (let col = 0; col < 5; col++) {
    let colComplete = true;
    for (let row = 0; row < 5; row++) {
      if (!isCellValid(col, row)) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return { valid: true, pattern: 'vertical', col };
  }
  
  // 3. Check Diagonals (አግዳሚ) - Both main diagonals
  let diagonal1 = true; // Top-left to bottom-right
  let diagonal2 = true; // Top-right to bottom-left
  
  for (let i = 0; i < 5; i++) {
    if (!isCellValid(i, i)) {
      diagonal1 = false;
    }
    if (!isCellValid(i, 4 - i)) {
      diagonal2 = false;
    }
  }
  
  if (diagonal1) return { valid: true, pattern: 'diagonal', type: 'main' };
  if (diagonal2) return { valid: true, pattern: 'diagonal', type: 'anti' };
  
  // 4. Check Four Corners (አራቱን ማእዘናት)
  const corners = [
    [0, 0],     // Top-left
    [4, 0],     // Top-right
    [0, 4],     // Bottom-left
    [4, 4]      // Bottom-right
  ];
  
  let fourCornersComplete = true;
  for (const [col, row] of corners) {
    if (!isCellValid(col, row)) {
      fourCornersComplete = false;
      break;
    }
  }
  
  if (fourCornersComplete) return { valid: true, pattern: 'four_corners' };
  
  // No valid pattern found
  return { valid: false };
}

module.exports = { generateBingoCard, validateBingo };
