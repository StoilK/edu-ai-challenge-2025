import readline from 'readline';
import Game from './Game.js';

/**
 * Main entry point for the Sea Battle game
 */
class SeaBattleApp {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    this.game = new Game();
  }

  /**
   * Start the game
   */
  start() {
    this.gameLoop();
  }

  /**
   * Main game loop
   */
  gameLoop() {
    // Check for game over conditions
    if (this.game.isGameOver()) {
      this.endGame();
      return;
    }

    // Display the current board state
    this.game.printBoards();

    // Get player's input
    this.rl.question('Enter your guess (e.g., 00): ', (answer) => {
      this.handlePlayerInput(answer);
    });
  }

  /**
   * Handle player input and process the turn
   * @param {string} input - Player's input
   */
  handlePlayerInput(input) {
    const result = this.game.processPlayerGuess(input);

    if (!result.valid) {
      console.log(result.message);
      // Invalid input, ask again
      this.gameLoop();
      return;
    }

    // Valid input, show result
    console.log(result.message);

    // Check if player won after their guess
    if (result.gameOver && result.winner === 'player') {
      this.gameLoop(); // This will trigger endGame()
      return;
    }

    // CPU's turn
    const cpuResult = this.game.processCPUTurn();

    // Check if CPU won after their turn
    if (cpuResult.gameOver && cpuResult.winner === 'cpu') {
      this.gameLoop(); // This will trigger endGame()
      return;
    }

    // Continue the game
    this.gameLoop();
  }

  /**
   * End the game and show final results
   */
  endGame() {
    const winner = this.game.getWinner();
    const status = this.game.getGameStatus();

    console.log('\n' + '='.repeat(50));
    
    if (winner === 'player') {
      console.log('🎉*** CONGRATULATIONS! You sunk all enemy battleships! ***🎉');
    } else if (winner === 'cpu') {
      console.log('💀*** GAME OVER! The CPU sunk all your battleships! ***💀');
    }
    
    console.log('='.repeat(50));
    
    // Show final board state
    this.game.printBoards();
    
    // Show final statistics
    console.log('Final Statistics:');
    console.log(`Player ships remaining: ${status.playerShipsRemaining}`);
    console.log(`CPU ships remaining: ${status.cpuShipsRemaining}`);
    
    console.log('\nThanks for playing Sea Battle!');
    
    this.rl.close();
  }

  /**
   * Handle readline interface closure
   */
  close() {
    this.rl.close();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nGame interrupted. Thanks for playing!');
  process.exit(0);
});

// Start the game
const app = new SeaBattleApp();
app.start(); 