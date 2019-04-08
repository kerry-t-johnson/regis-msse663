const express = require('express');
const albumRoutes = require('./AlbumRoutes');
const userRoutes = require('./UserRoutes');

const router = express.Router();

/** GET /api-status - Check service status **/
router.get('/api-status', (req, res) => {
    res.json({status: "ok"});
});

router.use('/album', albumRoutes);
router.use('/user', userRoutes);

module.exports = router;
