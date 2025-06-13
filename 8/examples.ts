/**
 * Examples demonstrating the usage of the validation library
 */

import { Schema } from './validation';

console.log('📚 Validation Library Examples\n');

// ===== BASIC USAGE EXAMPLES =====

console.log('🔤 Basic String Validation:');
const nameValidator = Schema.string().minLength(2).maxLength(50);
const nameResult = nameValidator.validate('John Doe');
console.log('Valid name result:', nameResult);

const shortNameResult = nameValidator.validate('J');
console.log('Invalid name result:', shortNameResult);

console.log('\n📧 Email Validation:');
const emailValidator = Schema.string()
  .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  .withMessage('Please provide a valid email address');

const emailResult = emailValidator.validate('john@example.com');
console.log('Valid email:', emailResult);

const invalidEmailResult = emailValidator.validate('not-an-email');
console.log('Invalid email:', invalidEmailResult);

console.log('\n🔢 Number Validation:');
const ageValidator = Schema.number()
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
const userProfileSchema = Schema.object({
  id: Schema.string().minLength(1).withMessage('User ID is required'),
  username: Schema.string()
    .minLength(3)
    .maxLength(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 characters, alphanumeric and underscores only'),
  email: Schema.string()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .withMessage('Invalid email format'),
  age: Schema.number()
    .min(13)
    .max(120)
    .integer()
    .optional(),
  isActive: Schema.boolean(),
  preferences: Schema.object({
    theme: Schema.string().pattern(/^(light|dark)$/),
    notifications: Schema.boolean()
  }).optional(),
  tags: Schema.array(Schema.string()).minLength(1).maxLength(10)
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
  id: '',  // Empty ID
  username: 'jo',  // Too short
  email: 'invalid-email',  // Invalid format
  age: 12,  // Too young
  isActive: 'yes',  // Wrong type
  tags: []  // Empty array
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
const productSchema = Schema.object({
  id: Schema.string().pattern(/^PROD_\d+$/).withMessage('Product ID must start with PROD_ followed by numbers'),
  name: Schema.string().minLength(1).maxLength(100),
  description: Schema.string().minLength(10).maxLength(1000).optional(),
  price: Schema.number().min(0).withMessage('Price must be non-negative'),
  category: Schema.string().pattern(/^(electronics|clothing|books|home|sports)$/),
  inStock: Schema.boolean(),
  variants: Schema.array(
    Schema.object({
      size: Schema.string().optional(),
      color: Schema.string().optional(),
      sku: Schema.string().minLength(1),
      additionalPrice: Schema.number().min(0).optional()
    })
  ).minLength(1).withMessage('At least one variant is required'),
  tags: Schema.array(Schema.string()).maxLength(20).optional(),
  releaseDate: Schema.date().optional()
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
const createPostSchema = Schema.object({
  title: Schema.string().minLength(1).maxLength(200),
  content: Schema.string().minLength(10).maxLength(5000),
  authorId: Schema.string().pattern(/^[0-9a-f]{24}$/).withMessage('Invalid author ID format'),
  tags: Schema.array(Schema.string()).maxLength(10).optional(),
  publishAt: Schema.date().after(new Date()).optional(),
  isPublic: Schema.boolean(),
  metadata: Schema.object({
    source: Schema.string().optional(),
    priority: Schema.number().min(1).max(5).integer().optional()
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
const companySchema = Schema.object({
  name: Schema.string().minLength(1),
  address: Schema.object({
    street: Schema.string().minLength(1),
    city: Schema.string().minLength(1),
    state: Schema.string().pattern(/^[A-Z]{2}$/),
    zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
    country: Schema.string().pattern(/^[A-Z]{2}$/)
  }),
  departments: Schema.array(
    Schema.object({
      name: Schema.string().minLength(1),
      head: Schema.object({
        firstName: Schema.string().minLength(1),
        lastName: Schema.string().minLength(1),
        email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      }),
      employees: Schema.array(
        Schema.object({
          id: Schema.string().minLength(1),
          name: Schema.string().minLength(1),
          position: Schema.string().minLength(1),
          salary: Schema.number().min(0).optional()
        })
      ).optional()
    })
  ).minLength(1)
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
const configSchema = Schema.object({
  environment: Schema.string().pattern(/^(development|staging|production)$/),
  database: Schema.object({
    host: Schema.string().minLength(1),
    port: Schema.number().min(1).max(65535).integer(),
    username: Schema.string().minLength(1),
    password: Schema.string().minLength(8),
    ssl: Schema.boolean().optional()
  }),
  cache: Schema.object({
    enabled: Schema.boolean(),
    ttl: Schema.number().min(0).integer().optional(),
    provider: Schema.string().pattern(/^(redis|memcached)$/).optional()
  }).optional(),
  logging: Schema.object({
    level: Schema.string().pattern(/^(debug|info|warn|error)$/),
    format: Schema.string().pattern(/^(json|text)$/).optional()
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