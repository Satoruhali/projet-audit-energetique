const nodemailer = require('nodemailer');
const { decrypt } = require('./crypto');

let transporterGlobal = null;

function getTransporterGlobal() {
  if (transporterGlobal) return transporterGlobal;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT) || 1025;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && host !== 'smtp.example.com') {
    const transportOpts = { host, port, secure: port === 465 };
    if (user && pass) {
      transportOpts.auth = { user, pass };
    }
    transporterGlobal = nodemailer.createTransport(transportOpts);
  } else {
    transporterGlobal = null;
  }

  return transporterGlobal;
}

function getTransporter(smtpConfig) {
  if (!smtpConfig || !smtpConfig.host) return null;

  const port = smtpConfig.port || 587;
  const transportOpts = {
    host: smtpConfig.host,
    port,
    secure: smtpConfig.secure !== undefined ? smtpConfig.secure : port === 465
  };
  if (smtpConfig.user && smtpConfig.pass) {
    transportOpts.auth = { user: smtpConfig.user, pass: smtpConfig.pass };
  }
  return nodemailer.createTransport(transportOpts);
}

function construireSmtpConfig(entrepreneur) {
  if (!entrepreneur) return null;
  if (!entrepreneur.smtp_host || !entrepreneur.smtp_user) return null;

  let pass = null;
  if (entrepreneur.smtp_pass_encrypted) {
    try {
      pass = decrypt(JSON.parse(entrepreneur.smtp_pass_encrypted));
    } catch (err) {
      console.error('[SMTP] Impossible de déchiffrer le mot de passe SMTP:', err.message);
      return null;
    }
  }

  const port = parseInt(entrepreneur.smtp_port) || 587;
  return {
    host: entrepreneur.smtp_host,
    port,
    user: entrepreneur.smtp_user,
    pass,
    from: entrepreneur.smtp_from || null,
    fromNom: entrepreneur.smtp_from_nom || null,
    secure: port === 465
  };
}

const BASE_URL = process.env.BASE_URL;
const NOM_EQUIPE = "Planif'Audit";

function signature(nomEntreprise) {
  return `L'équipe ${nomEntreprise || NOM_EQUIPE}`;
}

function templateVisiteProgrammee({ prenom, nom, nom_campagne, nom_immeuble, token, nomEntreprise }) {
  const lien = `${BASE_URL}/rendez-vous/${token}`;
  const sujet = `Programmation de votre visite — ${nom_campagne}`;
  const corps = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2>Bonjour ${prenom} ${nom},</h2>
      <p>Un logement que vous occupez dans l'immeuble <strong>${nom_immeuble}</strong> a été sélectionné pour une visite dans le cadre de la campagne <strong>${nom_campagne}</strong>.</p>
      <p>Merci de cliquer sur le lien ci-dessous pour choisir un créneau de visite :</p>
      <p style="text-align: center;">
        <a href="${lien}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;">Choisir un créneau</a>
      </p>
      <p>Ce lien est personnel et valable pour une seule réservation.</p>
      <p>Cordialement,<br>${signature(nomEntreprise)}</p>
    </div>
  `;
  return { sujet, corps };
}

function templatePasDeVisite({ prenom, nom, nom_campagne, nom_immeuble, nomEntreprise }) {
  const sujet = `Information sur votre logement — ${nom_campagne}`;
  const corps = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2>Bonjour ${prenom} ${nom},</h2>
      <p>Nous vous remercions de votre participation à la campagne <strong>${nom_campagne}</strong> pour l'immeuble <strong>${nom_immeuble}</strong>.</p>
      <p>Votre logement n'a pas été retenu pour une visite cette fois-ci. Aucune action n'est nécessaire de votre part.</p>
      <p>Nous vous remercions pour votre confiance.</p>
      <p>Cordialement,<br>${signature(nomEntreprise)}</p>
    </div>
  `;
  return { sujet, corps };
}

function templateRelance({ prenom, nom, nom_campagne, nom_immeuble, token, nomEntreprise }) {
  const lien = `${BASE_URL}/rendez-vous/${token}`;
  const sujet = `Relance — ${nom_campagne}`;
  const corps = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2>Bonjour ${prenom} ${nom},</h2>
      <p>Nous n'avons pas encore reçu votre choix de créneau pour la visite de votre logement dans l'immeuble <strong>${nom_immeuble}</strong> dans le cadre de la campagne <strong>${nom_campagne}</strong>.</p>
      <p>Merci de cliquer sur le lien ci-dessous <strong>dès que possible</strong> pour sélectionner un créneau de visite :</p>
      <p style="text-align: center;">
        <a href="${lien}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px;">Choisir un créneau</a>
      </p>
      <p>Ce lien est personnel et valable pour une seule réservation.</p>
      <p>Cordialement,<br>${signature(nomEntreprise)}</p>
    </div>
  `;
  return { sujet, corps };
}

function templateConfirmation({ prenom, nom, date_visite, heure_debut, heure_fin, nom_immeuble, nom_campagne, nomEntreprise }) {
  const sujet = `Confirmation de votre rendez-vous — ${nom_campagne}`;
  const corps = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2>Bonjour ${prenom} ${nom},</h2>
      <p>Votre rendez-vous pour la visite de votre logement dans l'immeuble <strong>${nom_immeuble}</strong> dans le cadre de la campagne <strong>${nom_campagne}</strong> est confirmé.</p>
      <p><strong>Date :</strong> ${date_visite}</p>
      <p><strong>Créneau :</strong> de ${heure_debut} à ${heure_fin}</p>
      <p>Merci de vous présenter à l'heure convenue. Un email de rappel vous sera envoyé avant la visite.</p>
      <p>Cordialement,<br>${signature(nomEntreprise)}</p>
    </div>
  `;
  return { sujet, corps };
}

async function sendMail({ to, subject, html, smtpConfig, nomEntreprise }) {
  const fromNom = (smtpConfig && smtpConfig.fromNom) || nomEntreprise || NOM_EQUIPE;
  let transport;
  let from;

  if (smtpConfig && smtpConfig.host) {
    transport = getTransporter(smtpConfig);
    from = smtpConfig.from || smtpConfig.user || process.env.SMTP_FROM || 'noreply@planifaudit.fr';
  } else {
    transport = getTransporterGlobal();
    from = process.env.SMTP_FROM || 'noreply@planifaudit.fr';
  }

  if (!transport) {
    console.log(`[EMAIL SIMULÉ] À: ${to}`);
    console.log(`[EMAIL SIMULÉ] Sujet: ${subject}`);
    console.log(`[EMAIL SIMULÉ] Corps: ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    return { success: true };
  }

  try {
    await transport.sendMail({
      from: `"${fromNom}" <${from}>`,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (err) {
    console.error('[EMAIL ERREUR]', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendMail,
  getTransporter,
  construireSmtpConfig,
  templateVisiteProgrammee,
  templatePasDeVisite,
  templateRelance,
  templateConfirmation
};
