const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT) || 1025;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && host !== 'smtp.example.com') {
    const transportOpts = { host, port, secure: port === 465 };
    if (user && pass) {
      transportOpts.auth = { user, pass };
    }
    transporter = nodemailer.createTransport(transportOpts);
  } else {
    transporter = null;
  }

  return transporter;
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

function templateVisiteProgrammee({ prenom, nom, nom_campagne, nom_immeuble, token }) {
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
      <p>Cordialement,<br>L'équipe Planif'Audit</p>
    </div>
  `;
  return { sujet, corps };
}

function templatePasDeVisite({ prenom, nom, nom_campagne, nom_immeuble }) {
  const sujet = `Information sur votre logement — ${nom_campagne}`;
  const corps = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2>Bonjour ${prenom} ${nom},</h2>
      <p>Nous vous remercions de votre participation à la campagne <strong>${nom_campagne}</strong> pour l'immeuble <strong>${nom_immeuble}</strong>.</p>
      <p>Votre logement n'a pas été retenu pour une visite cette fois-ci. Aucune action n'est nécessaire de votre part.</p>
      <p>Nous vous remercions pour votre confiance.</p>
      <p>Cordialement,<br>L'équipe Planif'Audit</p>
    </div>
  `;
  return { sujet, corps };
}

function templateRelance({ prenom, nom, nom_campagne, nom_immeuble, token }) {
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
      <p>Cordialement,<br>L'équipe Planif'Audit</p>
    </div>
  `;
  return { sujet, corps };
}

async function sendMail({ to, subject, html }) {
  const transport = getTransporter();

  if (!transport) {
    console.log(`[EMAIL SIMULÉ] À: ${to}`);
    console.log(`[EMAIL SIMULÉ] Sujet: ${subject}`);
    console.log(`[EMAIL SIMULÉ] Corps: ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    return { success: true };
  }

  try {
    await transport.sendMail({
      from: `"Planif'Audit" <${process.env.SMTP_FROM || 'noreply@planifaudit.fr'}>`,
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
  templateVisiteProgrammee,
  templatePasDeVisite,
  templateRelance
};
