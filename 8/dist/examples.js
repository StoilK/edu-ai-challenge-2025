"use strict";
/**
 * Examples demonstrating the usage of the validation library
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("./validation");
console.log('📚 Validation Library Examples\n');
// ===== BASIC USAGE EXAMPLES =====
console.log('🔤 Basic String Validation:');
const nameValidator = validation_1.Schema.string().minLength(2).maxLength(50);
const nameResult = nameValidator.validate('John Doe');
console.log('Valid name result:', nameResult);
const shortNameResult = nameValidator.validate('J');
console.log('Invalid name result:', shortNameResult);
console.log('\n📧 Email Validation:');
const emailValidator = validation_1.Schema.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Please provide a valid email address');
const emailResult = emailValidator.validate('john@example.com');
console.log('Valid email:', emailResult);
const invalidEmailResult = emailValidator.validate('not-an-email');
console.log('Invalid email:', invalidEmailResult);
console.log('\n🔢 Number Validation:');
const ageValidator = validation_1.Schema.number()
    .min(0)
    .max(150)
    .integer()
    .withMessage('Age must be a valid integer between 0 and 150');
const ageResult = ageValidator.validate(25);
console.log('Valid age:', ageResult);
const invalidAgeResult = ageValidator.validate(-5);
console.log('Invalid age:', invalidAgeResult);
// ===== ADVANCED OBJECT VALIDATION =====
console.log('\n👤 User Profile Validation:');
const userProfileSchema = validation_1.Schema.object({
    id: validation_1.Schema.string().minLength(1).withMessage('User ID is required'),
    username: validation_1.Schema.string()
        .minLength(3)
        .maxLength(20)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be 3-20 characters, alphanumeric and underscores only'),
    email: validation_1.Schema.string()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        .withMessage('Invalid email format'),
    age: validation_1.Schema.number()
        .min(13)
        .max(120)
        .integer()
        .optional(),
    isActive: validation_1.Schema.boolean(),
    preferences: validation_1.Schema.object({
        theme: validation_1.Schema.string().pattern(/^(light|dark)$/),
        notifications: validation_1.Schema.boolean()
    }).optional(),
    tags: validation_1.Schema.array(validation_1.Schema.string()).minLength(1).maxLength(10)
});
const validUser = {
    id: 'user_123',
    username: 'john_doe',
    email: 'john@example.com',
    age: 28,
    isActive: true,
    preferences: {
        theme: 'dark',
        notifications: true
    },
    tags: ['developer', 'javascript', 'typescript']
};
const userResult = userProfileSchema.validate(validUser);
console.log('Valid user profile:', userResult.success ? '✅ Valid' : '❌ Invalid');
if (!userResult.success) {
    console.log('Errors:', userResult.errors);
}
// Example with validation errors
const invalidUser = {
    id: '', // Empty ID
    username: 'jo', // Too short
    email: 'invalid-email', // Invalid format
    age: 12, // Too young
    isActive: 'yes', // Wrong type
    tags: [] // Empty array
};
console.log('\n❌ Invalid User Example:');
const invalidUserResult = userProfileSchema.validate(invalidUser);
console.log('Validation result:', invalidUserResult.success ? '✅ Valid' : '❌ Invalid');
console.log('Errors found:', invalidUserResult.errors.length);
invalidUserResult.errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.path}: ${error.message}`);
});
// ===== E-COMMERCE PRODUCT VALIDATION =====
console.log('\n🛍️ E-commerce Product Validation:');
const productSchema = validation_1.Schema.object({
    id: validation_1.Schema.string().pattern(/^PROD_\d+$/).withMessage('Product ID must start with PROD_ followed by numbers'),
    name: validation_1.Schema.string().minLength(1).maxLength(100),
    description: validation_1.Schema.string().minLength(10).maxLength(1000).optional(),
    price: validation_1.Schema.number().min(0).withMessage('Price must be non-negative'),
    category: validation_1.Schema.string().pattern(/^(electronics|clothing|books|home|sports)$/),
    inStock: validation_1.Schema.boolean(),
    variants: validation_1.Schema.array(validation_1.Schema.object({
        size: validation_1.Schema.string().optional(),
        color: validation_1.Schema.string().optional(),
        sku: validation_1.Schema.string().minLength(1),
        additionalPrice: validation_1.Schema.number().min(0).optional()
    })).minLength(1).withMessage('At least one variant is required'),
    tags: validation_1.Schema.array(validation_1.Schema.string()).maxLength(20).optional(),
    releaseDate: validation_1.Schema.date().optional()
});
const sampleProduct = {
    id: 'PROD_12345',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    category: 'electronics',
    inStock: true,
    variants: [
        { color: 'black', sku: 'WH-001-BLK' },
        { color: 'white', sku: 'WH-001-WHT', additionalPrice: 10 }
    ],
    tags: ['wireless', 'audio', 'bluetooth'],
    releaseDate: new Date('2023-06-01')
};
const productResult = productSchema.validate(sampleProduct);
console.log('Product validation:', productResult.success ? '✅ Valid' : '❌ Invalid');
// ===== API REQUEST VALIDATION =====
console.log('\n🌐 API Request Validation:');
const createPostSchema = validation_1.Schema.object({
    title: validation_1.Schema.string().minLength(1).maxLength(200),
    content: validation_1.Schema.string().minLength(10).maxLength(5000),
    authorId: validation_1.Schema.string().pattern(/^[0-9a-f]{24}$/).withMessage('Invalid author ID format'),
    tags: validation_1.Schema.array(validation_1.Schema.string()).maxLength(10).optional(),
    publishAt: validation_1.Schema.date().after(new Date()).optional(),
    isPublic: validation_1.Schema.boolean(),
    metadata: validation_1.Schema.object({
        source: validation_1.Schema.string().optional(),
        priority: validation_1.Schema.number().min(1).max(5).integer().optional()
    }).optional()
});
const apiRequest = {
    title: 'Getting Started with TypeScript',
    content: 'This is a comprehensive guide to getting started with TypeScript development...',
    authorId: '507f1f77bcf86cd799439011',
    tags: ['typescript', 'javascript', 'programming'],
    publishAt: new Date('2024-01-01'),
    isPublic: true,
    metadata: {
        source: 'blog',
        priority: 3
    }
};
const apiResult = createPostSchema.validate(apiRequest);
console.log('API request validation:', apiResult.success ? '✅ Valid' : '❌ Invalid');
// ===== NESTED VALIDATION WITH ERROR TRACKING =====
console.log('\n🏢 Company Structure Validation:');
const companySchema = validation_1.Schema.object({
    name: validation_1.Schema.string().minLength(1),
    address: validation_1.Schema.object({
        street: validation_1.Schema.string().minLength(1),
        city: validation_1.Schema.string().minLength(1),
        state: validation_1.Schema.string().pattern(/^[A-Z]{2}$/),
        zipCode: validation_1.Schema.string().pattern(/^\d{5}(-\d{4})?$/),
        country: validation_1.Schema.string().pattern(/^[A-Z]{2}$/)
    }),
    departments: validation_1.Schema.array(validation_1.Schema.object({
        name: validation_1.Schema.string().minLength(1),
        head: validation_1.Schema.object({
            firstName: validation_1.Schema.string().minLength(1),
            lastName: validation_1.Schema.string().minLength(1),
            email: validation_1.Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        }),
        employees: validation_1.Schema.array(validation_1.Schema.object({
            id: validation_1.Schema.string().minLength(1),
            name: validation_1.Schema.string().minLength(1),
            position: validation_1.Schema.string().minLength(1),
            salary: validation_1.Schema.number().min(0).optional()
        })).optional()
    })).minLength(1)
});
const company = {
    name: 'Tech Corp',
    address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'US'
    },
    departments: [
        {
            name: 'Engineering',
            head: {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@techcorp.com'
            },
            employees: [
                {
                    id: 'EMP001',
                    name: 'John Doe',
                    position: 'Senior Developer',
                    salary: 120000
                }
            ]
        }
    ]
};
const companyResult = companySchema.validate(company);
console.log('Company validation:', companyResult.success ? '✅ Valid' : '❌ Invalid');
// ===== CONDITIONAL AND OPTIONAL VALIDATION =====
console.log('\n⚙️ Configuration Validation:');
const configSchema = validation_1.Schema.object({
    environment: validation_1.Schema.string().pattern(/^(development|staging|production)$/),
    database: validation_1.Schema.object({
        host: validation_1.Schema.string().minLength(1),
        port: validation_1.Schema.number().min(1).max(65535).integer(),
        username: validation_1.Schema.string().minLength(1),
        password: validation_1.Schema.string().minLength(8),
        ssl: validation_1.Schema.boolean().optional()
    }),
    cache: validation_1.Schema.object({
        enabled: validation_1.Schema.boolean(),
        ttl: validation_1.Schema.number().min(0).integer().optional(),
        provider: validation_1.Schema.string().pattern(/^(redis|memcached)$/).optional()
    }).optional(),
    logging: validation_1.Schema.object({
        level: validation_1.Schema.string().pattern(/^(debug|info|warn|error)$/),
        format: validation_1.Schema.string().pattern(/^(json|text)$/).optional()
    })
});
const config = {
    environment: 'production',
    database: {
        host: 'localhost',
        port: 5432,
        username: 'app_user',
        password: 'secure_password_123',
        ssl: true
    },
    cache: {
        enabled: true,
        ttl: 3600,
        provider: 'redis'
    },
    logging: {
        level: 'info',
        format: 'json'
    }
};
const configResult = configSchema.validate(config);
console.log('Configuration validation:', configResult.success ? '✅ Valid' : '❌ Invalid');
console.log('\n✨ Examples completed!');
//# sourceMappingURL=examples.js.map