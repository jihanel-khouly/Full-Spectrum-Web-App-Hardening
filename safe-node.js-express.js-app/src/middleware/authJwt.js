'use strict';

const jwt = require("jsonwebtoken");
const config = require("./../config");
const db = require("./../orm");
const User = db.user;

// ===============================
// Verify JWT token middleware
// ===============================
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(403).json({ message: "No token provided!" });
        }

        // Authorization header format: "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(400).json({ message: "Invalid token format!" });
        }

        const token = parts[1];

        // Verify token with secret
        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.id;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized!", error: err.message });
    }
};

// ===============================
// Check if user has admin role
// ===============================
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const roles = await user.getRoles(); // assuming a roles association exists
        const isAdmin = roles.some(role => role.name === "admin");

        if (!isAdmin) {
            return res.status(403).json({ message: "Require Admin Role!" });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ===============================
// Check if user has moderator role
// ===============================
const isModerator = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const roles = await user.getRoles();
        const isMod = roles.some(role => role.name === "moderator");

        if (!isMod) {
            return res.status(403).json({ message: "Require Moderator Role!" });
        }

        next();
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isModerator
};
