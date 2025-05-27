module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, comment: 'ID клиента' },
        first_name: { type: DataTypes.STRING, allowNull: false, comment: 'Имя' },
        last_name: { type: DataTypes.STRING, allowNull: false, comment: 'Фамилия' },
        middle_name: { type: DataTypes.STRING, allowNull: true, comment: 'Отчество' },
        email: { type: DataTypes.STRING, allowNull: false, unique: true, comment: 'Email' },
        phone: { type: DataTypes.STRING, allowNull: true, comment: 'Телефон' },
        address: { type: DataTypes.STRING, allowNull: true, comment: 'Адрес' },
        birth_date: { type: DataTypes.DATEONLY, allowNull: true, comment: 'Дата рождения' },
        subscribed: { type: DataTypes.BOOLEAN, defaultValue: false, comment: 'Подписан на рассылку' },
        photo: { type: DataTypes.STRING, allowNull: true, comment: 'Путь к фото клиента' }
    }, {
        tableName: 'clients',
        timestamps: false
    });
    return Client;
};