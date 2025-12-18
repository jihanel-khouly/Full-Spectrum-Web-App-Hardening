'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// ===============================
// Validate required environment variables
// ===============================
if (!config.DATABASE_DIALECT) {
  throw new Error('DATABASE_DIALECT is not defined');
}

// ===============================
// Secure Sequelize initialization
// ===============================
const sequelize = new Sequelize(
  config.DATABASE,
  config.DATABASE_USERNAME,
  config.DATABASE_PASSWORD,
  {
    dialect: config.DATABASE_DIALECT,
    storage: config.DATABASE_DIALECT === 'sqlite'
      ? config.DATABASE_STORAGE
      : undefined,

    logging: false, // ❌ Disable SQL query logging (avoid sensitive data leaks)

    define: {
      underscored: true,
      freezeTableName: true
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// ===============================
// Database object
// ===============================
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ===============================
// Roles (immutable)
// ===============================
db.ROLES = Object.freeze(['user', 'admin', 'blocked']);

// ===============================
// Load models (SAFE explicit loading)
// ===============================
db.beer = require('../entities/beer')(sequelize, DataTypes);
db.user = require('../entities/user')(sequelize, DataTypes);

// ===============================
// Associations
// ===============================
db.user.belongsToMany(db.beer, {
  through: 'beer_users',
  foreignKey: 'user_id',
  otherKey: 'beer_id'
});

db.beer.belongsToMany(db.user, {
  through: 'beer_users',
  foreignKey: 'beer_id',
  otherKey: 'user_id'
});

// ===============================
// Test DB connection (fail fast)
// ===============================
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established securely.');
  } catch (err) {
    console.error(' Unable to connect to the database:', err.message);
    process.exit(1);
  }
})();

module.exports = db;
