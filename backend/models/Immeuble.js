const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Immeuble = sequelize.define('immeubles', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  adresse: {
    type: DataTypes.TEXT
  },
  nb_etages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  id_entrepreneur: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  typologie: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  annee_construction: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  plancher_bas: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  plancher_haut: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  surface_totale: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'immeubles'
});

module.exports = Immeuble;
