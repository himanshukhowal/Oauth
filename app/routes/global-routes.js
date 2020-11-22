var express = require('express');
var router = express.Router();

var googleDrive = require('../oauth/google-drive/google-drive');
router.use('/oauth/google-drive', googleDrive);

var oneDrive = require('../oauth/one-drive/one-drive');
router.use('/oauth/one-drive', oneDrive);

module.exports = router;