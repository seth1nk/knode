const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Product } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../images', 'products');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-products', authRequired, (req, res) => {
    res.redirect('/products/index.html');
});

router.get('/api/products', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'name', 'manufacturer', 'category', 'price', 'stock_quantity', 'expiration_date', 'prescription_required', 'image'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedProducts = rows.map(item => ({
            id: item.id,
            name: item.name,
            manufacturer: item.manufacturer,
            category: item.category,
            price: item.price,
            stock_quantity: item.stock_quantity,
            expiration_date: item.expiration_date,
            prescription_required: item.prescription_required,
            image: item.image ? item.image.replace('/img/', '/images/') : null,
        }));

        res.json({
            products: formattedProducts,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-product/:id', authRequired, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            attributes: ['id', 'name', 'manufacturer', 'category', 'price', 'stock_quantity', 'expiration_date', 'prescription_required', 'image'],
        });
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        const formattedProduct = {
            id: product.id,
            name: product.name,
            manufacturer: product.manufacturer,
            category: product.category,
            price: product.price,
            stock_quantity: product.stock_quantity,
            expiration_date: product.expiration_date,
            prescription_required: product.prescription_required,
            image: product.image ? product.image.replace('/img/', '/images/') : null,
        };
        res.json(formattedProduct);
    } catch (error) {
        console.error('Ошибка при получении товара:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/products', authRequired, async (req, res) => {
    try {
        const { name, manufacturer, category, price, stock_quantity, expiration_date, prescription_required, image } = req.body;
        const product = await Product.create({
            name,
            manufacturer,
            category,
            price,
            stock_quantity,
            expiration_date,
            prescription_required,
            image: image ? image.replace('/img/', '/images/') : null,
        });
        const formattedProduct = {
            id: product.id,
            name: product.name,
            manufacturer: product.manufacturer,
            category: product.category,
            price: product.price,
            stock_quantity: product.stock_quantity,
            expiration_date: product.expiration_date,
            prescription_required: product.prescription_required,
            image: product.image,
        };
        res.status(201).json(formattedProduct);
    } catch (error) {
        console.error('Ошибка при создании товара:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-product', authRequired, upload.single('image'), async (req, res) => {
    let product;
    try {
        const requiredFields = ['name', 'manufacturer', 'category', 'price', 'stock_quantity'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { name, manufacturer, category, price, stock_quantity, expiration_date, prescription_required } = req.body;
        product = await Product.create({
            name: name.trim(),
            manufacturer: manufacturer.trim(),
            category: category.trim(),
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity),
            expiration_date: expiration_date || null,
            prescription_required: prescription_required === 'true',
            image: null
        });

        let imagePath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'products', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            imagePath = `/images/products/${req.file.originalname}`;
            await product.update({ image: imagePath });
        }

        res.redirect('/products/index.html');
    } catch (error) {
        console.error('Ошибка при создании товара:', error);
        if (product) await product.destroy();
        res.status(500).send(`Ошибка при создании товара: ${error.message}`);
    }
});

router.put('/api/products/:id', authRequired, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        const { name, manufacturer, category, price, stock_quantity, expiration_date, prescription_required, image } = req.body;
        await product.update({
            name,
            manufacturer,
            category,
            price,
            stock_quantity,
            expiration_date,
            prescription_required,
            image: image ? image.replace('/img/', '/images/') : null,
        });
        const formattedProduct = {
            id: product.id,
            name: product.name,
            manufacturer: product.manufacturer,
            category: product.category,
            price: product.price,
            stock_quantity: product.stock_quantity,
            expiration_date: product.expiration_date,
            prescription_required: product.prescription_required,
            image: product.image,
        };
        res.json(formattedProduct);
    } catch (error) {
        console.error('Ошибка при обновлении товара:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-product/:id', authRequired, upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        const { name, manufacturer, category, price, stock_quantity, expiration_date, prescription_required } = req.body;
        let imagePath = product.image;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../images', 'products', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            imagePath = `/images/products/${req.file.originalname}`;
        }
        await product.update({
            name: name.trim(),
            manufacturer: manufacturer.trim(),
            category: category.trim(),
            price: parseFloat(price),
            stock_quantity: parseInt(stock_quantity),
            expiration_date: expiration_date || null,
            prescription_required: prescription_required === 'true',
            image: imagePath,
        });
        res.redirect('/products/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении товара:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-product/:id', authRequired, async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        await product.destroy();
        res.json({ message: 'Товар удален' });
    } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;