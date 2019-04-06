const bodyParser = require('body-parser');
const config = require('./env');
const cookie = require('cookie-parser');
const express = require('express');
const fs = require('fs-extra');
const logger = require('../config/winston');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session')

const session_config = {
    secret: config.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
};

const app = express();

app.use(session(session_config));
app.use(cookie(config.session_secret));
app.use((req, res, next) => {req.user = req.session.user; next()})
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/templates', express.static('templates'));
app.use(config.album_root.replace('./', '/'), express.static(config.album_root));
app.use('/album', express.static('albums'));
app.use('/api', require('../server/routes'));
app.set('trust proxy', 1);
app.use('/logout', (req, res) => {
    req.logout();
    req.session.user = null;
    res.redirect('/');
});

// Default route:
app.use('/*', (request, response) => {
    // NOTE: At runtime, path is relative to site root.
    fs.readFile('./index.html', (error, contents) => {
        if(error) {
            response.status(500).json({msg: error});
        }
        else {
            let pathParts = request.originalUrl.split('/');
            let pageName = (pathParts.length > 0 && pathParts[1]) ? pathParts[1] : 'home';
            pageName = path.basename(pageName.replace(/\?.*$/, ''));
            contents = contents.toString('utf8');
            contents = contents.replace(/{{page-name}}/g, pageName);
            response.status(200).send(contents);
        }
    });
});

module.exports = app;
