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
  const marked = JSON.parse(markedCells || '[]');
  
  // Check rows
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      const cell = gridData[col][row];
      if (cell !== 'FREE' && !calledSet.has(cell)) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return true;
  }
  
  // Check columns
  for (let col = 0; col < 5; col++) {
    let colComplete = true;
    for (let row = 0; row < 5; row++) {
      const cell = gridData[col][row];
      if (cell !== 'FREE' && !calledSet.has(cell)) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return true;
  }
  
  // Check diagonals
  let diagonal1 = true;
  let diagonal2 = true;
  
  for (let i = 0; i < 5; i++) {
    const cell1 = gridData[i][i];
    const cell2 = gridData[i][4 - i];
    
    if (cell1 !== 'FREE' && !calledSet.has(cell1)) {
      diagonal1 = false;
    }
    if (cell2 !== 'FREE' && !calledSet.has(cell2)) {
      diagonal2 = false;
    }
  }
  
  return diagonal1 || diagonal2;
}

module.exports = { generateBingoCard, validateBingo };
