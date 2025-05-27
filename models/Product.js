module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, comment: 'ID товара' },
        name: { type: DataTypes.STRING, allowNull: false, comment: 'Название товара' },
        manufacturer: { type: DataTypes.STRING, allowNull: false, comment: 'Производитель' },
        category: { type: DataTypes.STRING, allowNull: false, comment: 'Категория' },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, comment: 'Цена' },
        stock_quantity: { type: DataTypes.INTEGER, allowNull: false, comment: 'Количество на складе' },
        expiration_date: { type: DataTypes.DATEONLY, allowNull: true, comment: 'Дата окончания срока годности' },
        prescription_required: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'Требуется рецепт' },
        image: { type: DataTypes.STRING, allowNull: true, comment: 'Путь к изображению товара' }
    }, {
        tableName: 'products',
        timestamps: false
    });
    return Product;
};