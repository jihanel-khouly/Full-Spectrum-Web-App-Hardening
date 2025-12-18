'use strict';

const os = require('os');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const libxmljs = require('libxmljs');
const Joi = require('joi');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const fileType = require('file-type'); // For magic bytes check

module.exports = (app, db) => {

    // ===============================
    // Placeholder: Admin authentication middleware
    // ===============================
    const adminAuth = (req, res, next) => {
        // TODO: Replace with real authentication check
        const isAdmin = true; // Example: set to true only for authenticated admins
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });
        next();
    };

    // ===============================
    // Input validation schema
    // ===============================
    const beerSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        price: Joi.number().positive().required(),
        picture: Joi.string().uri().optional() // Validate as URI
    });

    // ===============================
    // Rate limiter for uploads (to prevent DoS)
    // ===============================
    const uploadLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // max 5 requests per minute
        message: { error: 'Too many upload requests, please try again later' }
    });

    // ===============================
    // Create new beer (secured)
    // ===============================
    app.post('/v1/admin/new-beer/', adminAuth, async (req, res) => {
        try {
            const { error, value } = beerSchema.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const new_beer = await db.beer.create({
                name: value.name,
                currency: 'USD',
                stock: 'plenty',
                price: value.price,
                picture: value.picture
            });

            res.json(new_beer);
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // ===============================
    // Secure Image Upload with magic bytes check
    // ===============================
    const uploadDir = path.join(__dirname, '../../uploads/');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const storageImage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const filename = crypto.randomBytes(16).toString('hex') + ext;
            cb(null, filename);
        }
    });

    const uploadImage = multer({
        storage: storageImage,
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
        fileFilter: async (req, file, cb) => {
            const allowedTypes = ['.jpg', '.jpeg', '.png'];
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedTypes.includes(ext)) return cb(new Error('Invalid file type'));

            // Magic bytes check
            const buffer = file.buffer || Buffer.from([]);
            const type = await fileType.fromBuffer(buffer);
            if (!type || !allowedTypes.includes(`.${type.ext}`)) return cb(new Error('Invalid file content'));

            cb(null, true);
        }
    });

    app.post('/v1/admin/upload-pic/', adminAuth, uploadLimiter, uploadImage.single('file'), (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        res.json({
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    });

    // ===============================
    // Secure XML upload
    // ===============================
    const uploadXML = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 1 * 1024 * 1024 } // 1MB
    });

    app.post('/v1/admin/new-beer-xml/', adminAuth, uploadLimiter, uploadXML.single('file'), async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No XML file provided' });

        try {
            const xml = req.file.buffer.toString();

            // XXE protection: disable external entities completely
            const doc = libxmljs.parseXml(xml, {
                noent: true,  // Do not resolve entities
                dtdload: false,
                dtdattr: false,
                doctype: false
            });

            const beerName = doc.get('//name')?.text();
            const beerPrice = Number(doc.get('//price')?.text());

            if (!beerName || !isFinite(beerPrice)) return res.status(400).json({ error: 'Invalid XML structure' });

            const new_beer = await db.beer.create({
                name: beerName,
                currency: 'USD',
                stock: 'plenty',
                price: beerPrice
            });

            res.json(new_beer);
        } catch (e) {
            res.status(400).json({ error: 'Invalid XML file' });
        }
    });

};
