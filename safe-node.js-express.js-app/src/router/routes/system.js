'use strict';

const axios = require('axios');
const Joi = require('joi');
const dns = require('dns').promises;
const { URL } = require('url');

module.exports = (app, db) => {

    // ===============================
    // Authentication middleware
    // ===============================
    const requireAuth = (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };

    // ===============================
    // GET /v1/status/:brand
    // FIX: Remove command execution (NO exec / shell)
    // ===============================
    app.get('/v1/status/:brand', requireAuth, async (req, res) => {

        const schema = Joi.object({
            brand: Joi.string().alphanum().min(2).max(30).required()
        });

        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({ error: 'Invalid brand name' });
        }

        try {
            // SAFE alternative: HTTP request instead of shell command
            const response = await axios.get(
                'https://letmegooglethat.com/',
                { params: { q: req.params.brand }, timeout: 3000 }
            );

            res.json({ status: response.status });
        } catch (err) {
            res.status(503).json({ error: 'Service unavailable' });
        }
    });

    // ===============================
    // GET /v1/redirect
    // FIX: Open Redirect via whitelist
    // ===============================
    app.get('/v1/redirect', requireAuth, (req, res) => {

        const allowedDomains = [
            'https://www.budweiser.com',
            'https://www.heineken.com',
            'https://www.coronausa.com'
        ];

        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!allowedDomains.includes(url)) {
            return res.status(403).json({ error: 'Redirect not allowed' });
        }

        res.redirect(url);
    });

    // ===============================
    // POST /v1/init
    // FIX: Remove insecure deserialization
    // ===============================
    app.post('/v1/init', requireAuth, (req, res) => {

        // Only accept structured JSON, NO deserialization
        const schema = Joi.object({
            beers: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    price: Joi.number().positive().required()
                })
            ).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: 'Invalid payload structure' });
        }

        // Example logic (safe)
        res.json({
            message: 'Beer list initialized safely',
            count: value.beers.length
        });
    });

    // ===============================
    // GET /v1/test
    // FIX: SSRF protection
    // ===============================
    app.get('/v1/test', requireAuth, async (req, res) => {

        const urlString = req.query.url;
        if (!urlString) {
            return res.status(400).json({ error: 'URL is required' });
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(urlString);
        } catch {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Allow only http/https
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(403).json({ error: 'Invalid protocol' });
        }

        // Resolve DNS and block internal IPs
        const addresses = await dns.lookup(parsedUrl.hostname, { all: true });
        for (const addr of addresses) {
            if (
                addr.address.startsWith('127.') ||
                addr.address.startsWith('10.') ||
                addr.address.startsWith('192.168.') ||
                addr.address === '::1'
            ) {
                return res.status(403).json({ error: 'SSRF attempt blocked' });
            }
        }

        try {
            const response = await axios.get(parsedUrl.toString(), {
                timeout: 3000,
                maxRedirects: 0
            });

            res.json({ status: response.status });
        } catch (err) {
            res.status(502).json({ error: 'Request failed' });
        }
    });
};
