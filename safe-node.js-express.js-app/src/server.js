'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session);
const expressNunjucks = require('express-nunjucks');
const formidableMiddleware = require('express-formidable');

const config = require('./config');
const router = require('./router');
const db = require('./orm');

const app = express();
const PORT = config.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';


// ===============================
// Security Headers
// ===============================
app.use(helmet());

// ===============================
// CORS (Restricted)
// ===============================
app.use(cors({
    origin: ['https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// ===============================
// Rate Limiting (Anti‑Bruteforce)
// ===============================
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// ===============================
// Body Parsing Protection
// ===============================
app.use(bodyParser.json({ limit: '50kb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '50kb' }));

// ===============================
// Session Store (Secure)
// ===============================
const sessionStore = new SequelizeStore({
    db: db.sequelize
});

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
    name: 'sessionID',
    secret: process.env.SESSION_SECRET || 'CHANGE_ME_NOW',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 2 * 24 * 60 * 60 * 1000 // 2 days
    }
}));

sessionStore.sync();

// ===============================
// Templating Engine (Safe)
// ===============================
app.set('views', __dirname + '/templates');
expressNunjucks(app, {
    watch: !isProd,
    noCache: !isProd,
    autoescape: true
});

// ===============================
// Static Files (Restricted)
// ===============================
app.use('/public', express.static('src/public', {
    dotfiles: 'ignore',
    index: false,
    maxAge: isProd ? '7d' : 0
}));

// ===============================
// File Upload Protection
// ===============================
app.use(formidableMiddleware({
    maxFileSize: 2 * 1024 * 1024,
    multiples: false
}));

// ===============================
// Routes
// ===============================
router(app, db);

// ===============================
// Swagger (Dev Only)
// ===============================
if (!isProd) {
    const expressJSDocSwagger = require('express-jsdoc-swagger');
    expressJSDocSwagger(app)({
        info: {
            version: '1.0.0',
            title: 'Secure Beer API'
        },
        baseDir: __dirname,
        filesPattern: ['./routes/**/*.js'],
        swaggerUIPath: '/api-docs',
        exposeSwaggerUI: true,
        exposeApiDocs: false
    });
}

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

// ===============================
// Database Sync (Safe)
// ===============================
if (!isProd) {
    db.sequelize.sync({ alter: true }).then(startServer);
} else {
    db.sequelize.sync().then(startServer);
}

function startServer() {
    app.listen(PORT, () => {
        console.log(`Secure server running on port ${PORT}`);
    });
}
