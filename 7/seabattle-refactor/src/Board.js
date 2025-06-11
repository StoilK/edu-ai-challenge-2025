import Ship from './Ship.js';

/**
 * Board class to manage the game board and ship placement
 */
export default class Board {
  constructor(size = 10) {
    this.size = size;
    this.grid = [];
    this.ships = [];
    this.guesses = [];
    this.createBoard();
  }

  /**
   * Create an empty board grid
   */
  createBoard() {
    for (let i = 0; i < this.size; i++) {
      this.grid[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.grid[i][j] = '🌊'; // Water emoji instead of ~
      }
    }
  }

  /**
   * Place ships randomly on the board
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   * @param {boolean} showShips - Whether to show ships on grid (for player board)
   */
  placeShipsRandomly(numberOfShips, shipLength, showShips = false) {
    let placedShips = 0;
    
    while (placedShips < numberOfShips) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      let startRow, startCol;
      
      if (orientation === 'horizontal') {
        startRow = Math.floor(Math.random() * this.size);
        startCol = Math.floor(Math.random() * (this.size - shipLength + 1));
      } else {
        startRow = Math.floor(Math.random() * (this.size - shipLength + 1));
        startCol = Math.floor(Math.random() * this.size);
      }

      const shipLocations = [];
      let collision = false;

      // Check if placement is valid
      for (let i = 0; i < shipLength; i++) {
        const checkRow = orientation === 'horizontal' ? startRow : startRow + i;
        const checkCol = orientation === 'horizontal' ? startCol + i : startCol;
        const locationStr = String(checkRow) + String(checkCol);
        
        if (checkRow >= this.size || checkCol >= this.size) {
          collision = true;
          break;
        }

        if (this.grid[checkRow][checkCol] !== '🌊') {
          collision = true;
          break;
        }
        
        shipLocations.push(locationStr);
      }

      if (!collision) {
        // Place the ship
        const ship = new Ship(shipLocations);
        this.ships.push(ship);

        if (showShips) {
          shipLocations.forEach(location => {
            const row = parseInt(location[0]);
            const col = parseInt(location[1]);
            this.grid[row][col] = '🚢'; // Ship emoji instead of S
          });
        }
        
        placedShips++;
      }
    }
  }

  /**
   * Process a guess on this board
   * @param {string} guess - Position guess (e.g., "34")
   * @returns {object} Result object with hit status and ship sunk info
   */
  processGuess(guess) {
    if (this.guesses.includes(guess)) {
      return { alreadyGuessed: true };
    }

    this.guesses.push(guess);
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    // Check for hit
    for (const ship of this.ships) {
      if (ship.occupies(guess)) {
        if (ship.isHit(guess)) {
          return { alreadyHit: true };
        }
        
        ship.hit(guess);
        this.grid[row][col] = '🔥'; // Fire emoji for hits instead of X
        
        return {
          hit: true,
          sunk: ship.isSunk()
        };
      }
    }

    // Miss
    this.grid[row][col] = '💨'; // Splash emoji for misses instead of O
    return { hit: false };
  }

  /**
   * Get number of ships remaining (not sunk)
   * @returns {number} Number of ships not sunk
   */
  getShipsRemaining() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Check if a position is valid and not already guessed
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} True if valid and new guess
   */
  isValidAndNewGuess(row, col) {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return false;
    }
    const guessStr = String(row) + String(col);
    return !this.guesses.includes(guessStr);
  }

  /**
   * Get the grid for display
   * @returns {Array<Array<string>>} The current grid state
   */
  getGrid() {
    return this.grid;
  }
} 