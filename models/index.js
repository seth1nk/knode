const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresql://unwizau3i3bc3qftkf9u:nbkHOWX0RgNJysjxUV8zSOzngiA41d@bakxhg5dqczxkalyyqbw-postgresql.services.clever-cloud.com:50013/bakxhg5dqczxkalyyqbw', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        timestamps: true,
        underscored: true,
    }
});

const User = require('./User')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const Client = require('./Client')(sequelize, DataTypes);

sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized with database'))
    .catch(err => console.error('Error synchronizing models:', err));

module.exports = {
    sequelize,
    User,
    Product,
    Client
};