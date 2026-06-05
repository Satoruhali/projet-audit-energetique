const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JoursDisponible = sequelize.define('jours_disponibles', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_entrepreneur: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  est_disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: false,
  tableName: 'jours_disponibles',
  indexes: [
    {
      unique: true,
      fields: ['id_entrepreneur', 'date']
    }
  ]
});

module.exports = JoursDisponible;
