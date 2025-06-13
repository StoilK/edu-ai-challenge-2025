/**
 * A robust validation library for complex data structures
 * Provides type-safe validation for primitive and complex types
 */
/**
 * Base interface for all validation results
 */
export interface ValidationResult<T = any> {
    success: boolean;
    data?: T;
    errors: ValidationError[];
}
/**
 * Represents a validation error with detailed information
 */
export interface ValidationError {
    path: string;
    message: string;
    value?: any;
}
/**
 * Base abstract class for all validators
 * Provides common functionality and type safety
 */
export declare abstract class Validator<T> {
    protected _optional: boolean;
    protected _customMessage?: string;
    /**
     * Validates the input value
     * @param value - The value to validate
     * @param path - The path for error reporting
     * @returns ValidationResult with success status and errors
     */
    abstract validate(value: any, path?: string): ValidationResult<T>;
    /**
     * Marks this validator as optional
     * @returns The validator instance for chaining
     */
    optional(): this;
    /**
     * Sets a custom error message
     * @param message - Custom error message
     * @returns The validator instance for chaining
     */
    withMessage(message: string): this;
    /**
     * Helper method to create validation error
     * @param message - Error message
     * @param value - Invalid value
     * @param path - Path to the error
     * @returns ValidationError object
     */
    protected createError(message: string, value: any, path?: string): ValidationError;
    /**
     * Helper method to check if value is undefined and handle optional validation
     * @param value - Value to check
     * @param path - Path for error reporting
     * @returns ValidationResult if undefined, null if should continue validation
     */
    protected handleUndefined(value: any, path?: string): ValidationResult<T> | null;
}
/**
 * String validator with various string-specific validations
 */
export declare class StringValidator extends Validator<string> {
    private _minLength?;
    private _maxLength?;
    private _pattern?;
    validate(value: any, path?: string): ValidationResult<string>;
    /**
     * Sets minimum length requirement
     * @param length - Minimum length
     * @returns The validator instance for chaining
     */
    minLength(length: number): this;
    /**
     * Sets maximum length requirement
     * @param length - Maximum length
     * @returns The validator instance for chaining
     */
    maxLength(length: number): this;
    /**
     * Sets pattern requirement using regular expression
     * @param pattern - Regular expression pattern
     * @returns The validator instance for chaining
     */
    pattern(pattern: RegExp): this;
}
/**
 * Number validator with numeric-specific validations
 */
export declare class NumberValidator extends Validator<number> {
    private _min?;
    private _max?;
    private _integer?;
    validate(value: any, path?: string): ValidationResult<number>;
    /**
     * Sets minimum value requirement
     * @param min - Minimum value
     * @returns The validator instance for chaining
     */
    min(min: number): this;
    /**
     * Sets maximum value requirement
     * @param max - Maximum value
     * @returns The validator instance for chaining
     */
    max(max: number): this;
    /**
     * Requires the number to be an integer
     * @returns The validator instance for chaining
     */
    integer(): this;
}
/**
 * Boolean validator
 */
export declare class BooleanValidator extends Validator<boolean> {
    validate(value: any, path?: string): ValidationResult<boolean>;
}
/**
 * Date validator with date-specific validations
 */
export declare class DateValidator extends Validator<Date> {
    private _before?;
    private _after?;
    validate(value: any, path?: string): ValidationResult<Date>;
    /**
     * Sets requirement that date must be before specified date
     * @param date - Date that value must be before
     * @returns The validator instance for chaining
     */
    before(date: Date): this;
    /**
     * Sets requirement that date must be after specified date
     * @param date - Date that value must be after
     * @returns The validator instance for chaining
     */
    after(date: Date): this;
}
/**
 * Array validator for validating arrays with specific item types
 */
export declare class ArrayValidator<T> extends Validator<T[]> {
    private itemValidator;
    private _minLength?;
    private _maxLength?;
    constructor(itemValidator: Validator<T>);
    validate(value: any, path?: string): ValidationResult<T[]>;
    /**
     * Sets minimum array length requirement
     * @param length - Minimum length
     * @returns The validator instance for chaining
     */
    minLength(length: number): this;
    /**
     * Sets maximum array length requirement
     * @param length - Maximum length
     * @returns The validator instance for chaining
     */
    maxLength(length: number): this;
}
/**
 * Object validator for validating objects with specific schemas
 */
export declare class ObjectValidator<T> extends Validator<T> {
    private schema;
    constructor(schema: Record<string, Validator<any>>);
    validate(value: any, path?: string): ValidationResult<T>;
}
/**
 * Main Schema class - Factory for creating validators
 * Provides a fluent API for building validation schemas
 */
export declare class Schema {
    /**
     * Creates a string validator
     * @returns StringValidator instance
     */
    static string(): StringValidator;
    /**
     * Creates a number validator
     * @returns NumberValidator instance
     */
    static number(): NumberValidator;
    /**
     * Creates a boolean validator
     * @returns BooleanValidator instance
     */
    static boolean(): BooleanValidator;
    /**
     * Creates a date validator
     * @returns DateValidator instance
     */
    static date(): DateValidator;
    /**
     * Creates an object validator with specified schema
     * @param schema - Object schema mapping property names to validators
     * @returns ObjectValidator instance
     */
    static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T>;
    /**
     * Creates an array validator for arrays of specific item type
     * @param itemValidator - Validator for array items
     * @returns ArrayValidator instance
     */
    static array<T>(itemValidator: Validator<T>): ArrayValidator<T>;
}
//# sourceMappingURL=validation.d.ts.map