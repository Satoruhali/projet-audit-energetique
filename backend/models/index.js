const sequelize = require('../config/database');
const Entrepreneur = require('./Entrepreneur');
const Immeuble = require('./Immeuble');
const Typologie = require('./Typologie');
const TypePlancher = require('./TypePlancher');
const Logement = require('./Logement');
const Locataire = require('./Locataire');
const Campagne = require('./Campagne');
const JoursDisponible = require('./JoursDisponible');
const Creneau = require('./Creneau');
const EmailEnvoye = require('./EmailEnvoye');

Entrepreneur.hasMany(Immeuble, { foreignKey: 'id_entrepreneur', onDelete: 'CASCADE' });
Immeuble.belongsTo(Entrepreneur, { foreignKey: 'id_entrepreneur' });

Immeuble.hasMany(Logement, { foreignKey: 'batiment_id', onDelete: 'CASCADE' });
Logement.belongsTo(Immeuble, { foreignKey: 'batiment_id' });

Immeuble.hasMany(Campagne, { foreignKey: 'batiment_id', onDelete: 'CASCADE' });
Campagne.belongsTo(Immeuble, { foreignKey: 'batiment_id' });

Typologie.hasMany(Logement, { foreignKey: 'id_typologie', onDelete: 'CASCADE' });
Logement.belongsTo(Typologie, { foreignKey: 'id_typologie' });

TypePlancher.hasMany(Logement, { as: 'planchersBas', foreignKey: 'id_type_plancher_bas', onDelete: 'CASCADE' });
Logement.belongsTo(TypePlancher, { as: 'plancherBas', foreignKey: 'id_type_plancher_bas' });

TypePlancher.hasMany(Logement, { as: 'planchersHaut', foreignKey: 'id_type_plancher_haut', onDelete: 'CASCADE' });
Logement.belongsTo(TypePlancher, { as: 'plancherHaut', foreignKey: 'id_type_plancher_haut' });

Locataire.hasMany(Logement, { foreignKey: 'locataire_id', onDelete: 'CASCADE' });
Logement.belongsTo(Locataire, { foreignKey: 'locataire_id' });

Campagne.hasMany(Creneau, { foreignKey: 'id_campagne', onDelete: 'CASCADE' });
Creneau.belongsTo(Campagne, { foreignKey: 'id_campagne' });

Logement.hasMany(Creneau, { foreignKey: 'id_logement', onDelete: 'CASCADE' });
Creneau.belongsTo(Logement, { foreignKey: 'id_logement' });

Entrepreneur.hasMany(JoursDisponible, { foreignKey: 'id_entrepreneur', onDelete: 'CASCADE' });
JoursDisponible.belongsTo(Entrepreneur, { foreignKey: 'id_entrepreneur' });

Locataire.hasMany(EmailEnvoye, { foreignKey: 'id_locataire', onDelete: 'CASCADE' });
EmailEnvoye.belongsTo(Locataire, { foreignKey: 'id_locataire' });

Campagne.hasMany(EmailEnvoye, { foreignKey: 'id_campagne', onDelete: 'CASCADE' });
EmailEnvoye.belongsTo(Campagne, { foreignKey: 'id_campagne' });

module.exports = {
  sequelize,
  Entrepreneur,
  Immeuble,
  Typologie,
  TypePlancher,
  Logement,
  Locataire,
  Campagne,
  JoursDisponible,
  Creneau,
  EmailEnvoye
};
