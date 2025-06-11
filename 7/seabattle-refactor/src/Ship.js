/**
 * Ship class to manage ship positions and hit status
 */
export default class Ship {
  constructor(locations) {
    this.locations = locations;
    this.hits = new Array(locations.length).fill('');
  }

  /**
   * Hit a ship at the specified position
   * @param {string} position - Position in format "xy" (e.g., "34")
   */
  hit(position) {
    const index = this.locations.indexOf(position);
    if (index >= 0) {
      this.hits[index] = 'hit';
    }
  }

  /**
   * Check if the ship is completely sunk
   * @returns {boolean} True if all positions are hit
   */
  isSunk() {
    return this.hits.every(h => h === 'hit');
  }

  /**
   * Check if a specific position on this ship has been hit
   * @param {string} position - Position to check
   * @returns {boolean} True if position has been hit
   */
  isHit(position) {
    const index = this.locations.indexOf(position);
    return index >= 0 && this.hits[index] === 'hit';
  }

  /**
   * Check if this ship occupies the given position
   * @param {string} position - Position to check
   * @returns {boolean} True if ship is at this position
   */
  occupies(position) {
    return this.locations.includes(position);
  }
} 