const { Sequelize, DataTypes } = require('sequelize');
const { faker } = require('@faker-js/faker/locale/ru');
const path = require('path');
const fs = require('fs');
const sequelize = new Sequelize('postgresql://unwizau3i3bc3qftkf9u:nbkHOWX0RgNJysjxUV8zSOzngiA41d@bakxhg5dqczxkalyyqbw-postgresql.services.clever-cloud.com:50013/bakxhg5dqczxkalyyqbw', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
const Client = require('../models/Client')(sequelize, DataTypes);
const sampleImages = ['c1.jpg', 'c2.png', 'c3.jpg', 'c5.jpg', 'c6.jpg'];

async function fillClientsTable(count) {
    try {
        await sequelize.sync();
        for (let i = 0; i < count; i++) {
            const client = await Client.create({
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                middle_name: faker.person.middleName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                address: faker.location.streetAddress(),
                birth_date: faker.date.past({ years: 60 }),
                subscribed: faker.datatype.boolean(),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/clients', sampleImage);
            const destPath = path.join(__dirname, '../images/clients', sampleImage);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                await client.update({ photo: `/images/clients/${sampleImage}` });
            }

            console.log(`Клиент #${i + 1} успешно создан.`);
        }
        console.log(`${count} клиентов успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании клиента:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}
fillClientsTable(count);