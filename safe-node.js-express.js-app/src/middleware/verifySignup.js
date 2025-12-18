'use strict';

const db = require("./../orm");
const User = db.user;
const Joi = require('joi');

// ===============================
// Input validation schema
// ===============================
const signUpSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    roles: Joi.array().items(Joi.string().valid("admin", "user", "blocked")).optional()
});

// ===============================
// Check duplicate username or email
// ===============================
const checkDuplicateUsernameOrEmail = async (req, res, next) => {
    try {
        // Validate input first
        const { error, value } = signUpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: "Validation error", details: error.details });
        }

        const { username, email } = value;

        // Check username
        const userByUsername = await User.findOne({ where: { username } });
        if (userByUsername) {
            return res.status(400).json({ message: "Failed! Username is already in use!" });
        }

        // Check email
        const userByEmail = await User.findOne({ where: { email } });
        if (userByEmail) {
            return res.status(400).json({ message: "Failed! Email is already in use!" });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

// ===============================
// Check roles exist
// ===============================
const checkRolesExisted = (req, res, next) => {
    const roles = req.body.roles;

    if (!roles) {
        return next(); // no roles provided, ok
    }

    if (!Array.isArray(roles)) {
        return res.status(400).json({ message: "Roles must be an array of strings" });
    }

    for (const role of roles) {
        if (!["admin", "user", "blocked"].includes(role)) {
            return res.status(400).json({ message: "Invalid role provided" });
        }
    }

    next();
};

// ===============================
// Export
// ===============================
const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};

module.exports = verifySignUp;
