const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailEnvoye = sequelize.define('emails_envoyes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_locataire: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_campagne: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('visite_programmee', 'pas_de_visite', 'relance', 'invitation_visite', 'rappel_visite', 'non_visite', 'relance_generique'),
    allowNull: false
  },
  date_envoi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  statut: {
    type: DataTypes.ENUM('envoye', 'echoue', 'echec', 'ouvert', 'clique'),
    defaultValue: 'envoye'
  },
  destinataire: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sujet: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  corps: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  erreur: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'emails_envoyes'
});

module.exports = EmailEnvoye;
