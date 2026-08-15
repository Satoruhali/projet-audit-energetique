const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

const Entrepreneur = sequelize.define('entrepreneurs', {
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
  mot_de_passe_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'mot_de_passe_hash'
  },
  telephone: {
    type: DataTypes.STRING(50)
  },
  nom_entreprise: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'entrepreneurs',
  hooks: {
    beforeCreate: async (entrepreneur) => {
      if (entrepreneur.mot_de_passe_hash) {
        entrepreneur.mot_de_passe_hash = await bcrypt.hash(entrepreneur.mot_de_passe_hash, 10);
      }
    },
    beforeUpdate: async (entrepreneur) => {
      if (entrepreneur.changed('mot_de_passe_hash')) {
        entrepreneur.mot_de_passe_hash = await bcrypt.hash(entrepreneur.mot_de_passe_hash, 10);
      }
    }
  }
});

Entrepreneur.prototype.comparerMotDePasse = async function (motDePasse) {
  return bcrypt.compare(motDePasse, this.mot_de_passe_hash);
};

Entrepreneur.prototype.genererToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = Entrepreneur;
