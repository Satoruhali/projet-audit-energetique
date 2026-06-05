const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TypePlancher = sequelize.define('types_plancher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  categorie: {
    type: DataTypes.ENUM('bas', 'haut'),
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: false,
  tableName: 'types_plancher'
});

module.exports = TypePlancher;
