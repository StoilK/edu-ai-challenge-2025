import Board from './Board.js';
import CPU from './CPU.js';

/**
 * Game class to manage the main game flow and logic
 */
export default class Game {
  constructor(boardSize = 10, numShips = 3, shipLength = 3) {
    this.boardSize = boardSize;
    this.numShips = numShips;
    this.shipLength = shipLength;
    
    this.playerBoard = new Board(boardSize);
    this.cpuBoard = new Board(boardSize);
    this.cpu = new CPU(boardSize);
    
    this.gameOver = false;
    this.winner = null;
    
    this.setupGame();
  }

  /**
   * Initialize the game by placing ships on both boards
   */
  setupGame() {
    console.log('⚓ Setting up Sea Battle... ⚓');
    
    // Place ships on player board (show ships)
    this.playerBoard.placeShipsRandomly(this.numShips, this.shipLength, true);
    console.log(`🚢 ${this.numShips} ships (${this.shipLength} cells each) placed on your board.`);
    
    // Place ships on CPU board (hidden)
    this.cpuBoard.placeShipsRandomly(this.numShips, this.shipLength, false);
    console.log(`🎯 ${this.numShips} ships (${this.shipLength} cells each) placed on opponent's board.`);
    
    console.log("\n🌊 Let's play Sea Battle! 🌊");
    console.log(`🎯 Try to sink the ${this.numShips} enemy ships. 🎯`);
  }

  /**
   * Process a player's guess
   * @param {string} guess - Player's guess (e.g., "34")
   * @returns {object} Result object with validation and game status
   */
  processPlayerGuess(guess) {
    // Validate input
    const validation = this.validatePlayerInput(guess);
    if (!validation.valid) {
      return validation;
    }

    // Process the guess on CPU's board
    const result = this.cpuBoard.processGuess(guess);
    
    if (result.alreadyGuessed) {
      return { 
        valid: false, 
        message: 'You already guessed that location!' 
      };
    }

    let message;
          if (result.hit) {
      message = '🔥 PLAYER HIT! 🔥 Keep firing at the same ship to sink it!';
      if (result.sunk) {
        message += '\n💥 BOOM! You sunk an enemy battleship! All 3 cells were hit! 💥';
      }
    } else {
      message = '💨 PLAYER MISS 💨';
    }

    // Check for player victory
    const cpuShipsRemaining = this.cpuBoard.getShipsRemaining();
    if (cpuShipsRemaining === 0) {
      this.gameOver = true;
      this.winner = 'player';
    }

    return {
      valid: true,
      hit: result.hit,
      sunk: result.sunk,
      message,
      gameOver: this.gameOver,
      winner: this.winner
    };
  }

  /**
   * Execute CPU's turn
   * @returns {object} Result of CPU's turn
   */
  processCPUTurn() {
    console.log("\n🤖 --- CPU's Turn --- 🤖");
    
    const guess = this.cpu.makeGuess(this.playerBoard);
    const result = this.playerBoard.processGuess(guess);
    
    // Let CPU process the result for AI strategy
    this.cpu.processGuessResult(guess, result);
    
    let message;
    if (result.hit) {
      message = `🔥 CPU HIT at ${guess}! 🔥`;
      if (result.sunk) {
        message += ' 💥 CPU sunk your battleship! 💥';
      }
    } else {
      message = `💨 CPU MISS at ${guess} 💨`;
    }
    
    console.log(message);

    // Check for CPU victory
    const playerShipsRemaining = this.playerBoard.getShipsRemaining();
    if (playerShipsRemaining === 0) {
      this.gameOver = true;
      this.winner = 'cpu';
    }

    return {
      guess,
      hit: result.hit,
      sunk: result.sunk,
      message,
      gameOver: this.gameOver,
      winner: this.winner
    };
  }

  /**
   * Validate player input
   * @param {string} guess - Player's input
   * @returns {object} Validation result
   */
  validatePlayerInput(guess) {
    if (guess === null || guess.length !== 2) {
      return { 
        valid: false, 
        message: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).' 
      };
    }

    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    if (isNaN(row) || isNaN(col) || 
        row < 0 || row >= this.boardSize || 
        col < 0 || col >= this.boardSize) {
      return { 
        valid: false, 
        message: `Oops, please enter valid row and column numbers between 0 and ${this.boardSize - 1}.` 
      };
    }

    return { valid: true };
  }

  /**
   * Print both boards side by side
   */
  printBoards() {
    console.log('\n         🎯 OPPONENT BOARD 🎯                    🚢 YOUR BOARD 🚢');
    console.log('\n              Legend: 🌊=Water 🔥=Hit (1 cell) 💨=Miss 🚢=Ship (3 cells)');
    console.log('              Hint: You must hit all 3 cells of a ship to sink it!\n');
    
    // Print column numbers header with proper spacing for emojis
    let leftHeader = '   '; // Start with 3 spaces to align with row numbers
    for (let h = 0; h < this.boardSize; h++) {
      leftHeader += ' ' + h + ' '; // Each column number followed by space
    }
    
    let rightHeader = '   '; // Start with 3 spaces to align with row numbers  
    for (let h = 0; h < this.boardSize; h++) {
      rightHeader += ' ' + h + ' '; // Each column number followed by space
    }
    
    console.log(leftHeader + '      ' + rightHeader);

    // Print rows
    const cpuGrid = this.cpuBoard.getGrid();
    const playerGrid = this.playerBoard.getGrid();
    
    for (let i = 0; i < this.boardSize; i++) {
      let rowStr = i + '  '; // Row number with 2 spaces

      // CPU board (opponent's board - hide ships)
      for (let j = 0; j < this.boardSize; j++) {
        rowStr += cpuGrid[i][j] + ' ';
      }
      
      rowStr += '      ' + i + '  '; // Separator and row number for player board

      // Player board (show ships)
      for (let j = 0; j < this.boardSize; j++) {
        rowStr += playerGrid[i][j] + ' ';
      }
      
      console.log(rowStr);
    }
    console.log('');
  }

  /**
   * Check if the game is over
   * @returns {boolean} True if game is over
   */
  isGameOver() {
    return this.gameOver;
  }

  /**
   * Get the winner of the game
   * @returns {string} 'player', 'cpu', or null
   */
  getWinner() {
    return this.winner;
  }

  /**
   * Get game status information
   * @returns {object} Current game status
   */
  getGameStatus() {
    return {
      playerShipsRemaining: this.playerBoard.getShipsRemaining(),
      cpuShipsRemaining: this.cpuBoard.getShipsRemaining(),
      gameOver: this.gameOver,
      winner: this.winner,
      cpuMode: this.cpu.getMode()
    };
  }
} 