/*
 * Enigma Machine Test Suite
 * 
 * This test suite verifies the correct operation of the Enigma machine implementation
 * after fixing a critical bug where the plugboard was only applied once instead of twice.
 * 
 * Tests cover:
 * - Basic encryption/decryption
 * - Plugboard functionality
 * - Different rotor configurations
 * - Ring settings
 * - Rotor stepping behavior
 * - Special characters and case handling
 * - Performance testing
 */

const { Enigma, Rotor, plugboardSwap } = require('./enigma.js');

console.log('=== Enigma Machine Comprehensive Tests ===\n');

// Test utilities
function assertEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(`✓ ${testName}: PASSED`);
    return true;
  } else {
    console.log(`✗ ${testName}: FAILED`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual: ${actual}`);
    return false;
  }
}

function testEncryptDecrypt(settings, plaintext, testName) {
  const { rotorIDs, positions, ringSettings, plugboard } = settings;
  
  // Encrypt
  const enigma1 = new Enigma(rotorIDs, positions, ringSettings, plugboard);
  const encrypted = enigma1.process(plaintext);
  
  // Decrypt with same settings
  const enigma2 = new Enigma(rotorIDs, positions, ringSettings, plugboard);
  const decrypted = enigma2.process(encrypted);
  
  return assertEqual(decrypted, plaintext, testName);
}

let passedTests = 0;
let totalTests = 0;

// Test 1: Basic encryption/decryption without plugboard
totalTests++;
if (testEncryptDecrypt({
  rotorIDs: [0, 1, 2],
  positions: [0, 0, 0],
  ringSettings: [0, 0, 0],
  plugboard: []
}, "HELLO", "Basic encryption/decryption")) {
  passedTests++;
}

// Test 2: Plugboard functionality
totalTests++;
if (testEncryptDecrypt({
  rotorIDs: [0, 1, 2],
  positions: [0, 0, 0],
  ringSettings: [0, 0, 0],
  plugboard: [['A', 'B'], ['C', 'D']]
}, "ABCD", "Plugboard functionality")) {
  passedTests++;
}

// Test 3: Different rotor positions
totalTests++;
if (testEncryptDecrypt({
  rotorIDs: [0, 1, 2],
  positions: [5, 10, 15],
  ringSettings: [0, 0, 0],
  plugboard: []
}, "TESTING", "Different rotor positions")) {
  passedTests++;
}

// Test 4: Ring settings
totalTests++;
if (testEncryptDecrypt({
  rotorIDs: [0, 1, 2],
  positions: [0, 0, 0],
  ringSettings: [1, 2, 3],
  plugboard: []
}, "RINGSETTING", "Ring settings")) {
  passedTests++;
}

// Test 5: Complex configuration
totalTests++;
if (testEncryptDecrypt({
  rotorIDs: [2, 0, 1],
  positions: [8, 12, 20],
  ringSettings: [2, 5, 7],
  plugboard: [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']]
}, "COMPLEXCONFIGURATION", "Complex configuration")) {
  passedTests++;
}

// Test 6: Single character encryption with plugboard
console.log('\n--- Plugboard Unit Tests ---');
totalTests++;
const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
const originalPos = enigma.rotors.map(r => r.position);
const encryptedA = enigma.encryptChar('A');
// Reset for decryption
enigma.rotors.forEach((rotor, i) => rotor.position = originalPos[i]);
const decryptedA = enigma.encryptChar(encryptedA);
if (assertEqual(decryptedA, 'A', "Single character with plugboard")) {
  passedTests++;
}

// Test 7: Plugboard swap function
totalTests++;
if (assertEqual(plugboardSwap('A', [['A', 'B']]), 'B', "Plugboard swap A→B")) {
  passedTests++;
}

totalTests++;
if (assertEqual(plugboardSwap('B', [['A', 'B']]), 'A', "Plugboard swap B→A")) {
  passedTests++;
}

totalTests++;
if (assertEqual(plugboardSwap('C', [['A', 'B']]), 'C', "Plugboard no swap")) {
  passedTests++;
}

// Test 8: Rotor stepping
console.log('\n--- Rotor Stepping Tests ---');
const enigmaStep = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
totalTests++;
const initialPositions = enigmaStep.rotors.map(r => r.position);
enigmaStep.encryptChar('A');
const afterOneStep = enigmaStep.rotors.map(r => r.position);
if (assertEqual(`${afterOneStep[2]}`, '1', "Right rotor steps")) {
  passedTests++;
}

// Test 9: Longer text encryption
totalTests++;
if (testEncryptDecrypt({
  rotorIDs: [0, 1, 2],
  positions: [0, 0, 0],
  ringSettings: [0, 0, 0],
  plugboard: [['S', 'T'], ['E', 'R']]
}, "THISISALONGERTEXTTOENCRYPTANDDECRYPTCORRECTLY", "Long text encryption")) {
  passedTests++;
}

// Test 10: Numbers and special characters (should pass through unchanged)
totalTests++;
const enigmaSpecial = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
const specialText = "HELLO123WORLD!@#";
const encryptedSpecial = enigmaSpecial.process(specialText);
const enigmaSpecial2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
const decryptedSpecial = enigmaSpecial2.process(encryptedSpecial);
if (assertEqual(decryptedSpecial, specialText, "Special characters pass through")) {
  passedTests++;
}

// Test 11: Case insensitive (should convert to uppercase)
totalTests++;
const enigmaCase = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
const lowerText = "hello";
const encryptedCase = enigmaCase.process(lowerText);
const enigmaCase2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
const decryptedCase = enigmaCase2.process(encryptedCase);
if (assertEqual(decryptedCase, "HELLO", "Lowercase input converted to uppercase")) {
  passedTests++;
}

// Summary
console.log(`\n=== Test Summary ===`);
console.log(`Passed: ${passedTests}/${totalTests} tests`);
if (passedTests === totalTests) {
  console.log('🎉 All tests passed! The Enigma machine is working correctly.');
} else {
  console.log(`❌ ${totalTests - passedTests} test(s) failed.`);
}

// Performance test
console.log('\n=== Performance Test ===');
const longText = 'THISISAVERYLONGTEXTTOTESTTHEPERFORMANCEOFTHEENIGMAMACHINE'.repeat(10);
const start = Date.now();
const enigmaPerf = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
const encryptedPerf = enigmaPerf.process(longText);
const encrypted_time = Date.now() - start;

const start2 = Date.now();
const enigmaPerf2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
const decryptedPerf = enigmaPerf2.process(encryptedPerf);
const decrypted_time = Date.now() - start2;

console.log(`Encrypted ${longText.length} characters in ${encrypted_time}ms`);
console.log(`Decrypted ${encryptedPerf.length} characters in ${decrypted_time}ms`);
console.log(`Performance test: ${decryptedPerf === longText ? 'PASSED' : 'FAILED'}`); 