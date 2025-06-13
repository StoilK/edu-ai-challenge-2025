import { ValidationResult } from './validation';
/**
 * Test runner utility function
 * @param name - Test name
 * @param testFn - Test function
 */
declare function test(name: string, testFn: () => void | Promise<void>): void;
/**
 * Assertion utility function
 * @param condition - Condition to assert
 * @param message - Error message if assertion fails
 */
declare function assert(condition: boolean, message: string): void;
/**
 * Assert validation result is successful
 * @param result - Validation result
 * @param expectedData - Expected data (optional)
 */
declare function assertSuccess<T>(result: ValidationResult<T>, expectedData?: T): void;
/**
 * Assert validation result is failure
 * @param result - Validation result
 * @param expectedErrorCount - Expected number of errors
 */
declare function assertFailure<T>(result: ValidationResult<T>, expectedErrorCount?: number): void;
export { test, assert, assertSuccess, assertFailure };
//# sourceMappingURL=validation.test.d.ts.map