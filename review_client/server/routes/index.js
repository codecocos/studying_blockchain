const express = require('express');
const router = express.Router();

const test = require('./test')
const wallet = require('./wallet')

router.use('/api/test', test)
router.use('/api/wallet', wallet)

module.exports = router;
