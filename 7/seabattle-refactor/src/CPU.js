/**
 * CPU class to handle computer player AI behavior
 */
export default class CPU {
  constructor(boardSize = 10) {
    this.boardSize = boardSize;
    this.mode = 'hunt';
    this.targetQueue = [];
    this.guesses = [];
  }

  /**
   * Make a guess on the opponent's board
   * @param {Board} opponentBoard - The opponent's board
   * @returns {string} The guess position (e.g., "34")
   */
  makeGuess(opponentBoard) {
    let guessRow, guessCol, guessStr;
    let madeValidGuess = false;

    while (!madeValidGuess) {
      if (this.mode === 'target' && this.targetQueue.length > 0) {
        // Target mode: attack adjacent cells to a previous hit
        guessStr = this.targetQueue.shift();
        guessRow = parseInt(guessStr[0]);
        guessCol = parseInt(guessStr[1]);

        if (this.guesses.includes(guessStr)) {
          if (this.targetQueue.length === 0) {
            this.mode = 'hunt';
          }
          continue;
        }
      } else {
        // Hunt mode: random guessing
        this.mode = 'hunt';
        guessRow = Math.floor(Math.random() * this.boardSize);
        guessCol = Math.floor(Math.random() * this.boardSize);
        guessStr = String(guessRow) + String(guessCol);

        if (!opponentBoard.isValidAndNewGuess(guessRow, guessCol)) {
          continue;
        }
      }

      madeValidGuess = true;
    }

    this.guesses.push(guessStr);
    return guessStr;
  }

  /**
   * Process the result of a guess and update AI strategy
   * @param {string} guess - The guess that was made
   * @param {object} result - Result of the guess from board.processGuess()
   */
  processGuessResult(guess, result) {
    const guessRow = parseInt(guess[0]);
    const guessCol = parseInt(guess[1]);

    if (result.hit) {
      if (result.sunk) {
        // Ship was sunk, return to hunt mode
        this.mode = 'hunt';
        this.targetQueue = [];
      } else {
        // Hit but not sunk, switch to target mode and add adjacent cells
        this.mode = 'target';
        this.addAdjacentTargets(guessRow, guessCol);
      }
    } else {
      // Miss - if we were in target mode and queue is empty, return to hunt
      if (this.mode === 'target' && this.targetQueue.length === 0) {
        this.mode = 'hunt';
      }
    }
  }

  /**
   * Add adjacent cells to the target queue
   * @param {number} row - Row of the hit
   * @param {number} col - Column of the hit
   */
  addAdjacentTargets(row, col) {
    const adjacent = [
      { r: row - 1, c: col },  // Up
      { r: row + 1, c: col },  // Down
      { r: row, c: col - 1 },  // Left
      { r: row, c: col + 1 }   // Right
    ];

    for (const adj of adjacent) {
      if (this.isValidNewTarget(adj.r, adj.c)) {
        const adjStr = String(adj.r) + String(adj.c);
        if (!this.targetQueue.includes(adjStr)) {
          this.targetQueue.push(adjStr);
        }
      }
    }
  }

  /**
   * Check if a position is valid for targeting
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} True if valid target
   */
  isValidNewTarget(row, col) {
    if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
      return false;
    }
    const targetStr = String(row) + String(col);
    return !this.guesses.includes(targetStr);
  }

  /**
   * Get current AI mode
   * @returns {string} Current mode ('hunt' or 'target')
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get number of remaining targets in queue
   * @returns {number} Number of targets in queue
   */
  getTargetQueueLength() {
    return this.targetQueue.length;
  }
} 