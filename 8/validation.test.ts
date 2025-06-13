import { 
  Schema, 
  ValidationResult
} from './validation';

/**
 * Test runner utility function
 * @param name - Test name
 * @param testFn - Test function
 */
function test(name: string, testFn: () => void | Promise<void>): void {
  try {
    const result = testFn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`✅ ${name}`);
      }).catch((error) => {
        console.error(`❌ ${name}: ${error.message}`);
      });
    } else {
      console.log(`✅ ${name}`);
    }
  } catch (error) {
    console.error(`❌ ${name}: ${(error as Error).message}`);
  }
}

/**
 * Assertion utility function
 * @param condition - Condition to assert
 * @param message - Error message if assertion fails
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Assert validation result is successful
 * @param result - Validation result
 * @param expectedData - Expected data (optional)
 */
function assertSuccess<T>(result: ValidationResult<T>, expectedData?: T): void {
  assert(result.success, `Expected success but got errors: ${JSON.stringify(result.errors)}`);
  assert(result.errors.length === 0, `Expected no errors but got: ${JSON.stringify(result.errors)}`);
  if (expectedData !== undefined) {
    assert(JSON.stringify(result.data) === JSON.stringify(expectedData), 
           `Expected data ${JSON.stringify(expectedData)} but got ${JSON.stringify(result.data)}`);
  }
}

/**
 * Assert validation result is failure
 * @param result - Validation result
 * @param expectedErrorCount - Expected number of errors
 */
function assertFailure<T>(result: ValidationResult<T>, expectedErrorCount?: number): void {
  assert(!result.success, `Expected failure but got success with data: ${JSON.stringify(result.data)}`);
  assert(result.errors.length > 0, `Expected errors but got none`);
  if (expectedErrorCount !== undefined) {
    assert(result.errors.length === expectedErrorCount, 
           `Expected ${expectedErrorCount} errors but got ${result.errors.length}`);
  }
}

// ====== STRING VALIDATOR TESTS ======

test('StringValidator: Valid string', () => {
  const validator = Schema.string();
  const result = validator.validate('hello');
  assertSuccess(result, 'hello');
});

test('StringValidator: Invalid type (number)', () => {
  const validator = Schema.string();
  const result = validator.validate(123);
  assertFailure(result, 1);
  assert(result.errors[0].message === 'Expected string', 'Wrong error message');
});

test('StringValidator: Min length validation', () => {
  const validator = Schema.string().minLength(5);
  const shortResult = validator.validate('hi');
  assertFailure(shortResult, 1);
  
  const validResult = validator.validate('hello');
  assertSuccess(validResult, 'hello');
});

test('StringValidator: Max length validation', () => {
  const validator = Schema.string().maxLength(5);
  const longResult = validator.validate('hello world');
  assertFailure(longResult, 1);
  
  const validResult = validator.validate('hi');
  assertSuccess(validResult, 'hi');
});

test('StringValidator: Pattern validation', () => {
  const emailValidator = Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  const validResult = emailValidator.validate('test@example.com');
  assertSuccess(validResult, 'test@example.com');
  
  const invalidResult = emailValidator.validate('invalid email');
  assertFailure(invalidResult, 1);
});

test('StringValidator: Optional field', () => {
  const validator = Schema.string().optional();
  const undefinedResult = validator.validate(undefined);
  assertSuccess(undefinedResult, undefined);
  
  const nullResult = validator.validate(null);
  assertSuccess(nullResult, undefined);
  
  const validResult = validator.validate('hello');
  assertSuccess(validResult, 'hello');
});

test('StringValidator: Custom error message', () => {
  const validator = Schema.string().withMessage('Custom error');
  const result = validator.validate(123);
  assertFailure(result, 1);
  assert(result.errors[0].message === 'Custom error', 'Custom message not applied');
});

// ====== NUMBER VALIDATOR TESTS ======

test('NumberValidator: Valid number', () => {
  const validator = Schema.number();
  const result = validator.validate(42);
  assertSuccess(result, 42);
});

test('NumberValidator: Invalid type (string)', () => {
  const validator = Schema.number();
  const result = validator.validate('hello');
  assertFailure(result, 1);
});

test('NumberValidator: NaN validation', () => {
  const validator = Schema.number();
  const result = validator.validate(NaN);
  assertFailure(result, 1);
});

