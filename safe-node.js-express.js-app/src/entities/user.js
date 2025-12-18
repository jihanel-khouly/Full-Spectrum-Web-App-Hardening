'use strict';

const path = require('path');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        profile_pic: {
            type: DataTypes.STRING,
            allowNull: true,
            set(value) {
                if (value) {
                    // sanitize input to prevent Path Traversal
                    this.setDataValue('profile_pic', path.basename(value));
                }
            },
            validate: {
                is: /^[a-zA-Z0-9-_]+\.(jpg|jpeg|png)$/i // only allow safe filenames
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                if (value) {
                    const salt = bcrypt.genSaltSync(12);
                    const hashed = bcrypt.hashSync(value, salt);
                    this.setDataValue('password', hashed);
                }
            }
        },
        role: {
            type: DataTypes.ENUM('admin', 'user', 'blocked'),
            allowNull: false,
            defaultValue: 'user'
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 255] // prevent excessively long input
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 100] // prevent excessively long input
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.fn('NOW'),
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE
        },
        deleted_at: {
            type: DataTypes.DATE
        }
    }, {
        paranoid: true,      // enable soft deletes
        underscored: true,   // use snake_case in DB
        tableName: 'users',
        timestamps: true
    });

    // Instance method to verify password
    User.prototype.verifyPassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};
