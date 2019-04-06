const db = require('./server/models/album');
const app = require('./config/express');
const config = require('./config/env');
const logger = require('./config/winston');
const mongoose = require('mongoose');

f = async function() {
    try {
        await mongoose.connect(config.db, {useNewUrlParser: true});

        app.listen(config.port, () => {
            console.log(`Listening on: http://a.b.c.d:${config.port}`);
        });
    }
    catch(error) {
        logger.error(error);
        process.exit(-1);
    }
}();

module.exports = app;