test('NumberValidator: Min value validation', () => {
  const validator = Schema.number().min(10);
  const lowResult = validator.validate(5);
  assertFailure(lowResult, 1);
  
  const validResult = validator.validate(15);
  assertSuccess(validResult, 15);
});

test('NumberValidator: Max value validation', () => {
  const validator = Schema.number().max(100);
  const highResult = validator.validate(150);
  assertFailure(highResult, 1);
  
  const validResult = validator.validate(50);
  assertSuccess(validResult, 50);
});

test('NumberValidator: Integer validation', () => {
  const validator = Schema.number().integer();
  const floatResult = validator.validate(3.14);
  assertFailure(floatResult, 1);
  
  const intResult = validator.validate(42);
  assertSuccess(intResult, 42);
});

test('NumberValidator: Chained validations', () => {
  const validator = Schema.number().min(0).max(100).integer();
  const validResult = validator.validate(50);
  assertSuccess(validResult, 50);
  
  const invalidResult = validator.validate(-5);
  assertFailure(invalidResult, 1);
});

// ====== BOOLEAN VALIDATOR TESTS ======

test('BooleanValidator: Valid boolean true', () => {
  const validator = Schema.boolean();
  const result = validator.validate(true);
  assertSuccess(result, true);
});

test('BooleanValidator: Valid boolean false', () => {
  const validator = Schema.boolean();
  const result = validator.validate(false);
  assertSuccess(result, false);
});

test('BooleanValidator: Invalid type', () => {
  const validator = Schema.boolean();
  const result = validator.validate('true');
  assertFailure(result, 1);
});

// ====== DATE VALIDATOR TESTS ======

test('DateValidator: Valid Date object', () => {
  const validator = Schema.date();
  const date = new Date('2023-01-01');
  const result = validator.validate(date);
  assertSuccess(result, date);
});

test('DateValidator: Valid date string', () => {
  const validator = Schema.date();
  const result = validator.validate('2023-01-01');
  assertSuccess(result);
  assert(result.data instanceof Date, 'Result should be Date object');
});

test('DateValidator: Invalid date string', () => {
  const validator = Schema.date();
  const result = validator.validate('invalid date');
  assertFailure(result, 1);
});

test('DateValidator: Before validation', () => {
  const cutoffDate = new Date('2023-01-01');
  const validator = Schema.date().before(cutoffDate);
  
  const validResult = validator.validate('2022-12-31');
  assertSuccess(validResult);
  
  const invalidResult = validator.validate('2023-01-02');
  assertFailure(invalidResult, 1);
});

test('DateValidator: After validation', () => {
  const cutoffDate = new Date('2023-01-01');
  const validator = Schema.date().after(cutoffDate);
  
  const validResult = validator.validate('2023-01-02');
  assertSuccess(validResult);
  
  const invalidResult = validator.validate('2022-12-31');
  assertFailure(invalidResult, 1);
});

// ====== ARRAY VALIDATOR TESTS ======

test('ArrayValidator: Valid array', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate(['hello', 'world']);
  assertSuccess(result, ['hello', 'world']);
});

test('ArrayValidator: Invalid type', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate('not an array');
  assertFailure(result, 1);
});

test('ArrayValidator: Invalid item types', () => {
  const validator = Schema.array(Schema.string());
  const result = validator.validate(['hello', 123, 'world']);
  assertFailure(result, 1);
  assert(result.errors[0].path === '[1]', 'Error path should indicate array index');
});

test('ArrayValidator: Min length validation', () => {
  const validator = Schema.array(Schema.string()).minLength(2);
  const shortResult = validator.validate(['one']);
  assertFailure(shortResult, 1);
  
  const validResult = validator.validate(['one', 'two']);
  assertSuccess(validResult, ['one', 'two']);
});

test('ArrayValidator: Max length validation', () => {
  const validator = Schema.array(Schema.string()).maxLength(2);
  const longResult = validator.validate(['one', 'two', 'three']);
  assertFailure(longResult, 1);
  
  const validResult = validator.validate(['one', 'two']);
  assertSuccess(validResult, ['one', 'two']);
});

test('ArrayValidator: Nested array validation', () => {
  const validator = Schema.array(Schema.array(Schema.number()));
  const result = validator.validate([[1, 2], [3, 4]]);
  assertSuccess(result, [[1, 2], [3, 4]]);
  
  const invalidResult = validator.validate([[1, 'invalid'], [3, 4]]);
  assertFailure(invalidResult, 1);
});

