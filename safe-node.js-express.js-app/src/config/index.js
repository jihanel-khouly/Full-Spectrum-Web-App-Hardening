'use strict';

const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

// ===============================
// Load environment variables safely
// ===============================
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// ===============================
// Validate critical environment vars
// ===============================
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error(' JWT_SECRET is required in production environment');
}

// ===============================
// Secure DB path
// ===============================
const dbPath = path.join(__dirname, '../../db', 'db.sqlite');

// ===============================
// Generate strong fallback secret (DEV only)
// ===============================
const generateDevSecret = () =>
    crypto.randomBytes(64).toString('hex');

// ===============================
// Export secure config
// ===============================
const config = Object.freeze({
    PORT: Number(process.env.APP_PORT) || 5000,

    // JWT Secret (NO bitwise ops, strong default)
    jwtSecret:
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV !== 'production'
            ? generateDevSecret()
            : undefined),

    // Database configuration
    DATABASE_USERNAME: process.env.DATABASE_USERNAME || undefined,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || undefined,
    DATABASE: process.env.DATABASE || 'db.sqlite',
    DATABASE_DIALECT: process.env.DATABASE_DIALECT || 'sqlite',
    DATABASE_STORAGE: process.env.DATABASE_STORAGE || dbPath
});

module.exports = config;
