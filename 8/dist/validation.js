"use strict";
/**
 * A robust validation library for complex data structures
 * Provides type-safe validation for primitive and complex types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.ObjectValidator = exports.ArrayValidator = exports.DateValidator = exports.BooleanValidator = exports.NumberValidator = exports.StringValidator = exports.Validator = void 0;
/**
 * Base abstract class for all validators
 * Provides common functionality and type safety
 */
class Validator {
    constructor() {
        this._optional = false;
    }
    /**
     * Marks this validator as optional
     * @returns The validator instance for chaining
     */
    optional() {
        this._optional = true;
        return this;
    }
    /**
     * Sets a custom error message
     * @param message - Custom error message
     * @returns The validator instance for chaining
     */
    withMessage(message) {
        this._customMessage = message;
        return this;
    }
    /**
     * Helper method to create validation error
     * @param message - Error message
     * @param value - Invalid value
     * @param path - Path to the error
     * @returns ValidationError object
     */
    createError(message, value, path = '') {
        return {
            path,
            message: this._customMessage || message,
            value
        };
    }
    /**
     * Helper method to check if value is undefined and handle optional validation
     * @param value - Value to check
     * @param path - Path for error reporting
     * @returns ValidationResult if undefined, null if should continue validation
     */
    handleUndefined(value, path = '') {
        if (value === undefined || value === null) {
            if (this._optional) {
                return { success: true, data: undefined, errors: [] };
            }
            return {
                success: false,
                errors: [this.createError('Value is required', value, path)]
            };
        }
        return null;
    }
}
exports.Validator = Validator;
/**
 * String validator with various string-specific validations
 */
class StringValidator extends Validator {
    validate(value, path = '') {
        // Handle undefined/null values
        const undefinedResult = this.handleUndefined(value, path);
        if (undefinedResult)
            return undefinedResult;
        // Type check
        if (typeof value !== 'string') {
            return {
                success: false,
                errors: [this.createError('Expected string', value, path)]
            };
        }
        const errors = [];
        // Length validations
        if (this._minLength !== undefined && value.length < this._minLength) {
            errors.push(this.createError(`String must be at least ${this._minLength} characters`, value, path));
        }
        if (this._maxLength !== undefined && value.length > this._maxLength) {
            errors.push(this.createError(`String must be at most ${this._maxLength} characters`, value, path));
        }
        // Pattern validation
        if (this._pattern && !this._pattern.test(value)) {
            errors.push(this.createError(`String does not match required pattern`, value, path));
        }
        return {
            success: errors.length === 0,
            data: errors.length === 0 ? value : undefined,
            errors
        };
    }
    /**
     * Sets minimum length requirement
     * @param length - Minimum length
     * @returns The validator instance for chaining
     */
    minLength(length) {
        this._minLength = length;
        return this;
    }
    /**
     * Sets maximum length requirement
     * @param length - Maximum length
     * @returns The validator instance for chaining
     */
    maxLength(length) {
        this._maxLength = length;
        return this;
    }
    /**
     * Sets pattern requirement using regular expression
     * @param pattern - Regular expression pattern
     * @returns The validator instance for chaining
     */
    pattern(pattern) {
        this._pattern = pattern;
        return this;
    }
}
exports.StringValidator = StringValidator;
/**
 * Number validator with numeric-specific validations
 */
class NumberValidator extends Validator {
    validate(value, path = '') {
        // Handle undefined/null values
        const undefinedResult = this.handleUndefined(value, path);
        if (undefinedResult)
            return undefinedResult;
        // Type check
        if (typeof value !== 'number' || isNaN(value)) {
            return {
                success: false,
                errors: [this.createError('Expected number', value, path)]
            };
        }
        const errors = [];
        // Range validations
        if (this._min !== undefined && value < this._min) {
            errors.push(this.createError(`Number must be at least ${this._min}`, value, path));
        }
        if (this._max !== undefined && value > this._max) {
            errors.push(this.createError(`Number must be at most ${this._max}`, value, path));
        }
        // Integer validation
        if (this._integer && !Number.isInteger(value)) {
            errors.push(this.createError('Number must be an integer', value, path));
        }
        return {
            success: errors.length === 0,
            data: errors.length === 0 ? value : undefined,
            errors
        };
    }
    /**
     * Sets minimum value requirement
     * @param min - Minimum value
     * @returns The validator instance for chaining
     */
    min(min) {
        this._min = min;
        return this;
    }
    /**
     * Sets maximum value requirement
     * @param max - Maximum value
     * @returns The validator instance for chaining
     */
    max(max) {
        this._max = max;
        return this;
    }
    /**
     * Requires the number to be an integer
     * @returns The validator instance for chaining
     */
    integer() {
        this._integer = true;
        return this;
    }
}
exports.NumberValidator = NumberValidator;
/**
 * Boolean validator
 */
class BooleanValidator extends Validator {
    validate(value, path = '') {
        // Handle undefined/null values
        const undefinedResult = this.handleUndefined(value, path);
        if (undefinedResult)
            return undefinedResult;
        // Type check
        if (typeof value !== 'boolean') {
            return {
                success: false,
                errors: [this.createError('Expected boolean', value, path)]
            };
        }
        return {
            success: true,
            data: value,
            errors: []
        };
    }
}
exports.BooleanValidator = BooleanValidator;
/**
 * Date validator with date-specific validations
 */
