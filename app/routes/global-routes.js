var express = require('express');
var router = express.Router();

var googleDrive = require('../oauth/google-drive/google-drive');
router.use('/oauth/google-drive', googleDrive);

module.exports = router;