const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const multer = require('multer');
const logger = require('./config/winston');
const path = require('path');

const port = 3000 || process.env.PORT;
const app = express();
app.use(express.json());
app.use(morgan('combined', { stream: logger.stream }));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/templates', express.static('templates'));
app.use('/albums', express.static('albums'));
app.use('/api/album', require('./src/services/album'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/*', (request, response) => {
    fs.readFile('./index.html', (error, contents) => {
        if(error) {
            response.status(500).json({
                msg: error
            });
        }
        else {
            let pathParts = request.originalUrl.split('/');
            let pageName = (pathParts.length > 0 && pathParts[1]) ? pathParts[1] : 'home';
            pageName = path.basename(pageName.replace(/\?.*$/, ''));
            contents = contents.toString('utf8');
            contents = contents.replace(/\{\{page-name\}\}/g, pageName);
            response.status(200).send(contents);
        }
    });
});


// app.engine('html', require('ejs').renderFile);
//
// app.set('view engine', 'html');
// app.set('views', 'dist');
//
// app.use('/', express.static('dist', { index: false }));
//
// app.get('/*', (req, res) => {
// 	   res.render('./index', {req, res});
// });

app.listen(port, () => {
	   console.log(`Listening on: http://localhost:${port}`);
});
