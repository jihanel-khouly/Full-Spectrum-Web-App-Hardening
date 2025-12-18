'use strict';

const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

module.exports = (app, db) => {

    // ===============================
    // Simple authentication middleware
    // ===============================
    const requireAuth = (req, res, next) => {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };

    // ===============================
    // GET /v1/order (FIXED)
    // - Fix Excessive Data Exposure
    // - Return only required fields
    // ===============================
    app.get('/v1/order', requireAuth, async (req, res) => {
        try {
            const beers = await db.beer.findAll({
                attributes: ['id', 'name', 'price', 'currency'],
                include: [{
                    model: db.user,
                    attributes: ['id', 'name'] // no email, no password, no PII
                }]
            });

            res.json(beers);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // ===============================
    // GET /v1/beer-pic (FIXED)
    // - Prevent Path Traversal
    // - Allow only whitelisted files
    // ===============================
    app.get('/v1/beer-pic', requireAuth, (req, res) => {
        const filename = req.query.picture;

        if (!filename) {
            return res.status(400).json({ error: 'Picture parameter is required' });
        }

        // Allow only image extensions
        const allowedExt = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(filename).toLowerCase();
        if (!allowedExt.includes(ext)) {
            return res.status(400).json({ error: 'Invalid file type' });
        }

        const uploadDir = path.resolve(__dirname, '../../../uploads');
        const safePath = path.join(uploadDir, path.basename(filename));

        // Ensure path is inside uploads directory
        if (!safePath.startsWith(uploadDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        fs.readFile(safePath, (err, data) => {
            if (err) {
                return res.status(404).json({ error: 'File not found' });
            }

            res.type(ext);
            res.send(data);
        });
    });

    // ===============================
    // GET /v1/search/:filter/:query (FIXED)
    // - Prevent SQL Injection
    // - Use ORM safely
    // ===============================
    app.get('/v1/search/:filter/:query', requireAuth, async (req, res) => {

        const allowedFilters = ['id', 'name', 'price'];
        const { filter, query } = req.params;

        if (!allowedFilters.includes(filter)) {
            return res.status(400).json({ error: 'Invalid filter' });
        }

        try {
            const beers = await db.beer.findAll({
                where: {
                    [filter]: query
                },
                attributes: ['id', 'name', 'price', 'currency']
            });

            res.json(beers);
        } catch (err) {
            res.status(500).json({ error: 'Search failed' });
        }
    });

};
