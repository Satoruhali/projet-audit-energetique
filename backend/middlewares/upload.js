const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { AppError } = require('./errorHandler');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const MIME_AUTORISES = ['image/jpeg', 'image/png', 'image/svg+xml'];
const TAILLE_MAX = 500 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (MIME_AUTORISES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new AppError('Type de fichier non autorisé (JPG, PNG ou SVG uniquement)', 400));
  },
  limits: { fileSize: TAILLE_MAX }
});

function uploadLogo(req, res, next) {
  upload.single('logo')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Fichier trop volumineux (maximum 500 Ko)', 400));
    }
    return next(err);
  });
}

module.exports = { uploadLogo };
