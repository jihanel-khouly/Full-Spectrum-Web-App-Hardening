'use strict';

const path = require('path');

module.exports = (sequelize, DataTypes) => {
    const Beer = sequelize.define('beer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                is: /^[a-zA-Z0-9-_]+\.(jpg|jpeg|png)$/i // only allow safe filenames
            },
            set(value) {
                // sanitize input to prevent Path Traversal
                if (value) {
                    this.setDataValue('picture', path.basename(value));
                }
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2), // safer than FLOAT for money
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 0
            }
        },
        currency: {
            type: DataTypes.ENUM('USD', 'ILS', 'EUR'),
            allowNull: true
        },
        stock: {
            type: DataTypes.ENUM('plenty', 'little', 'out'),
            allowNull: true
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
        tableName: 'beers',
        timestamps: true
    });

    return Beer;
};
