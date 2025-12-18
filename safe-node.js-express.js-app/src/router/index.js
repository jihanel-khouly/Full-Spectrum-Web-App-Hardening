'use strict';

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

const routes = [
    require('./routes/order'),
    require('./routes/user'),
    require('./routes/system'),
    require('./routes/admin'),
    require('./routes/frontend')
];

// ===============================
// Global Auth Middleware (Example)
// ===============================
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// ===============================
// Central Router Initializer
// ===============================
module.exports = function router(app, db) {

    // ===============================
    // Global Security Middlewares
    // ===============================
    app.use(helmet());

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        standardHeaders: true,
        legacyHeaders: false
    }));

    // CSRF (only for state‑changing routes)
    const csrfProtection = csrf({ cookie: true });
    app.use(['/v1', '/admin'], csrfProtection);

    // ===============================
    // API Namespace Protection
    // ===============================
    app.use('/v1', requireAuth);

    // ===============================
    // Load Routes Safely
    // ===============================
    routes.forEach((route) => {
        if (typeof route !== 'function') {
            throw new Error('Invalid route module detected');
        }
        route(app, db);
    });

    // ===============================
    // Central Error Handler
    // ===============================
    app.use((err, req, res, next) => {
        console.error(err.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    });
};
