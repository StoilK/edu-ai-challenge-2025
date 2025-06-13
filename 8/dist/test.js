"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("./validation");
// Test utility functions
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function test(name, testFn) {
    try {
        testFn();
        console.log(`✅ ${name}`);
    }
    catch (error) {
        console.error(`❌ ${name}: ${error.message}`);
    }
}
// Test cases
console.log('🧪 Running Validation Library Tests...\n');
// String validator tests
test('String validator - valid string', () => {
    const validator = validation_1.Schema.string();
    const result = validator.validate('hello');
    assert(result.success, 'Should accept valid string');
    assert(result.data === 'hello', 'Should return the string value');
});
test('String validator - invalid type', () => {
    const validator = validation_1.Schema.string();
    const result = validator.validate(123);
    assert(!result.success, 'Should reject non-string');
    assert(result.errors.length > 0, 'Should have errors');
});
test('String validator - min length', () => {
    const validator = validation_1.Schema.string().minLength(5);
    const result = validator.validate('hi');
    assert(!result.success, 'Should reject string shorter than minimum');
});
test('String validator - pattern validation', () => {
    const emailValidator = validation_1.Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    const valid = emailValidator.validate('test@example.com');
    const invalid = emailValidator.validate('invalid-email');
    assert(valid.success, 'Should accept valid email');
    assert(!invalid.success, 'Should reject invalid email');
});
// Number validator tests
test('Number validator - valid number', () => {
    const validator = validation_1.Schema.number();
    const result = validator.validate(42);
    assert(result.success, 'Should accept valid number');
    assert(result.data === 42, 'Should return the number value');
});
test('Number validator - range validation', () => {
    const validator = validation_1.Schema.number().min(0).max(100);
    const valid = validator.validate(50);
    const tooLow = validator.validate(-1);
    const tooHigh = validator.validate(101);
    assert(valid.success, 'Should accept number in range');
    assert(!tooLow.success, 'Should reject number below minimum');
    assert(!tooHigh.success, 'Should reject number above maximum');
});
test('Number validator - integer validation', () => {
    const validator = validation_1.Schema.number().integer();
    const validInt = validator.validate(42);
    const invalidFloat = validator.validate(3.14);
    assert(validInt.success, 'Should accept integer');
    assert(!invalidFloat.success, 'Should reject float when integer required');
});
// Boolean validator tests
test('Boolean validator - valid boolean', () => {
    const validator = validation_1.Schema.boolean();
    const trueResult = validator.validate(true);
    const falseResult = validator.validate(false);
    assert(trueResult.success, 'Should accept true');
    assert(falseResult.success, 'Should accept false');
    assert(trueResult.data === true, 'Should return true value');
    assert(falseResult.data === false, 'Should return false value');
});
test('Boolean validator - invalid type', () => {
    const validator = validation_1.Schema.boolean();
    const result = validator.validate('true');
    assert(!result.success, 'Should reject string "true"');
});
// Array validator tests
test('Array validator - valid array', () => {
    const validator = validation_1.Schema.array(validation_1.Schema.string());
    const result = validator.validate(['hello', 'world']);
    assert(result.success, 'Should accept valid array');
    assert(Array.isArray(result.data), 'Should return array');
    assert(result.data?.length === 2, 'Should have correct length');
});
test('Array validator - invalid items', () => {
    const validator = validation_1.Schema.array(validation_1.Schema.string());
    const result = validator.validate(['hello', 123, 'world']);
    assert(!result.success, 'Should reject array with invalid items');
});
test('Array validator - length validation', () => {
    const validator = validation_1.Schema.array(validation_1.Schema.string()).minLength(2).maxLength(3);
    const tooShort = validator.validate(['one']);
    const justRight = validator.validate(['one', 'two']);
    const tooLong = validator.validate(['one', 'two', 'three', 'four']);
    assert(!tooShort.success, 'Should reject array too short');
    assert(justRight.success, 'Should accept array with correct length');
    assert(!tooLong.success, 'Should reject array too long');
});
// Object validator tests
test('Object validator - valid object', () => {
    const validator = validation_1.Schema.object({
        name: validation_1.Schema.string(),
        age: validation_1.Schema.number()
    });
    const result = validator.validate({ name: 'John', age: 30 });
    assert(result.success, 'Should accept valid object');
    assert(result.data?.name === 'John', 'Should return correct name');
    assert(result.data?.age === 30, 'Should return correct age');
});
test('Object validator - missing required field', () => {
    const validator = validation_1.Schema.object({
        name: validation_1.Schema.string(),
        age: validation_1.Schema.number()
    });
    const result = validator.validate({ name: 'John' });
    assert(!result.success, 'Should reject object with missing required field');
});
test('Object validator - optional field', () => {
    const validator = validation_1.Schema.object({
        name: validation_1.Schema.string(),
        age: validation_1.Schema.number().optional()
    });
    const result = validator.validate({ name: 'John' });
    assert(result.success, 'Should accept object with missing optional field');
});
// Date validator tests
test('Date validator - valid date', () => {
    const validator = validation_1.Schema.date();
    const date = new Date('2023-01-01');
    const result = validator.validate(date);
    assert(result.success, 'Should accept valid Date object');
    assert(result.data instanceof Date, 'Should return Date object');
});
test('Date validator - date string', () => {
    const validator = validation_1.Schema.date();
    const result = validator.validate('2023-01-01');
    assert(result.success, 'Should accept valid date string');
    assert(result.data instanceof Date, 'Should return Date object');
});
test('Date validator - invalid date', () => {
    const validator = validation_1.Schema.date();
    const result = validator.validate('invalid-date');
    assert(!result.success, 'Should reject invalid date string');
});
// Complex nested validation
test('Complex nested object validation', () => {
    const userSchema = validation_1.Schema.object({
        id: validation_1.Schema.string().minLength(1),
        name: validation_1.Schema.string().minLength(2).maxLength(50),
        email: validation_1.Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        age: validation_1.Schema.number().min(0).max(150).optional(),
        isActive: validation_1.Schema.boolean(),
        tags: validation_1.Schema.array(validation_1.Schema.string()).minLength(1),
        address: validation_1.Schema.object({
            street: validation_1.Schema.string(),
            city: validation_1.Schema.string(),
            postalCode: validation_1.Schema.string().pattern(/^\d{5}$/)
        }).optional()
    });
    const validUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        isActive: true,
        tags: ['developer', 'designer'],
        address: {
            street: '123 Main St',
            city: 'Anytown',
            postalCode: '12345'
        }
    };
    const result = userSchema.validate(validUser);
    assert(result.success, 'Should accept valid complex object');
});
// Custom error messages
test('Custom error messages', () => {
    const validator = validation_1.Schema.string().withMessage('Custom error message');
    const result = validator.validate(123);
    assert(!result.success, 'Should fail validation');
    assert(result.errors[0].message === 'Custom error message', 'Should use custom error message');
});
console.log('\n✨ All tests completed!');
//# sourceMappingURL=test.js.map