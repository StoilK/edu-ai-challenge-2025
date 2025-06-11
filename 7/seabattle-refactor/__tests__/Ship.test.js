import Ship from '../src/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(['00', '01', '02']);
  });

  describe('constructor', () => {
    test('should create a ship with correct locations', () => {
      expect(ship.locations).toEqual(['00', '01', '02']);
    });

    test('should initialize hits array with empty strings', () => {
      expect(ship.hits).toEqual(['', '', '']);
    });
  });

  describe('hit', () => {
    test('should mark a valid position as hit', () => {
      ship.hit('01');
      expect(ship.hits[1]).toBe('hit');
    });

    test('should not affect hits for invalid position', () => {
      ship.hit('99');
      expect(ship.hits).toEqual(['', '', '']);
    });

    test('should handle multiple hits on same position', () => {
      ship.hit('01');
      ship.hit('01');
      expect(ship.hits[1]).toBe('hit');
    });
  });

  describe('isSunk', () => {
    test('should return false when ship is not sunk', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when ship is partially hit', () => {
      ship.hit('00');
      ship.hit('01');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all positions are hit', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('isHit', () => {
    test('should return false for unhit position on ship', () => {
      expect(ship.isHit('00')).toBe(false);
    });

    test('should return true for hit position on ship', () => {
      ship.hit('00');
      expect(ship.isHit('00')).toBe(true);
    });

    test('should return false for position not on ship', () => {
      expect(ship.isHit('99')).toBe(false);
    });
  });

  describe('occupies', () => {
    test('should return true for positions on ship', () => {
      expect(ship.occupies('00')).toBe(true);
      expect(ship.occupies('01')).toBe(true);
      expect(ship.occupies('02')).toBe(true);
    });

    test('should return false for positions not on ship', () => {
      expect(ship.occupies('03')).toBe(false);
      expect(ship.occupies('99')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle single-position ship', () => {
      const singleShip = new Ship(['55']);
      expect(singleShip.isSunk()).toBe(false);
      singleShip.hit('55');
      expect(singleShip.isSunk()).toBe(true);
    });

    test('should handle longer ship', () => {
      const longShip = new Ship(['00', '01', '02', '03', '04']);
      expect(longShip.locations).toHaveLength(5);
      expect(longShip.hits).toHaveLength(5);
      expect(longShip.isSunk()).toBe(false);
    });
  });
}); 