class DateValidator extends Validator {
    validate(value, path = '') {
        // Handle undefined/null values
        const undefinedResult = this.handleUndefined(value, path);
        if (undefinedResult)
            return undefinedResult;
        // Type check and parsing
        let date;
        if (value instanceof Date) {
            date = value;
        }
        else if (typeof value === 'string' || typeof value === 'number') {
            date = new Date(value);
        }
        else {
            return {
                success: false,
                errors: [this.createError('Expected Date, string, or number', value, path)]
            };
        }
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return {
                success: false,
                errors: [this.createError('Invalid date', value, path)]
            };
        }
        const errors = [];
        // Date range validations
        if (this._before && date >= this._before) {
            errors.push(this.createError(`Date must be before ${this._before.toISOString()}`, value, path));
        }
        if (this._after && date <= this._after) {
            errors.push(this.createError(`Date must be after ${this._after.toISOString()}`, value, path));
        }
        return {
            success: errors.length === 0,
            data: errors.length === 0 ? date : undefined,
            errors
        };
    }
    /**
     * Sets requirement that date must be before specified date
     * @param date - Date that value must be before
     * @returns The validator instance for chaining
     */
    before(date) {
        this._before = date;
        return this;
    }
    /**
     * Sets requirement that date must be after specified date
     * @param date - Date that value must be after
     * @returns The validator instance for chaining
     */
    after(date) {
        this._after = date;
        return this;
    }
}
exports.DateValidator = DateValidator;
/**
 * Array validator for validating arrays with specific item types
 */
class ArrayValidator extends Validator {
    constructor(itemValidator) {
        super();
        this.itemValidator = itemValidator;
    }
    validate(value, path = '') {
        // Handle undefined/null values
        const undefinedResult = this.handleUndefined(value, path);
        if (undefinedResult)
            return undefinedResult;
        // Type check
        if (!Array.isArray(value)) {
            return {
                success: false,
                errors: [this.createError('Expected array', value, path)]
            };
        }
        const errors = [];
        // Length validations
        if (this._minLength !== undefined && value.length < this._minLength) {
            errors.push(this.createError(`Array must have at least ${this._minLength} items`, value, path));
        }
        if (this._maxLength !== undefined && value.length > this._maxLength) {
            errors.push(this.createError(`Array must have at most ${this._maxLength} items`, value, path));
        }
        // Validate each item
        const validatedItems = [];
        for (let i = 0; i < value.length; i++) {
            const itemResult = this.itemValidator.validate(value[i], `${path}[${i}]`);
            if (!itemResult.success) {
                errors.push(...itemResult.errors);
            }
            else if (itemResult.data !== undefined) {
                validatedItems.push(itemResult.data);
            }
        }
        return {
            success: errors.length === 0,
            data: errors.length === 0 ? validatedItems : undefined,
            errors
        };
    }
    /**
     * Sets minimum array length requirement
     * @param length - Minimum length
     * @returns The validator instance for chaining
     */
    minLength(length) {
        this._minLength = length;
        return this;
    }
    /**
     * Sets maximum array length requirement
     * @param length - Maximum length
     * @returns The validator instance for chaining
     */
    maxLength(length) {
        this._maxLength = length;
        return this;
    }
}
exports.ArrayValidator = ArrayValidator;
/**
 * Object validator for validating objects with specific schemas
 */
class ObjectValidator extends Validator {
    constructor(schema) {
        super();
        this.schema = schema;
    }
    validate(value, path = '') {
        // Handle undefined/null values
        const undefinedResult = this.handleUndefined(value, path);
        if (undefinedResult)
            return undefinedResult;
        // Type check
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return {
                success: false,
                errors: [this.createError('Expected object', value, path)]
            };
        }
        const errors = [];
        const validatedObject = {};
        // Validate each property in schema
        for (const [key, validator] of Object.entries(this.schema)) {
            const propertyPath = path ? `${path}.${key}` : key;
            const result = validator.validate(value[key], propertyPath);
            if (!result.success) {
                errors.push(...result.errors);
            }
            else if (result.data !== undefined) {
                validatedObject[key] = result.data;
            }
        }
        return {
            success: errors.length === 0,
            data: errors.length === 0 ? validatedObject : undefined,
            errors
        };
    }
}
exports.ObjectValidator = ObjectValidator;
/**
 * Main Schema class - Factory for creating validators
 * Provides a fluent API for building validation schemas
 */
class Schema {
    /**
     * Creates a string validator
     * @returns StringValidator instance
     */
    static string() {
        return new StringValidator();
    }
    /**
     * Creates a number validator
     * @returns NumberValidator instance
     */
    static number() {
        return new NumberValidator();
    }
    /**
     * Creates a boolean validator
     * @returns BooleanValidator instance
     */
    static boolean() {
        return new BooleanValidator();
    }
    /**
     * Creates a date validator
     * @returns DateValidator instance
     */
    static date() {
        return new DateValidator();
    }
    /**
     * Creates an object validator with specified schema
     * @param schema - Object schema mapping property names to validators
     * @returns ObjectValidator instance
     */
    static object(schema) {
        return new ObjectValidator(schema);
    }
    /**
     * Creates an array validator for arrays of specific item type
     * @param itemValidator - Validator for array items
     * @returns ArrayValidator instance
     */
    static array(itemValidator) {
        return new ArrayValidator(itemValidator);
    }
}
exports.Schema = Schema;
//# sourceMappingURL=validation.js.map