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
const Product = require('../models/Product')(sequelize, DataTypes);
const sampleImages = ['p1.jpg', 'p2.png', 'p3.jpg'];

async function fillProductsTable(count) {
    try {
        await sequelize.sync();
        const categories = ['таблетки', 'сиропы', 'инъекции', 'мазь', 'капли'];
        const manufacturers = ['Фармстандарт', 'Байер', 'Пфайзер', 'Новартис', 'Рош'];

        for (let i = 0; i < count; i++) {
            const product = await Product.create({
                name: faker.commerce.productName(),
                manufacturer: faker.helpers.arrayElement(manufacturers),
                category: faker.helpers.arrayElement(categories),
                price: faker.number.float({ min: 50, max: 5000, precision: 0.01 }),
                stock_quantity: faker.number.int({ min: 1, max: 1000 }),
                expiration_date: faker.date.future(),
                prescription_required: faker.datatype.boolean(),
                image: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/products', sampleImage);
            const destPath = path.join(__dirname, '../images/products', sampleImage);

            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, destPath);
                await product.update({ image: `/images/products/${sampleImage}` });
            }

            console.log(`Товар #${i + 1} успешно создан.`);
        }
        console.log(`${count} товаров успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании товара:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}
fillProductsTable(count);