'use strict';

const axios = require('axios');
const Joi = require('joi');
const dns = require('dns').promises;
const { URL } = require('url');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');

module.exports = (app, db) => {

    // ===============================
    // Global Security Middlewares
    // ===============================
    app.use(helmet());

    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests, please try again later'
    }));

    app.use(require('express').json({ limit: '50kb' }));

    const csrfProtection = csrf({ cookie: true });

    // ===============================
    // Authentication & Authorization
    // ===============================
    const requireAuth = (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };

    const requireAdmin = (req, res, next) => {
        if (req.session.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };

    // ===============================
    // GET /v1/status/:brand
    // SAFE: No shell execution
    // ===============================
    app.get('/v1/status/:brand', requireAuth, csrfProtection, async (req, res) => {

        const schema = Joi.object({
            brand: Joi.string().alphanum().min(2).max(30).required()
        });

        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({ error: 'Invalid brand name' });
        }

        try {
            const response = await axios.get(
                'https://letmegooglethat.com/',
                {
                    params: { q: req.params.brand },
                    timeout: 3000,
                    maxContentLength: 10 * 1024
                }
            );

            res.json({ status: response.status });

        } catch {
            res.status(503).json({ error: 'External service unavailable' });
        }
    });

    // ===============================
    // GET /v1/redirect
    // SAFE: Strict allow‑list redirect
    // ===============================
    app.get('/v1/redirect', requireAuth, csrfProtection, (req, res) => {

        const allowedHosts = [
            'www.budweiser.com',
            'www.heineken.com',
            'www.coronausa.com'
        ];

        try {
            const target = new URL(req.query.url);

            if (!['https:'].includes(target.protocol)) {
                return res.status(403).json({ error: 'Invalid protocol' });
            }

            if (!allowedHosts.includes(target.hostname)) {
                return res.status(403).json({ error: 'Redirect not allowed' });
            }

            res.redirect(target.toString());

        } catch {
            res.status(400).json({ error: 'Invalid URL' });
        }
    });

    // ===============================
    // POST /v1/init
    // SAFE: No deserialization
    // ===============================
    app.post('/v1/init', requireAuth, requireAdmin, csrfProtection, (req, res) => {

        const schema = Joi.object({
            beers: Joi.array().max(50).items(
                Joi.object({
                    name: Joi.string().max(50).required(),
                    price: Joi.number().positive().required()
                })
            ).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        res.json({
            message: 'Initialization completed securely',
            count: value.beers.length
        });
    });

    // ===============================
    // GET /v1/test
    // SAFE: Full SSRF protection
    // ===============================
    app.get('/v1/test', requireAuth, csrfProtection, async (req, res) => {

        let parsedUrl;
        try {
            parsedUrl = new URL(req.query.url);
        } catch {
            return res.status(400).json({ error: 'Invalid URL' });
        }

        // Allow only HTTP/S
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(403).json({ error: 'Protocol not allowed' });
        }

        // DNS resolution
        const addresses = await dns.lookup(parsedUrl.hostname, { all: true });

        const blockedRanges = [
            /^127\./,
            /^10\./,
            /^192\.168\./,
            /^172\.(1[6-9]|2\d|3[0-1])\./,
            /^0\./,
            /^169\.254\./,
            /^::1$/,
            /^fc00:/,
            /^fe80:/
        ];

        for (const addr of addresses) {
            if (blockedRanges.some(rx => rx.test(addr.address))) {
                return res.status(403).json({ error: 'SSRF blocked' });
            }
        }

        try {
            const response = await axios.get(parsedUrl.toString(), {
                timeout: 3000,
                maxRedirects: 0,
                maxContentLength: 20 * 1024
            });

            res.json({ status: response.status });

        } catch {
            res.status(502).json({ error: 'Request failed' });
        }
    });

};
