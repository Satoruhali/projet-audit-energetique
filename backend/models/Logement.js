const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Logement = sequelize.define('logements', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  batiment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numero: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  etage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  locataire_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_typologie: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_type_plancher_bas: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_type_plancher_haut: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  position: {
    type: DataTypes.ENUM('rez_de_chaussee', 'intermediaire', 'dernier_etage'),
    allowNull: true
  },
  selectionne_visite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  surface: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  loyer_estime: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  statut: {
    type: DataTypes.ENUM('libre', 'occupe', 'reserve'),
    defaultValue: 'libre'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'logements',
  defaultScope: {
    where: { deleted_at: null }
  },
  scopes: {
    withDeleted: { where: {} }
  }
});

module.exports = Logement;
