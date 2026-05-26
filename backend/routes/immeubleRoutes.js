const express = require('express');
const router = express.Router();
const { list, create } = require('../controllers/immeubleController');
const auth = require('../middlewares/auth');

router.get('/', auth, list);
router.post('/', auth, create);

module.exports = router;