// ====== OBJECT VALIDATOR TESTS ======

test('ObjectValidator: Valid object', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number()
  });
  const data = { name: 'John', age: 30 };
  const result = validator.validate(data);
  assertSuccess(result, data);
});

test('ObjectValidator: Invalid type', () => {
  const validator = Schema.object({
    name: Schema.string()
  });
  const result = validator.validate('not an object');
  assertFailure(result, 1);
});

test('ObjectValidator: Missing required field', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number()
  });
  const result = validator.validate({ name: 'John' });
  assertFailure(result, 1);
  assert(result.errors[0].path === 'age', 'Error path should indicate missing field');
});

test('ObjectValidator: Optional fields', () => {
  const validator = Schema.object({
    name: Schema.string(),
    age: Schema.number().optional()
  });
  const result = validator.validate({ name: 'John' });
  assertSuccess(result, { name: 'John' });
});

test('ObjectValidator: Nested object validation', () => {
  const addressValidator = Schema.object({
    street: Schema.string(),
    city: Schema.string()
  });
  
  const userValidator = Schema.object({
    name: Schema.string(),
    address: addressValidator
  });
  
  const validData = {
    name: 'John',
    address: {
      street: '123 Main St',
      city: 'Anytown'
    }
  };
  
  const result = userValidator.validate(validData);
  assertSuccess(result, validData);
});

test('ObjectValidator: Error path tracking', () => {
  const validator = Schema.object({
    user: Schema.object({
      profile: Schema.object({
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      })
    })
  });
  
  const result = validator.validate({
    user: {
      profile: {
        email: 'invalid email'
      }
    }
  });
  
  assertFailure(result, 1);
  assert(result.errors[0].path === 'user.profile.email', 'Error path should be deeply nested');
});

// ====== COMPLEX INTEGRATION TESTS ======

test('Complex schema validation', () => {
  const userSchema = Schema.object({
    id: Schema.string().minLength(1),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age: Schema.number().min(0).max(150).integer().optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()).minLength(1),
    address: Schema.object({
      street: Schema.string().minLength(1),
      city: Schema.string().minLength(1),
      postalCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/)
    }).optional(),
    createdAt: Schema.date().optional()
  });
  
  const validData = {
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
    },
    createdAt: new Date('2023-01-01')
  };
  
  const result = userSchema.validate(validData);
  assertSuccess(result, validData);
});

test('Multiple validation errors', () => {
  const validator = Schema.object({
    name: Schema.string().minLength(5),
    age: Schema.number().min(18),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  });
  
  const invalidData = {
    name: 'Jo',        // Too short
    age: 15,           // Too young
    email: 'invalid'   // Invalid format
  };
  
  const result = validator.validate(invalidData);
  assertFailure(result, 3);
});

test('Optional vs required field handling', () => {
  const validator = Schema.object({
    required: Schema.string(),
    optional: Schema.string().optional()
  });
  
  // Missing required field
  const missingRequired = validator.validate({ optional: 'present' });
  assertFailure(missingRequired, 1);
  
  // Missing optional field (should pass)
  const missingOptional = validator.validate({ required: 'present' });
  assertSuccess(missingOptional, { required: 'present' });
  
  // Both present
  const bothPresent = validator.validate({ required: 'req', optional: 'opt' });
  assertSuccess(bothPresent, { required: 'req', optional: 'opt' });
});

// ====== RUN ALL TESTS ======

console.log('🧪 Running Validation Library Tests...\n');

// Run all tests
console.log('📝 String Validator Tests:');
// String tests will run when this file is executed

console.log('\n🔢 Number Validator Tests:');
// Number tests will run when this file is executed

console.log('\n✅❌ Boolean Validator Tests:');
// Boolean tests will run when this file is executed

console.log('\n📅 Date Validator Tests:');
// Date tests will run when this file is executed

console.log('\n📋 Array Validator Tests:');
// Array tests will run when this file is executed

console.log('\n🏗️ Object Validator Tests:');
// Object tests will run when this file is executed

console.log('\n🔄 Integration Tests:');
// Integration tests will run when this file is executed

console.log('\n✨ All tests completed!');

export { test, assert, assertSuccess, assertFailure }; 