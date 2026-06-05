const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Typologie = sequelize.define('typologies', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(3),
    allowNull: false,
    unique: true
  },
  nb_pieces: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  surface_min_m2: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  surface_max_m2: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'typologies'
});

module.exports = Typologie;
