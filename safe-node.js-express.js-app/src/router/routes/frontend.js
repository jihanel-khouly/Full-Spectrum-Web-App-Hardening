'use strict';

const nunjucks = require('nunjucks');
const escapeHtml = require('escape-html');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

module.exports = (app, db) => {

    // ===============================
    // Nunjucks configuration (secure)
    // ===============================
    nunjucks.configure('views', {
        autoescape: true,
        express: app
    });

    // ===============================
    // Input validation schemas
    // ===============================
    const registerSchema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        address: Joi.string().max(100).optional()
    });

    const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    // ===============================
    // Rate limiter
    // ===============================
    const authLimiter = rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 5, // max 5 requests per minute
        message: { error: 'Too many requests, try again later' }
    });

    // ===============================
    // Front End entry page
    // ===============================
    app.get('/', (req, res) => {
        const message = req.query.message ? escapeHtml(req.query.message) : "Please log in to continue";
        res.render('user.html', { message });
    });

    // ===============================
    // Front End register page
    // ===============================
    app.get('/register', (req, res) => {
        const message = req.query.message ? escapeHtml(req.query.message) : "Please register to continue";
        res.render('user-register.html', { message });
    });

    // ===============================
    // Register (POST)
    // ===============================
    app.post('/register', authLimiter, async (req, res) => {
        try {
            const { error, value } = registerSchema.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            // Hash password securely
            const hashedPassword = await bcrypt.hash(value.password, 12);

            const newUser = await db.user.create({
                name: value.name,
                email: value.email,
                role: 'user',
                address: value.address,
                password: hashedPassword
            });

            // Set session
            req.session.regenerate(err => {
                if (err) return res.status(500).json({ error: 'Session error' });
                req.session.userId = newUser.id;
                req.session.logged = true;
                res.json({ message: 'Registration successful', userId: newUser.id });
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error registering, please try again' });
        }
    });

    // ===============================
    // Login (POST)
    // ===============================
    app.post('/login', authLimiter, async (req, res) => {
        try {
            const { error, value } = loginSchema.validate(req.body);
            if (error) return res.status(400).json({ error: error.details[0].message });

            const user = await db.user.findOne({ where: { email: value.email } });
            if (!user) return res.status(400).json({ error: 'Invalid email or password' });

            const match = await bcrypt.compare(value.password, user.password);
            if (!match) return res.status(400).json({ error: 'Invalid email or password' });

            req.session.regenerate(err => {
                if (err) return res.status(500).json({ error: 'Session error' });
                req.session.userId = user.id;
                req.session.logged = true;
                res.json({ message: 'Login successful', userId: user.id });
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Login failed, try again' });
        }
    });

    // ===============================
    // Profile page (protected)
    // ===============================
    app.get('/profile', async (req, res) => {
        if (!req.session.logged) return res.status(403).json({ error: 'Unauthorized' });
        const userId = req.session.userId;

        const user = await db.user.findOne({
            include: ['beers'],
            where: { id: userId }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const beers = await db.beer.findAll();
        res.render('profile.html', { user, beers });
    });

    // ===============================
    // Beer page
    // ===============================
    app.get('/beer', async (req, res) => {
        if (!req.session.logged) return res.status(403).json({ error: 'Unauthorized' });

        const beer = await db.beer.findOne({
            include: ['users'],
            where: { id: req.query.id }
        });

        if (!beer) return res.status(404).json({ error: 'Beer not found' });

        const user = await db.user.findByPk(req.session.userId);
        const lovesBeer = await user.hasBeer(beer);

        const loveMessage = req.query.relationship ? escapeHtml(req.query.relationship)
            : lovesBeer ? "You Love THIS BEER!!" : "...";

        res.render('beer.html', { beers: [beer], message: loveMessage, user });
    });

};
