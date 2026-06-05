const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing';

let sequelize;

if (isTest) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'audit_energetique',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: process.env.DB_LOG === 'true' ? console.log : false,
      define: {
        freezeTableName: true,
        underscored: true
      }
    }
  );
}

module.exports = sequelize;
