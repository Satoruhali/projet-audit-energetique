const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Locataire = sequelize.define('locataires', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  telephone: {
    type: DataTypes.STRING(50)
  },
  date_inscription: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  token_acces: {
    type: DataTypes.STRING(64),
    allowNull: true,
    unique: true
  }
}, {
  timestamps: false,
  tableName: 'locataires'
});

module.exports = Locataire;
