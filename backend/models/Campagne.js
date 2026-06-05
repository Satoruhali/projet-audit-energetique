const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campagne = sequelize.define('campagnes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  batiment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date_debut_possible: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_fin_possible: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('brouillon', 'ouverte', 'planification_terminee', 'termine'),
    defaultValue: 'brouillon'
  },
  nb_min_visites: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  pct_min_visites: {
    type: DataTypes.FLOAT,
    defaultValue: 50.00
  },
  selection: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('selection');
      return raw ? JSON.parse(raw) : null;
    },
    set(value) {
      this.setDataValue('selection', JSON.stringify(value));
    }
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'campagnes',
  defaultScope: {
    where: { deleted_at: null }
  },
  scopes: {
    withDeleted: { where: {} }
  }
});

module.exports = Campagne;
