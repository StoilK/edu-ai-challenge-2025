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
export abstract class Validator<T> {
  protected _optional: boolean = false;
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
  optional(): this {
    this._optional = true;
    return this;
  }

  /**
   * Sets a custom error message
   * @param message - Custom error message
   * @returns The validator instance for chaining
   */
  withMessage(message: string): this {
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
  protected createError(message: string, value: any, path: string = ''): ValidationError {
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
  protected handleUndefined(value: any, path: string = ''): ValidationResult<T> | null {
    if (value === undefined || value === null) {
      if (this._optional) {
        return { success: true, data: undefined as any, errors: [] };
      }
      return {
        success: false,
        errors: [this.createError('Value is required', value, path)]
      };
    }
    return null;
  }
}

/**
 * String validator with various string-specific validations
 */
export class StringValidator extends Validator<string> {
  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: RegExp;

  validate(value: any, path: string = ''): ValidationResult<string> {
    // Handle undefined/null values
    const undefinedResult = this.handleUndefined(value, path);
    if (undefinedResult) return undefinedResult;

    // Type check
    if (typeof value !== 'string') {
      return {
        success: false,
        errors: [this.createError('Expected string', value, path)]
      };
    }

    const errors: ValidationError[] = [];

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
  minLength(length: number): this {
    this._minLength = length;
    return this;
  }

  /**
   * Sets maximum length requirement
   * @param length - Maximum length
   * @returns The validator instance for chaining
   */
  maxLength(length: number): this {
    this._maxLength = length;
    return this;
  }

  /**
   * Sets pattern requirement using regular expression
   * @param pattern - Regular expression pattern
   * @returns The validator instance for chaining
   */
  pattern(pattern: RegExp): this {
    this._pattern = pattern;
    return this;
  }
}

/**
 * Number validator with numeric-specific validations
 */
export class NumberValidator extends Validator<number> {
  private _min?: number;
  private _max?: number;
  private _integer?: boolean;

  validate(value: any, path: string = ''): ValidationResult<number> {
    // Handle undefined/null values
    const undefinedResult = this.handleUndefined(value, path);
    if (undefinedResult) return undefinedResult;

    // Type check
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        success: false,
        errors: [this.createError('Expected number', value, path)]
      };
    }

    const errors: ValidationError[] = [];

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
  min(min: number): this {
    this._min = min;
    return this;
  }

  /**
   * Sets maximum value requirement
   * @param max - Maximum value
   * @returns The validator instance for chaining
   */
  max(max: number): this {
    this._max = max;
    return this;
  }

  /**
   * Requires the number to be an integer
   * @returns The validator instance for chaining
   */
  integer(): this {
    this._integer = true;
    return this;
  }
}

/**
 * Boolean validator
 */
export class BooleanValidator extends Validator<boolean> {
  validate(value: any, path: string = ''): ValidationResult<boolean> {
    // Handle undefined/null values
    const undefinedResult = this.handleUndefined(value, path);
    if (undefinedResult) return undefinedResult;

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

/**
 * Date validator with date-specific validations
 */
export class DateValidator extends Validator<Date> {
  private _before?: Date;
  private _after?: Date;

  validate(value: any, path: string = ''): ValidationResult<Date> {
    // Handle undefined/null values
    const undefinedResult = this.handleUndefined(value, path);
    if (undefinedResult) return undefinedResult;

    // Type check and parsing
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
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

    const errors: ValidationError[] = [];

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
  before(date: Date): this {
    this._before = date;
    return this;
  }

  /**
   * Sets requirement that date must be after specified date
   * @param date - Date that value must be after
   * @returns The validator instance for chaining
   */
  after(date: Date): this {
    this._after = date;
    return this;
  }
}

/**
 * Array validator for validating arrays with specific item types
 */
export class ArrayValidator<T> extends Validator<T[]> {
  private _minLength?: number;
  private _maxLength?: number;

  constructor(private itemValidator: Validator<T>) {
    super();
  }

  validate(value: any, path: string = ''): ValidationResult<T[]> {
    // Handle undefined/null values
    const undefinedResult = this.handleUndefined(value, path);
    if (undefinedResult) return undefinedResult;

    // Type check
    if (!Array.isArray(value)) {
      return {
        success: false,
        errors: [this.createError('Expected array', value, path)]
      };
    }

    const errors: ValidationError[] = [];

    // Length validations
    if (this._minLength !== undefined && value.length < this._minLength) {
      errors.push(this.createError(`Array must have at least ${this._minLength} items`, value, path));
    }

    if (this._maxLength !== undefined && value.length > this._maxLength) {
      errors.push(this.createError(`Array must have at most ${this._maxLength} items`, value, path));
    }

    // Validate each item
    const validatedItems: T[] = [];
    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i], `${path}[${i}]`);
      if (!itemResult.success) {
        errors.push(...itemResult.errors);
      } else if (itemResult.data !== undefined) {
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
  minLength(length: number): this {
    this._minLength = length;
    return this;
  }

  /**
   * Sets maximum array length requirement
   * @param length - Maximum length
   * @returns The validator instance for chaining
   */
  maxLength(length: number): this {
    this._maxLength = length;
    return this;
  }
}

/**
 * Object validator for validating objects with specific schemas
 */
export class ObjectValidator<T> extends Validator<T> {
  constructor(private schema: Record<string, Validator<any>>) {
    super();
  }

  validate(value: any, path: string = ''): ValidationResult<T> {
    // Handle undefined/null values
    const undefinedResult = this.handleUndefined(value, path);
    if (undefinedResult) return undefinedResult;

    // Type check
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        success: false,
        errors: [this.createError('Expected object', value, path)]
      };
    }

    const errors: ValidationError[] = [];
    const validatedObject: any = {};

    // Validate each property in schema
    for (const [key, validator] of Object.entries(this.schema)) {
      const propertyPath = path ? `${ path}.${key}` : key;
      const result = validator.validate(value[key], propertyPath);
      
      if (!result.success) {
        errors.push(...result.errors);
      } else if (result.data !== undefined) {
        validatedObject[key] = result.data;
      }
    }

    return {
      success: errors.length === 0,
      data: errors.length === 0 ? validatedObject as T : undefined,
      errors
    };
  }
}

/**
 * Main Schema class - Factory for creating validators
 * Provides a fluent API for building validation schemas
 */
export class Schema {
  /**
   * Creates a string validator
   * @returns StringValidator instance
   */
  static string(): StringValidator {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator
   * @returns NumberValidator instance
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator
   * @returns BooleanValidator instance
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator
   * @returns DateValidator instance
   */
  static date(): DateValidator {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator with specified schema
   * @param schema - Object schema mapping property names to validators
   * @returns ObjectValidator instance
   */
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }
  
  /**
   * Creates an array validator for arrays of specific item type
   * @param itemValidator - Validator for array items
   * @returns ArrayValidator instance
   */
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }
} 