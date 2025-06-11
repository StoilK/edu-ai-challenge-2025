import Game from '../src/Game.js';

// Mock console.log to avoid cluttering test output
const mockConsoleLog = () => {};
const originalLog = console.log;
beforeAll(() => {
  console.log = mockConsoleLog;
});

afterAll(() => {
  console.log = originalLog;
});

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game(5, 2, 2); // Smaller game for testing
  });

  describe('constructor', () => {
    test('should initialize game with correct parameters', () => {
      expect(game.boardSize).toBe(5);
      expect(game.numShips).toBe(2);
      expect(game.shipLength).toBe(2);
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBe(null);
    });

    test('should create player and CPU boards', () => {
      expect(game.playerBoard).toBeDefined();
      expect(game.cpuBoard).toBeDefined();
      expect(game.cpu).toBeDefined();
    });

    test('should use default parameters when none provided', () => {
      const defaultGame = new Game();
      expect(defaultGame.boardSize).toBe(10);
      expect(defaultGame.numShips).toBe(3);
      expect(defaultGame.shipLength).toBe(3);
    });
  });

  describe('validatePlayerInput', () => {
    test('should reject null input', () => {
      const result = game.validatePlayerInput(null);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exactly two digits');
    });

    test('should reject input with wrong length', () => {
      const result = game.validatePlayerInput('1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exactly two digits');
    });

    test('should reject input with non-numeric characters', () => {
      const result = game.validatePlayerInput('ab');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('valid row and column numbers');
    });

    test('should reject out-of-bounds coordinates', () => {
      const result = game.validatePlayerInput('99');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('valid row and column numbers');
    });

    test('should accept valid input', () => {
      const result = game.validatePlayerInput('23');
      expect(result.valid).toBe(true);
    });
  });

  describe('processPlayerGuess', () => {
    test('should return invalid result for bad input', () => {
      const result = game.processPlayerGuess('invalid');
      expect(result.valid).toBe(false);
    });

    test('should process valid guess', () => {
      const result = game.processPlayerGuess('22');
      expect(result.valid).toBe(true);
      expect(result.message).toBeDefined();
    });

    test('should detect player victory', () => {
      // Mock CPU board to have no ships remaining
      game.cpuBoard.getShipsRemaining = () => 0;
      
      const result = game.processPlayerGuess('22');
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('player');
    });
  });

  describe('processCPUTurn', () => {
    test('should make a CPU guess and return result', () => {
      const result = game.processCPUTurn();
      expect(result.guess).toBeDefined();
      expect(result.guess).toHaveLength(2);
      expect(result.message).toBeDefined();
    });

    test('should detect CPU victory', () => {
      // Mock player board to have no ships remaining
      game.playerBoard.getShipsRemaining = () => 0;
      
      const result = game.processCPUTurn();
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('cpu');
    });
  });

  describe('game state methods', () => {
    test('isGameOver should return correct state', () => {
      expect(game.isGameOver()).toBe(false);
      game.gameOver = true;
      expect(game.isGameOver()).toBe(true);
    });

    test('getWinner should return current winner', () => {
      expect(game.getWinner()).toBe(null);
      game.winner = 'player';
      expect(game.getWinner()).toBe('player');
    });

    test('getGameStatus should return complete status', () => {
      const status = game.getGameStatus();
      expect(status).toHaveProperty('playerShipsRemaining');
      expect(status).toHaveProperty('cpuShipsRemaining');
      expect(status).toHaveProperty('gameOver');
      expect(status).toHaveProperty('winner');
      expect(status).toHaveProperty('cpuMode');
    });
  });

  describe('printBoards', () => {
    test('should not throw when printing boards', () => {
      expect(() => {
        game.printBoards();
      }).not.toThrow();
    });
  });

  describe('game flow integration', () => {
    test('should handle complete player turn sequence', () => {
      const guess = '22';
      const playerResult = game.processPlayerGuess(guess);
      
      expect(playerResult.valid).toBe(true);
      
      if (!playerResult.gameOver) {
        const cpuResult = game.processCPUTurn();
        expect(cpuResult.guess).toBeDefined();
      }
    });

    test('should maintain game state consistency', () => {
      const initialStatus = game.getGameStatus();
      
      // Make some moves
      game.processPlayerGuess('00');
      if (!game.isGameOver()) {
        game.processCPUTurn();
      }
      
      const afterStatus = game.getGameStatus();
      
      // Ships remaining should be same or less
      expect(afterStatus.playerShipsRemaining).toBeLessThanOrEqual(initialStatus.playerShipsRemaining);
      expect(afterStatus.cpuShipsRemaining).toBeLessThanOrEqual(initialStatus.cpuShipsRemaining);
    });
  });

  describe('edge cases', () => {
    test('should handle repeated valid guesses gracefully', () => {
      const result1 = game.processPlayerGuess('00');
      const result2 = game.processPlayerGuess('00');
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('already guessed');
    });

    test('should handle game ending scenarios', () => {
      // Force game to end
      game.gameOver = true;
      game.winner = 'player';
      
      expect(game.isGameOver()).toBe(true);
      expect(game.getWinner()).toBe('player');
    });
  });
}); 