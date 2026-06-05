const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Creneau = sequelize.define('creneaux', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_logement: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_campagne: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_jour_disponible: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date_visite: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  heure_debut: {
    type: DataTypes.TIME,
    allowNull: false
  },
  heure_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  ordre_visite: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('propose', 'reserve', 'confirme', 'effectue', 'annule'),
    defaultValue: 'propose'
  }
}, {
  timestamps: false,
  tableName: 'creneaux',
  indexes: [
    {
      unique: true,
      fields: ['id_campagne', 'id_logement']
    },
    {
      unique: true,
      fields: ['id_campagne', 'date_visite', 'heure_debut']
    }
  ]
});

module.exports = Creneau;
