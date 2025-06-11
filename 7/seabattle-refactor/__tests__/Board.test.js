import Board from '../src/Board.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board(5); // Smaller board for testing
  });

  describe('constructor', () => {
    test('should create a board with correct size', () => {
      expect(board.size).toBe(5);
      expect(board.grid).toHaveLength(5);
      expect(board.grid[0]).toHaveLength(5);
    });

    test('should initialize grid with water (🌊)', () => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          expect(board.grid[i][j]).toBe('🌊');
        }
      }
    });

    test('should initialize empty ships and guesses arrays', () => {
      expect(board.ships).toHaveLength(0);
      expect(board.guesses).toHaveLength(0);
    });
  });

  describe('createBoard', () => {
    test('should create board with default size 10', () => {
      const defaultBoard = new Board();
      expect(defaultBoard.size).toBe(10);
      expect(defaultBoard.grid).toHaveLength(10);
    });
  });

  describe('placeShipsRandomly', () => {
    test('should place correct number of ships', () => {
      board.placeShipsRandomly(2, 3, false);
      expect(board.ships).toHaveLength(2);
    });

    test('should create ships with correct length', () => {
      board.placeShipsRandomly(1, 3, false);
      expect(board.ships[0].locations).toHaveLength(3);
    });

    test('should show ships on grid when showShips is true', () => {
      board.placeShipsRandomly(1, 2, true);
      
      // Count number of '🚢' cells
      let shipCells = 0;
      for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
          if (board.grid[i][j] === '🚢') {
            shipCells++;
          }
        }
      }
      expect(shipCells).toBe(2);
    });

    test('should not show ships on grid when showShips is false', () => {
      board.placeShipsRandomly(1, 2, false);
      
      // Count number of '🚢' cells (should be 0)
      let shipCells = 0;
      for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
          if (board.grid[i][j] === '🚢') {
            shipCells++;
          }
        }
      }
      expect(shipCells).toBe(0);
    });
  });

  describe('processGuess', () => {
    beforeEach(() => {
      // Manually place a ship for predictable testing
      board.ships = [];
      board.ships.push({
        locations: ['00', '01'],
        hits: ['', ''],
        hit: function(pos) {
          const index = this.locations.indexOf(pos);
          if (index >= 0) this.hits[index] = 'hit';
        },
        occupies: function(pos) {
          return this.locations.includes(pos);
        },
        isHit: function(pos) {
          const index = this.locations.indexOf(pos);
          return index >= 0 && this.hits[index] === 'hit';
        },
        isSunk: function() {
          return this.hits.every(h => h === 'hit');
        }
      });
    });

    test('should return alreadyGuessed for repeated guess', () => {
      board.processGuess('00');
      const result = board.processGuess('00');
      expect(result.alreadyGuessed).toBe(true);
    });

    test('should return hit:true for hitting a ship', () => {
      const result = board.processGuess('00');
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(board.grid[0][0]).toBe('🔥');
    });

    test('should return hit:false for missing', () => {
      const result = board.processGuess('22');
      expect(result.hit).toBe(false);
      expect(board.grid[2][2]).toBe('💨');
    });

    test('should return sunk:true when ship is completely hit', () => {
      board.processGuess('00');
      const result = board.processGuess('01');
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
    });

    test('should add guess to guesses array', () => {
      board.processGuess('33');
      expect(board.guesses).toContain('33');
    });
  });

  describe('getShipsRemaining', () => {
    beforeEach(() => {
      // Add mock ships
      board.ships = [
        { isSunk: () => false },
        { isSunk: () => true },
        { isSunk: () => false }
      ];
    });

    test('should return correct number of unsunk ships', () => {
      expect(board.getShipsRemaining()).toBe(2);
    });
  });

  describe('isValidAndNewGuess', () => {
    beforeEach(() => {
      board.guesses = ['00', '11'];
    });

    test('should return false for out-of-bounds coordinates', () => {
      expect(board.isValidAndNewGuess(-1, 0)).toBe(false);
      expect(board.isValidAndNewGuess(0, -1)).toBe(false);
      expect(board.isValidAndNewGuess(5, 0)).toBe(false);
      expect(board.isValidAndNewGuess(0, 5)).toBe(false);
    });

    test('should return false for already guessed positions', () => {
      expect(board.isValidAndNewGuess(0, 0)).toBe(false);
      expect(board.isValidAndNewGuess(1, 1)).toBe(false);
    });

    test('should return true for valid new positions', () => {
      expect(board.isValidAndNewGuess(2, 2)).toBe(true);
      expect(board.isValidAndNewGuess(4, 4)).toBe(true);
    });
  });

  describe('getGrid', () => {
    test('should return the current grid state', () => {
      const grid = board.getGrid();
      expect(grid).toBe(board.grid);
      expect(grid).toHaveLength(5);
    });
  });
}); 